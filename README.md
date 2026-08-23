# notion-rss-sync

RSSフィードを定期的に取得し、Notionデータベースへ新着記事を自動追加するスクリプト。

## 事前準備（Notion側）

1. データベースを作成し、以下のプロパティを用意する
   - `タイトル`（タイトル型）
   - `URL`（URL型）
   - `公開日`（日付型）
   - `フィード元`（セレクト型）
   - `既読/未読`（チェックボックス）
2. データベースページ右上の「…」→「コネクト」からインテグレーションを招待する
   （これをしないとAPI経由で書き込めません）
3. データベースIDを取得する
   - データベースを開いた時のURL: `https://www.notion.so/xxxxxxxx?v=yyyy`
   - `xxxxxxxx` の部分（32文字のハイフンなし文字列）が Database ID

## ローカルでの実行方法

```bash
npm install
cp .env.example .env
# .env に NOTION_TOKEN と NOTION_DATABASE_ID を記入
npm start
```

## フィードの追加・編集

`index.js` 内の `FEEDS` 配列に `{ name, url }` を追加するだけです。

```js
const FEEDS = [
  { name: 'GIGAZINE', url: 'https://gigazine.net/news/rss_2.0/' },
  { name: 'ITmedia NEWS', url: 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml' },
];
```

## 定期実行（GitHub Actions）

`.github/workflows/sync.yml` を使うと毎時自動実行されます。

1. このプロジェクトをGitHubリポジトリにpush
2. リポジトリの Settings → Secrets and variables → Actions で以下を登録
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID`
3. 実行間隔は `sync.yml` の `cron` を編集（例: 30分ごとなら `*/30 * * * *`）

## 重複防止の仕組み

記事追加前にNotion側を `URL` プロパティで検索し、既に同じURLが存在すれば
スキップします。RSS側でGUIDが変わるケースは考慮していないため、URLが変わる
フィードでは重複が発生する可能性があります。
