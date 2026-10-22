---
version: alpha
name: Like-so
description: アイデアをその場でスケッチしてLLMに渡すためのツール。方眼紙の上に、墨の線と絵の具の跡で描いたような、シンプルで手描きのデザイン。ライトを主体とし、ダークも暗くしすぎない。
colors:
  primary: "#1E1A16"
  background: "#F8F7F3"
  foreground: "#1E1A16"
  card: "#FDFCFA"
  muted: "#EFECE8"
  accent: "#ECE9E4"
  muted-foreground: "#67635D"
  border: "#DDDAD5"
  input: "#D3D1CB"
  ring: "#847F7A"
  destructive: "#BE2323"
  brand: "#1F5DC2"
  ink: "#1E1A16"
  paint-blue: "#2F6DD3"
  paint-green: "#4AC06C"
  paint-yellow: "#F9D544"
  paint-red: "#E6443A"
  canvas: "#FDFCFA"
  canvas-grid: "#E6E4E0"
  grid-line: "#E0DED8"
  background-dark: "#2C2A27"
  foreground-dark: "#EDEBE7"
  card-dark: "#363431"
  muted-dark: "#3E3B38"
  accent-dark: "#44423F"
  muted-foreground-dark: "#A7A49F"
  destructive-dark: "#F7857D"
  brand-dark: "#7CB4FC"
typography:
  headline-lg:
    fontFamily: Zen Kurenaido
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Zen Kurenaido
    fontSize: 30px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.025em
  body-md:
    fontFamily: Zen Kurenaido
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-md:
    fontFamily: Zen Kurenaido
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: 6px
  md: 10px
  lg: 14px
  brush-a: 255px 15px 225px 15px / 15px 225px 15px 255px
  brush-b: 15px 225px 15px 255px / 255px 15px 225px 15px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  grid: 64px
components:
  brush-frame:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.brush-a}"
    padding: 20px
  brush-frame-mirrored:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.brush-b}"
    padding: 20px
  button-default:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.label-md}"
    rounded: "{rounded.brush-a}"
    height: 64px
    padding: 20px
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.brush-a}"
    height: 64px
    padding: 20px
  button-icon:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    size: 40px
  tooltip:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: 8px 12px
  navigation-menu:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.brush-a}"
    padding: 8px
  canvas-frame:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
---

## Overview

Like-so は、思いついたアイデアをその場でスケッチして、そのままLLMに渡すためのキャンバスです。
デザインの核は、README に書かれた「シンプルで速い」ことです。
機能が増えても UI を重くせず、アイデアが浮かんだ瞬間に描き始められる軽さを保ちます。

見た目は、方眼紙の上に墨の線で描いたノートやスケッチブックを手本にします。
色は墨(ほぼ黒)と少し温かい紙の白を基調にし、彩りは絵の具の跡のような小さな差し色にとどめます。
シンプルでも、物足りなさや手抜きに見えないように、枠線の歪みと小さな傾き、方眼の背景で、手で描いた質感を出します。

以前のデザインはゲーム(shapez)へのオマージュでしたが、今回の決定稿でそれを置き換えました。
`shape-*` の色、強い角丸、タイル感の記述は廃止しています。

## Colors

ライトを主体とし、ダークも用意します。
トークン名は shadcn の変数名(`--background`、`--foreground`、`--card` など)を起点にしています。
`-dark` の接尾辞があるトークンはダーク用の値で、接尾辞がないものはライト用、または両モード共通です。

- 既定はライトです(`ThemeProvider` の `defaultTheme="light"`)。
  ユーザーはナビゲーションメニューのボタンで、ライトとダークを切り替えます。
- 描画面は、ダークモードでも明るいままにします。
  書き出した画像が、モードによって変わらないようにするためです。

### Shared

- **primary / foreground (`#1E1A16`)**: 墨の色です。
  文字、枠線、主要ボタンの塗りに使います。
  アクセントは墨だけで、青などの色を主要操作に使いません。
- **brand (`#1F5DC2`)**: 設計図の青です。
  今のところ、見出しの強調などの限られた箇所のための、唯一の有彩色のトークンです。
