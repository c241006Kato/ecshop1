<?php
// PHPスクリプトのエラー表示設定 (開発時のみ有効にすること)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// !!! あなたのYahoo!ショッピングAPIキーを設定してください !!!
// このAPIキーは絶対にクライアントサイドのJavaScriptに直接記述しないでください。
$yahoo_api_key = dj00aiZpPU5qSWpOTW9wM09zSyZzPWNvbnN1bWVyc2VjcmV0Jng9M2Y-; // ここにあなたのAPIキーを記述

// クライアントからキーワードを取得
$query = isset($_GET['query']) ? $_GET['query'] : '';

if (empty($query)) {
    header('Content-Type: application/json');
    echo json_encode(['error' => '検索キーワードが指定されていません。']);
    exit;
}

// Yahoo!ショッピング商品検索APIのエンドポイントURL
$api_url = "https://shopping.yahooapis.jp/Shopping/V3/itemSearch?appid=" . urlencode($yahoo_api_key) . "&query=" . urlencode($query);

// APIリクエストを実行
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // レスポンスを文字列で受け取る
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json')); // 必要であればヘッダーを設定

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE); // HTTPステータスコードを取得

if (curl_errno($ch)) {
    // cURLエラーの処理
    header('Content-Type: application/json');
    echo json_encode(['error' => 'APIリクエストエラー: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// APIからのレスポンスをそのままクライアントに返す
header('Content-Type: application/json');
echo $response;

?>