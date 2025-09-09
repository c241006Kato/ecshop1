import express from "express"; 
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// あなたのYahoo!アプリケーションIDを設定してください
const APP_ID = "dj00aiZpPU5qSWpOTW9wM09zSyZzPWNvbnN1bWVyc2VjcmV0Jng9M2Y-"; 

// publicディレクトリを静的ファイルとして提供
app.use(express.static(path.join(__dirname, "public")));

// 商品検索APIの中継
app.get("/api/search", async (req, res) => {
  const query = req.query.q;
  const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${APP_ID}&query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "APIリクエストに失敗しました" });
  }
});

// ⭐ ランキングAPIの中継を追加
app.get("/api/ranking", async (req, res) => {
  // Yahoo!ショッピングの週間総合ランキングAPI
  const url = `https://shopping.yahooapis.jp/ShoppingWebService/V2/queryRanking?appid=${APP_ID}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ランキングAPIのリクエストに失敗しました" });
  }
});

// サーバー起動
app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
