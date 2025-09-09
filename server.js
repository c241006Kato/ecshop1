import express from "express"; 
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const APP_ID = "dj00aiZpPU5qSWpOTW9wM09zSyZzPWNvbnN1bWVyc2VjcmV0Jng9M2Y-"; 

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

// ランキングAPIの中継とデータ加工
app.get("/api/ranking", async (req, res) => {
  // output=jsonを追加してJSON形式のレスポンスを要求
  const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/queryitemSearch?appid=${APP_ID}&output=json`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    // ランキングAPIのデータを検索APIの形式に変換
    if (data && data.ranking && data.ranking.items) {
      const formattedItems = data.ranking.items.map(item => ({
        url: item.url,
        image: {
          medium: item.image.medium
        },
        name: item.name,
        price: item.price
      }));
      res.json({ hits: formattedItems });
    } else {
      res.status(404).json({ error: "ランキングデータが見つかりませんでした" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ランキングAPIのリクエストに失敗しました" });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});