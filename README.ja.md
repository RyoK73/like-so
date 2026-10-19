[English](./README.md) | 日本語

# Like-so - 言葉にできないものを、スケッチで。

ひらめいたアイデアをその場でスケッチし、そのままLLMに渡すためのキャンバスです。

## 作った理由

自然言語は、人間とLLMの優れた共通言語です。
それでも、ひらめきやイメージのような主観的なものを言葉にすると、言語化しにくい部分が抜け落ちてしまいがちです。

たとえば、「左にサイドバーがあって、その右にカードが並んでいて……」と文章で説明するよりも、
3秒でスケッチしたほうが、速くて正確なことがあります。

このプロジェクトは、そのラグを極限まで減らすことを目指します。

_Like-so_ は、言葉になる前のアイデアを、そのままLLMとの会話に持ち込むためのツールです。

## 大切にしていること: シンプルさと速さ

Figma、Canva、Excalidrawは、どれも優れたツールです。
_Like-so_ は、機能の数で競いません。
その代わり、ツールが多機能になるほど失われがちな、シンプルさと速さに集中します。

## 想定するユースケース

- アプリの画面を簡単にスケッチし、LLMへの指示として渡す。
- モックの画像を、資料やプレゼンテーションに載せる。
- 自分のイメージを、他の人に共有する。

## 思想

この思想は、私自身のエディタの経験から来ています。
多機能なエディタからVimに移ったとき、キャッチコピーが約束する _思考の速さで編集する_ 感覚を味わいました。
それ以来、必要な機能だけを一つずつ足し、Vimのシンプルさを保ちながら、より快適に使えるようにしてきました。

## 設計方針

- 機能だけでなく、設計においてもシンプルさを重視
- データベースの権限とロールは、最小権限の原則に準拠
  - 個々の権限の範囲が小さいほど、脆弱性や設計ミスが入り込む余地は小さくなります。

## 開発者向け

セットアップ、アーキテクチャ、コーディング規約は[`docs/`](./docs)にあります。

- セットアップ
  - [前提ツール](./docs/setup/prerequisites.ja.md)
  - [環境変数](./docs/setup/environment.ja.md)
  - [データベース](./docs/setup/database.ja.md)
  - [開発](./docs/setup/development.ja.md)
- アーキテクチャ
  - [概要](./docs/architecture/overview.ja.md)
  - [ルーティング](./docs/architecture/routing.ja.md)
  - [認証](./docs/architecture/auth.ja.md)
  - [データベース](./docs/architecture/database.ja.md)
  - [スケッチの保存](./docs/architecture/save.ja.md)
  - [ナビゲーションメニュー](./docs/architecture/navigation-menu.ja.md)
- 規約
  - [ディレクトリ構成](./docs/rules/directory-structure.ja.md)
  - [命名](./docs/rules/naming.ja.md)
  - [TypeScript](./docs/rules/typescript.ja.md)
