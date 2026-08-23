import "dotenv/config";
import Parser from "rss-parser";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

// 監視したいRSSフィードをここに追加してください
const FEEDS = [
  { name: "GIGAZINE", url: "https://gigazine.net/news/rss_2.0/" },
  {
    name: "ITmedia NEWS",
    url: "https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml",
  },
  { name: "Qiita Trends", url: "https://qiita.com/popular-items/feed.atom" },
  { name: "Zenn  Trends", url: "https://zenn.dev/feed" },
  {
    name: "ギズモード",
    url: "https://www.gizmodo.jp/index.xml",
  },
];

const parser = new Parser();

// 同じ記事が既に登録済みかURLで判定（重複防止）
async function alreadyExists(url) {
  const res = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "URL",
      url: { equals: url },
    },
  });
  return res.results.length > 0;
}

async function addArticle(item, sourceName) {
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      タイトル: {
        title: [{ text: { content: item.title ?? "(無題)" } }],
      },
      URL: {
        url: item.link ?? null,
      },
      公開日: item.isoDate ? { date: { start: item.isoDate } } : { date: null },
      フィード元: {
        select: { name: sourceName },
      },
      "既読/未読": {
        checkbox: false,
      },
    },
  });
}

async function processFeed(feed) {
  console.log(`[取得中] ${feed.name}`);
  const parsed = await parser.parseURL(feed.url);

  let addedCount = 0;
  for (const item of parsed.items) {
    if (!item.link) continue;

    const exists = await alreadyExists(item.link);
    if (exists) continue;

    await addArticle(item, feed.name);
    addedCount += 1;
    console.log(`  + 追加: ${item.title}`);
  }
  console.log(`[完了] ${feed.name}: ${addedCount}件追加`);
}

async function main() {
  if (!process.env.NOTION_TOKEN || !databaseId) {
    console.error(
      "NOTION_TOKEN または NOTION_DATABASE_ID が未設定です（.envを確認してください）"
    );
    process.exit(1);
  }

  for (const feed of FEEDS) {
    try {
      await processFeed(feed);
    } catch (err) {
      console.error(`[エラー] ${feed.name}:`, err.message);
    }
  }
}

main();
