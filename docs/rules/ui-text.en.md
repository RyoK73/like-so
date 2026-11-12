## UI Text Notation Rules

These rules apply to Japanese text shown on screen (buttons, tooltips, toasts, errors, headings, and descriptions) and to the metadata description in `src/app/layout.tsx`.
They define notation only.
They do not define the style of the text (noun endings or the polite form).
Developer-facing text, such as `docs/` and the README, is out of scope.

### Numbers and Units

Do not put a space between a number and its unit.

- Example: `400%`, `30文字以内`
- Avoid: `400 %`, `30 文字以内`

### Alphanumerics

- Use half-width for alphanumerics and symbols (such as `%` and `/`).
- Use full-width for katakana.
- Do not put a space between Japanese text and half-width alphanumerics.
- Example: `LLMに渡す`, `Backspaceキー`
- Avoid: `LLM に渡す`, `Backspace キー`

### Parentheses

Use full-width parentheses （） in Japanese text.

- Example: `確認コード（6桁）`
- Avoid: `確認コード(6桁)`

### Full Stops

Decide whether to put a full stop (`。`) by the number of sentences in one display element (a toast, a `<p>`, a description, and so on).

- If there is only one sentence, do not put a full stop.
  - Example: `保存に失敗しました`
- If there are multiple sentences, put a full stop on every sentence.
  - Example: `倍率は400%以下にしてください。400%に設定しました。`

### Line Breaks

Break the line with `<br />` after each sentence in a multi-sentence description.

```tsx
<p>
  現在はゲストとして利用中です。
  <br />
  サインインすると、現在のゲストのスケッチは表示されなくなります。
</p>
```

### Terminology

Use the terms in the following table for words with the same meaning.

| Use            | Do not use                                                         |
| -------------- | ------------------------------------------------------------------ |
| サインイン     | ログイン                                                           |
| サインアウト   | ログアウト                                                         |
| アカウント登録 | サインアップ, 新規登録                                             |
| スケッチ       | ワイヤーフレーム, 図, キャンバス (when it means the sketch itself) |
| ゲスト         | 匿名ユーザー, ビジター                                             |