- **ink (`#1E1A16`)**: 絵の具の色の上に置く文字の色です。
  `foreground` と違い、ダークモードでも反転せず、常に暗い色です。
- **paint-\***: 青・緑・黄・赤の絵の具の跡です。
  枠線の角に、半透明の小さな丸として重ねる飾りに使います。
  `paint-yellow` だけは、ナビゲーションメニューの現在地を示す蛍光ペン風の塗りにも使います(文字は `ink`)。
- **destructive (`#BE2323`)**: エラーと削除です。
  意味を持つ色は、これだけです。
  成功を表す色は設けず、アイコンや文言で表します。
- **canvas (`#FDFCFA`) / canvas-grid (`#E6E4E0`)**: 描画面の紙と、そのグリッド線です。
  グリッドの間隔は、スケッチごとの `cell_size`(スナップ幅)に合わせます。

### Light mode

- **background (`#F8F7F3`)**: ページの地の色で、少し温かい白です。
- **card (`#FDFCFA`)**: ブロック、メニュー、入力欄の中です。
  背景より少し明るくして、方眼の線を隠します。
- **muted (`#EFECE8`) / accent (`#ECE9E4`)**: hover や控えめな面に使います。
- **muted-foreground (`#67635D`)**: 補助的な文字です。
- **border (`#DDDAD5`) / input (`#D3D1CB`) / ring (`#847F7A`)**: 細い区切り、入力欄の枠、フォーカスリングです。
- **grid-line (`#E0DED8`)**: ページ背景の方眼の線です。
  スケッチ詳細ページでは、描画面を引き立てるために、より薄い色(`grid-line-faint`)を使います。

### Dark mode

暗すぎない、持ち上げた炭色です。
真っ黒は使いません。

- **background-dark (`#2C2A27`) / card-dark (`#363431`)**: ページとブロックです。
- **foreground-dark (`#EDEBE7`)**: 文字と枠線です。
- **muted-dark (`#3E3B38`) / accent-dark (`#44423F`)**: hover と控えめな面です。
- **muted-foreground-dark (`#A7A49F`)**: 補助的な文字です。
- **destructive-dark (`#F7857D`) / brand-dark (`#7CB4FC`)**: ダーク用に明るくした値です。
- 区切りと方眼の線は、白の低い不透明度(border は12%、grid-line は8%)で表します。

## Typography

`layout.tsx` で、`next/font/google` から Zen Kurenaido と Yomogi を読み込んでいます。
`html` に適用されているのは Zen Kurenaido です(Yomogi は読み込み済みですが、現状は使っていません)。
手書きの柔らかい字形で、スケッチの雰囲気に合わせます。

- **headline-lg**: ランディングページの主見出し。
- **headline-md**: セクション見出し。
- **body-md**: 本文。
- **label-md**: ボタンとツールチップのラベル。太字で、小さく使っても読みやすくします。

## Layout

背景に、64px の大きな方眼(`--grid-size`)を敷きます。
線は、水平方向の中央に1本通る位置から始まるので、中央寄せの内容は方眼に揃います。
ブロックは、この方眼のマスに沿って配置します。

- ランディングページは、14列の方眼(幅は偶数マスに切り下げ、最大 896px)に、ブロックを列と行で指定して置きます。
  ボタンは、方眼の中のセルとして配置します。
- 画面幅が狭い場合(md 未満)は、方眼への配置をやめて、縦に積みます。
- スペーシングは、4px を基準にした 4 / 8 / 16 / 24 / 48 に、方眼の 64px を加えたものです。
- 本文は、行数によって高さが変わるため、方眼の縦位置には厳密には揃いません。
  揃えるのは、ブロックの枠やボタンなどの箱です。

## Elevation & Depth

奥行きは、細い線と、ごく弱い影で表します。
強い影は使いません。

- ブロックとメニューは、墨の枠線で面を区切ります。
- 浮かせたい要素(ナビゲーションメニュー、ツールチップなど)だけに、弱い影(`shadow-float`)を使います。
- 押したボタンは、少し沈みます。

## Shapes

