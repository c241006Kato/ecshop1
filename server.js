import express from "express"; 
import fetch from "node-fetch"; 
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const APP_ID = "dj00aiZpPU5qSWpOTW9wM09zSyZzPWNvbnN1bWVyc2VjcmV0Jng9M2Y-"; // TODO: ここにあなたのアプリケーションIDを設定してください

app.use(express.static(path.join(__dirname, "public")));

// 商品検索APIの中継 (V3)
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

// ランキングAPIの中継とデータ加工 (デバッグログを追加)
app.get("/api/ranking", async (req, res) => {
  const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${APP_ID}&query=1位`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    // デバッグ用: サーバーのコンソールにAPIの応答内容を出力
    console.log("Yahoo! APIからの応答データ:", JSON.stringify(data, null, 2));

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
      console.error("エラー: data.hits プロパティが見つかりません。");
      res.status(404).json({ error: "ランキングデータが見つかりませんでした" });
    }
  } catch (err) {
    console.error("ランキングAPIのリクエストに失敗しました:", err);
    res.status(500).json({ error: "ランキングAPIのリクエストに失敗しました" });
  }
});

// Yahoo!ロコAPIの中継
app.get("/api/local-search", async (req, res) => {
  // クライアントから送られてくる緯度、経度、検索クエリを取得
  const { lat, lon, query = "ラーメン" } = req.query; 

  // 緯度と経度がなければエラーを返す
  if (!lat || !lon) {
    return res.status(400).json({ error: "緯度と経度を指定してください。" });
  }

  const url = `https://map.yahooapis.jp/search/local/V1/localSearch?appid=${APP_ID}&query=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&dist=3000&gc=0102008`; // gc=0102008 はラーメン店の業種コード

  try {
    const response = await fetch(url);
    const text = await response.text();
    // Yahoo!ロコAPIはXMLを返すため、そのままクライアントに返却
    res.set('Content-Type', 'text/xml');
    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "APIリクエストに失敗しました" });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});