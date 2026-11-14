# 認証

認証にはSupabase Authを使用します。
匿名サインインが有効です(`supabase/config.toml`の`enable_anonymous_sign_ins = true`)。

## セッションの更新

- `src/proxy.ts`が、リクエストごとに`updateSession`(`src/supabase/auth/proxy.ts`)を実行します。
  - 静的ファイルと画像は`matcher`で除外されます。
- `updateSession`は、Supabaseのサーバークライアントを作成し、Cookieを同期します。
  その後、同じクライアントを`getAuthState`に渡して認証状態を判定します。
- 認証状態とパスに応じて、次のようにリダイレクトします。
  パスは前方一致で判定します。
  リダイレクト時も、更新したCookieを引き継ぎます。

| 認証状態     | パス                | 動作                          |
| ------------ | ------------------- | ----------------------------- |
| `signedOut`  | `/sketches`で始まる | `/`へリダイレクトする         |
| `registered` | `/signin`で始まる   | `/sketches`へリダイレクトする |
| `registered` | `/signup`で始まる   | `/sketches`へリダイレクトする |
| `guest`      | すべて              | リダイレクトしない            |

- 上記以外の組み合わせは、リダイレクトしません。

## 認証状態

`getAuthState`(`src/supabase/auth/getAuthState.ts`)は、3つの状態のいずれかを返します。

| 状態         | 条件                               |
| ------------ | ---------------------------------- |
| `signedOut`  | claimsがない                       |
| `guest`      | `is_anonymous` claimがtrue         |
| `registered` | 匿名ではないユーザーがサインイン中 |

- 引数でSupabaseクライアントを受け取ります。
  `updateSession`が作成したCookie同期付きのクライアントを、そのまま使うためです。
- `getClaims`がエラーを返したときは、throwしてNext.jsに処理を任せます。
- `server-only`をimportしているため、サーバーでのみ使用できます。

## サインイン関数

`src/supabase/auth/`に定義されています。
いずれも`Result<void>`を返します。
いずれも、第1引数でSupabaseクライアントを受け取ります。
呼び出し側がクライアントを作成して渡します。
`/signin`と`/signup`のフォームは、ブラウザクライアント(`createSupabaseBrowserClient`)を渡します。

| 関数                                  | 内容                                                             |
| ------------------------------------- | ---------------------------------------------------------------- |
| `signInWithOTP`                       | メールアドレスにワンタイムパスワードを送信します。               |
| `verifyOTP`                           | ワンタイムパスワードを検証します。`type`を指定できます。         |
| `convertAnonymousUserToPermanentUser` | 匿名ユーザーにメールアドレスを追加し、永続ユーザーにします。     |
| `signOut`                             | サインアウトします。`signOutAction`(Server Action)から呼びます。 |

- `verifyOTP`の`type`は、既定値が`email`です。
  `convertAnonymousUserToPermanentUser`が送ったコードは、`email_change`で検証します。
- `signInWithOTP`は`shouldCreateUser: true`です。
  アカウントがなければ作成されます。

## サインインとゲスト登録

`/signin`と`/signup`は、`src/auth-form/`の`AuthPage`を表示します。
`AuthPage`はServer Componentです。
`getAuthState`で認証状態を取得し、`guest`かどうかを`AuthForm`に渡します。
`AuthForm`はClient Componentです。

- フォームは、同じページの中で「メールアドレスの入力」と「コードの入力」を切り替えます。
  コードを送信したあとは、メールアドレスを読み取り専用で残し、コード欄を表示します。
  「メールアドレスを変更」で入力に戻れます。
- 未サインインの場合は、`/signin`と`/signup`のどちらも、`signInWithOTP`でコードを送ります。
  違いは文言だけです。
  コードは`verifyOTP`(`type: "email"`)で検証します。
- ゲストが`/signup`を開いた場合は、`convertAnonymousUserToPermanentUser`でコードを送ります。
  同じ`user.id`のまま、メールアドレスが紐付きます。
  コードは`verifyOTP`(`type: "email_change"`)で検証します。
- ゲストが`/signin`を開いた場合は、通常のサインインです。
  別のアカウントでサインインすると、`user.id`が切り替わります。
  ゲストのスケッチはDBに残りますが、表示されなくなります。
  そのため、フォームに注意文を表示します。
- 再送は、コードの送信と同じ関数をもう一度呼びます。
  成功したらtoastを表示します。
  再送のクールダウンはありません。
  送信中は、ボタンを無効にします。
- 検証に成功したら、`/sketches`へ遷移します(`router.push`のあとに`router.refresh`)。
- エラーは、フォーム内に`role="alert"`で表示します(`src/auth-form/auth-error.ts`)。

| エラーコード                 | 意味                                           | 表示                                    |
| ---------------------------- | ---------------------------------------------- | --------------------------------------- |
| `email_exists`               | ゲストの登録で、登録済みのメールアドレスを使用 | 登録済みである旨と、`/signin`へのリンク |
| `over_email_send_rate_limit` | 短時間にコードを送信しすぎた                   | しばらく待つよう促す                    |
| `otp_expired`                | コードが違う、または期限切れ                   | コードが正しくないか、期限切れである旨  |
| `validation_failed` ほか     | メールアドレスの形式が不正                     | 形式を確認するよう促す                  |
| 上記以外                     | 通信失敗など                                   | 時間をおいてやり直すよう促す            |

- `email_exists`は、登録済みかどうかが分かります。
  ゲストの登録経路でだけ、メールアドレスの登録有無が判別できます。
  この点は許容しています。
- ゲストと既存アカウントを統合する機能は、ありません。

