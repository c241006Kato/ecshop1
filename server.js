import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const APP_ID = "dj00aiZpPU5qSWpOTW9wM09zSyZzPWNvbnN1bWVyc2VjcmV0Jng9M2Y-"; 

app.use(express.static(path.join(__dirname, "public")));

// 商品検索APIの中継 (V3)
app.get("/api/search", async (req, res) => {
  const query = req.query.q;
  const sort = req.query.sort;
  let url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${APP_ID}&query=${encodeURIComponent(query)}`;

    // sortパラメータがあればURLに追加
  if (sort === 'price-asc') {
    url += '&sort=-price'; // ✅ 価格の安い順
  } else if (sort === 'price-desc') {
    url += '&sort=+price'; // ✅ 価格の高い順
  }

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
  const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${APP_ID}&query=1位`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.hits) {
      const formattedItems = data.hits.map(item => ({
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
    console.error("ランキングAPIのリクエストに失敗しました:", err);
    res.status(500).json({ error: "ランキングAPIのリクエストに失敗しました" });
  }
});

// ローカル検索APIの中継
app.get("/api/local-search", async (req, res) => {
  const { lat, lon, q: query } = req.query; 

  if (!lat || !lon || !query) {
    return res.status(400).json({ error: "緯度、経度、およびクエリを指定してください。" });
  }

  const url = `https://map.yahooapis.jp/search/local/V1/localSearch?appid=${APP_ID}&query=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&dist=3000`;

  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    res.set('Content-Type', 'text/xml');
    res.send(xmlText);
  } catch (err) {
    console.error("ローカル検索APIのリクエストに失敗しました:", err);
    res.status(500).json({ error: "APIリクエストに失敗しました" });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});