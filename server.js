import express from "express"; 
import fetch from "node-fetch";
const app = express();

const APP_ID = "dj00aiZpPU5qSWpOTW9wM09zSyZzPWNvbnN1bWVyc2VjcmV0Jng9M2Y-"; // ←ここにYahooのアプリケーションIDを入れる

// public フォルダを静的ファイルとして公開
app.use(express.static("public"));

// APIの中継
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

// 商品ランキングAPIの中継
app.get("/api/ranking", async (req, res) => {
  // ランキングを取得するカテゴリIDをクエリパラメータから取得
  const categoryId = req.query.category_id || "1"; // カテゴリIDが指定されていない場合は総合（ID:1）を使用
  const url = `https://shopping.yahooapis.jp/ShoppingWebService/V1/highRatingTrendRanking=${APP_ID}&category_id=${categoryId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "APIリクエストに失敗しました" });
  }
});

// サーバー起動
app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