### メールの設定

OTP(6桁のコード)で認証するため、メールにコードを載せます。

- `supabase/templates/`に、コードを表示するテンプレートを置いています。
  `supabase/config.toml`の`[auth.email.template.*]`から参照しています。

| テンプレート   | 送信される場面                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `magic_link`   | 既存アカウントへの`signInWithOTP`(sign-in,sign-up), ゲストのsign-in( 別のアカウントへのサインイン) |
| `email_change` | ゲストの`convertAnonymousUserToPermanentUser`                                                      |

- `supabase/config.toml`の`[auth.email]`は、`enable_confirmations = false`、`double_confirm_changes = true`です。
- `config.toml`にテンプレートを定義しているのは、`magic_link`と`email_change`です。
- この設定は、ローカルのSupabaseに適用されます。
  `pnpm exec supabase config push`でリモートのSupabaseにも適用します。

## Server Actionでの匿名サインイン

新規作成の`startNewSketch`は、`signedOut`の場合に、Server Actionの中で匿名サインインします。
詳細は[ルーティング](./routing.ja.md)を参照してください。

- 匿名サインインは、`signInAnonymouslyWithForwardedIp`(`src/supabase/auth/anonymousSignIn/`)だけで行います。
  サーバー専用で、`Result<void>`を返します。
- サインインの前に、Vercel BotIDでBotかどうかを判定します。
  匿名ユーザーを作り直して、ユーザー単位の件数上限を回避されることを防ぐためです。
  - サーバー側: `signInAnonymouslyWithForwardedIp`の先頭で、`checkBotId()`(`botid/server`)を引数なしで呼びます。
    `isBot`が`true`の場合は、`ok: false`を返し、サインインしません。
    `checkBotId()`が例外を投げた場合は、捕まえずにそのまま伝えます。
  - クライアント側: `src/instrumentation-client.ts`で、`initBotId`に`/`への`POST`を登録します。
    BotIDは、登録したパスへのリクエストにだけ、判定用のヘッダーを付けます。
    Server Actionは、呼び出したページのパスへの`POST`として送られます。
    匿名サインインに入れるのは、未ログインのユーザーが見られるランディングページ(`/`)のボタンだけです。
    `/sketches`配下は、未ログインのユーザーを`proxy.ts`がリダイレクトします。
  - 検知レベル(`checkLevel`)は指定しません。
  - `signInWithOTP`は、ブラウザからSupabaseを直接呼び、Server Actionを通らないため、BotIDの対象外です。
- Server Action内でサインインすると、Supabase Authの匿名サインインのレート制限が、ユーザーではなくサーバーのIPで集計されます。
  これを防ぐため、Supabaseの[IP address forwarding](https://supabase.com/docs/guides/auth/rate-limits#ip-address-forwarding)を使い、ユーザーのIPを渡します。
  1. `headers()`から`x-forwarded-for`を読みます。
     Vercelでは、この値は常にクライアントの単一のIPで上書きされます。
     これは、デプロイしたVercelプロジェクト(Hobbyプラン、Node.jsランタイム)に、複数のIP、空文字、IPではない文字列など25パターンのヘッダーを送って確認しました。
  2. 前後の空白を除いた値が、単一の有効なIP(IPv4またはIPv6)の場合だけ使います(`parseForwardedIp`、`forwardedIpSchema`)。
     複数のIP(`a, b`)、ポート付きのIP、IPではない文字列は、ヘッダーがない場合と同じ扱いにします。
  3. サインイン専用クライアント(`createSupabaseSecretActionClient`、`secretActionClient.ts`)を作ります。
     このクライアントは、secret key(`SUPABASE_SECRET_KEY`)を使い、`sb-forwarded-for`ヘッダーにIPを載せます。
     secret keyがないと、Supabaseはこのヘッダーを受け付けません。
  4. そのクライアントで`signInAnonymously`を呼びます。
- `x-forwarded-for`がない場合、または単一の有効なIPではない場合の動作は、環境で異なります。
  - 本番(`NODE_ENV`が`production`): Vercelでは必ず単一の有効なIPが付くため、それ以外は異常です。
    サーバーのIPで集計される状態に黙って戻らないように、`ok: false`を返し、サインインしません。
  - 本番以外(ローカル開発、テスト): `sb-forwarded-for`を付けずにサインインします。
- `SUPABASE_SECRET_KEY`が未設定の場合は、zodの検証が例外を投げます。
- secret keyを使うのは、このサインイン専用クライアントだけです。
  secret keyはRLSをバイパスするため、サインイン後のDB操作には使いません。
- サインイン後のDB操作には、`createSupabaseAnonActionClient`(`src/supabase/utils/anonActionClient.ts`)を使います。
  anonキーを使うため、RLSが有効です。
  このクライアントは、Cookieを読み書きできます。
  サインインは別のクライアントで行うため、サインインの前に作ったクライアントは新しいセッションを知りません。
  そのため、サインインした場合は、サインイン後に`createSupabaseAnonActionClient`を作り直します。
- `createSupabaseServerClient`(`src/supabase/utils/serverClient.ts`)は、Cookieの読み取り専用です。
  Server Componentで使用します。
  トークンの更新は`proxy.ts`が担当します。

## テストの設定

- `server-only`は、Next.jsの外でimportするとエラーになります。
- `vitest.config.mts`で、空のモジュールである`src/test/emptyModule.ts`に差し替えています。

## 認可

- 匿名ユーザーも、DBでは`authenticated`ロールを使用します。
- データへのアクセスはRLSで制限されます。
  詳細は[データベース](./database.ja.md)を参照してください。