枠線は、定規で引いたものではなく、手で描いたように歪ませます。
`brush-a` と `brush-b` の2種類があり、鏡像の関係です。

- **brush-a**: 角丸が `255px 15px 225px 15px / 15px 225px 15px 255px`。
  1度だけ左に傾け、2pxの墨の枠線を付けます。
- **brush-b**: 角丸が `15px 225px 15px 255px / 255px 15px 225px 15px`。
  1度だけ右に傾け、2pxの墨の枠線を付けます。
- 並べる枠には、`brush-a` と `brush-b` を交互に使うと、整いすぎずにまとまります。
- 上記を、`globals.css` のユーティリティ(`brush-a`、`brush-b`)として定義しています。
- 一覧の項目など、傾けたくない場所では `rotate-0` で傾きを消します。
- 角丸が小さい標準の要素(ツールチップ、描画面など)は、`md` と `lg` を使います。

## Components

- **brush-frame**: 手描き風の枠です。
  塗りは `card`、文字は `foreground` です。
  角に、絵の具の跡(青・緑・黄・赤)を半透明で重ねられます。
- **button-default**: 主要な操作です。
  墨の塗りに、背景色の文字を重ねます。
  標準の高さは 64px(方眼の1マス)で、hover すると少し傾きます。
- **button-outline**: 副次的な操作です。
  塗りは背景のままで、墨の枠線だけを持ちます。
- **button-icon**: アイコンだけのボタンで、手描き風の枠は付けません。
  大きさは、呼び出し側のクラス(ナビゲーションメニューでは 40px)で決めます。
- **tooltip**: アイコンだけの操作の名前を、hover で見せる吹き出しです。
  `foreground` の塗りに `background` の文字を重ね、小さな矢印を付けます。
- **navigation-menu**: 画面の左側に固定された、縦のメニューです。
  `card` の塗りと `brush-a` の枠で、サインイン状態によって項目が変わります。
- **canvas-frame**: 描画面です。
  常に明るい紙の色で、`cell_size` に合わせたグリッド線を CSS で描きます。
  Fabric.js の背景は透明にしています。
- **sketch-list item**: スケッチ一覧の項目です。
  `brush-a` の枠ですが、傾きは消しています。

## Do's and Don'ts

コントラスト比は、WCAG の式で計算した値です。

### Both modes

- 主要な操作の塗りは、墨の `foreground` にします。
  青などの色を、主要ボタンの塗りに使わないでください。
- 文字の背景に使える `paint-*` は、`paint-yellow` と `paint-green` だけです。
  `ink` の文字との比は、`paint-yellow` が 12.04:1、`paint-green` が 7.45:1 で、AA を満たします。
- `paint-blue` と `paint-red` は、文字の背景に使わないでください。
  `ink` の文字との比が、`paint-blue` は 3.50:1、`paint-red` は 4.32:1 で、通常の文字の基準(4.5:1)を満たしません。
  この2色は、枠の角に重ねる飾り専用です。
- 方眼の線(`grid-line`)は、装飾です。
  背景との比は 1.25:1 と低く、情報を伝える線には使わないでください。
- 描画面は、ダークモードでも明るいままにしてください。
- 傾きや歪みは、1画面に多くを置かないでください。
  ブロックは数個にとどめ、読みやすさを優先します。

### Light mode

- 本文は `foreground` を使ってください。
  `background` の上で 16.13:1 です。
- 補助的な文字は `muted-foreground` を使えます。
  `card` の上で 5.82:1 で、AA(4.5:1)を満たします。
- エラーと削除は `destructive` を使ってください。
  `background` の上で 5.67:1 です。
- 青の文字は `brand` を使えます。
  `background` の上で 5.76:1 です。

### Dark mode

- 本文は `foreground-dark` を使ってください。
  `background-dark` の上で 12.02:1 です。
- 補助的な文字は `muted-foreground-dark` を使えます。
  `card-dark` の上で 5.00:1 で、AA を満たします。
- エラーと削除は `destructive-dark` を使ってください。
  `background-dark` の上で 5.86:1 です。
- 青の文字は `brand-dark` を使えます。
  `background-dark` の上で 6.67:1 です。
