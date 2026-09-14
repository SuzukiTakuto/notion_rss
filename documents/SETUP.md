# SETUP.md - Forkした人向けセットアップ手順

このリポジトリをForkして自分用のRSS→Notion同期を動かすための手順です。

## 1. リポジトリをFork

GitHub上で対象リポジトリを開き、右上の「Fork」ボタンをクリックして自分のアカウントにコピーする。

## 2. Actionsを有効化

ForkしたリポジトリではActionsがデフォルトで無効になっている。
「Actions」タブを開くと「I understand my workflows, go ahead and enable them」という
ボタンが出るのでクリックする。**これを忘れると「Run workflow」ボタン自体が表示されません。**

## 3. Notionデータベースを作成

Notion上で新規データベースを作り、以下のプロパティを用意する。

| プロパティ名 | 型 |
|---|---|
| タイトル | タイトル |
| URL | URL |
| 公開日 | 日付 |
| フィード元 | マルチセレクト |
| 既読/未読 | チェックボックス |

> **注意**: 「フィード元」はマルチセレクト型で作成してください。セレクト型にしたい場合は、
> `index.js`内の`multi_select`を`select`に書き換える必要があります。

## 4. Notionインテグレーションを作成

[notion.so/my-integrations](https://www.notion.so/my-integrations) で新規インテグレーションを
作成し、Internal Integration Token（`secret_`で始まる文字列）を取得する。

## 5. データベースにインテグレーションを招待

作成したデータベースページ右上の「…」→「コネクト」から、手順4で作ったインテグレーションを
追加する。**これをしないとAPIから書き込めません。**

## 6. データベースIDを取得

データベースを開いた時のURL（`https://www.notion.so/xxxxxxxx?v=yyyy`）の
`xxxxxxxx`部分（ハイフンなし32文字）がDatabase ID。

## 7. GitHub Secretsに登録

Forkしたリポジトリの
**Settings → Secrets and variables → Actions → Repository secrets**
で以下を登録する（**Environments経由ではなくRepository secretsを使うこと**）。

- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`

## 8. FEEDSを編集して動作確認

`index.js`内の`FEEDS`配列を自分が読みたいRSSフィードに書き換えてcommit・push。

```js
const FEEDS = [
  { name: 'GIGAZINE', url: 'https://gigazine.net/news/rss_2.0/' },
  { name: 'ITmedia NEWS', url: 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml' },
];
```

Actionsタブから「Run workflow」で手動実行し、ログとNotion側に記事が追加されているか確認する。

---

## よくあるエラー

| エラー | 原因 |
|---|---|
| `refusing to allow a Personal Access Token to create or update workflow` | 使用しているPATに`workflow`スコープが付いていない |
| `Unauthorized`（401） | `NOTION_TOKEN`のSecret名や値が間違っている |
| `Could not find database`（404） | `NOTION_DATABASE_ID`が違う、またはインテグレーションを招待していない |
| `is expected to be multi_select` | Notion側のプロパティ型とコード側（`select`/`multi_select`）が一致していない |
