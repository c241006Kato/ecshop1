<?php
// PHPスクリプトのエラー表示設定 (開発時のみ有効にすること。本番環境では無効にしてください)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// !!! あなたのYahoo!デベロッパーネットワークで取得した情報を設定してください !!!
$client_id = 'dj00aiZpPU5qSWpOTW9wM09zSyZzPWNvbnN1bWVyc2VjcmV0Jng9M2Y-';       // ここにあなたのClient IDを記述
$client_secret = 'Wo8ho7Aip1pdu8Z5tSjjdhIdnlSoxZpTHnMfynw2'; // ここにあなたのClient Secretを記述

// Yahoo! OAuth 認証エンドポイント
$token_url = 'https://auth.login.yahoo.co.jp/yconnect/v2/token';
// Yahoo!ショッピング商品検索APIのエンドポイントURL (これは同じままでOK)
$api_base_url = "https://shopping.yahooapis.jp/Shopping/V3/itemSearch";

// クライアントからキーワードを取得
$query = isset($_GET['query']) ? $_GET['query'] : '';

if (empty($query)) {
    header('Content-Type: application/json');
    echo json_encode(['error' => '検索キーワードが指定されていません。']);
    exit;
}

// 1. アクセストークンを取得 (Client Credentials Grant)
$token_ch = curl_init();
curl_setopt($token_ch, CURLOPT_URL, $token_url);
curl_setopt($token_ch, CURLOPT_POST, true);
curl_setopt($token_ch, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'client_credentials',
    'client_id' => $client_id,
    'client_secret' => $client_secret,
    // スコープはAPIによって異なる可能性があるため、Yahoo!のドキュメントを確認
    // 'scope' => 'openid profile' // 例: ユーザー情報へのアクセスなど
]));
curl_setopt($token_ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($token_ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded'
]);

$token_response = curl_exec($token_ch);
$token_http_code = curl_getinfo($token_ch, CURLINFO_HTTP_CODE);

if (curl_errno($token_ch)) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'アクセストークン取得エラー: ' . curl_error($token_ch)]);
    curl_close($token_ch);
    exit;
}
curl_close($token_ch);

$token_data = json_decode($token_response, true);

if ($token_http_code !== 200 || !isset($token_data['access_token'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'アクセストークン取得失敗', 'details' => $token_data]);
    exit;
}

$access_token = $token_data['access_token'];

// 2. アクセストークンを使用して商品検索APIを呼び出す
$api_url = $api_base_url . "?query=" . urlencode($query) . "&hits=20"; // 例として20件取得

$api_ch = curl_init();
curl_setopt($api_ch, CURLOPT_URL, $api_url);
curl_setopt($api_ch, CURLOPT_RETURNTRANSFER, true);
// Authorization ヘッダーにアクセストークンを含める
curl_setopt($api_ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $access_token,
    'Content-Type: application/json' // 必要であれば
]);

$response = curl_exec($api_ch);
$api_http_code = curl_getinfo($api_ch, CURLINFO_HTTP_CODE);

if (curl_errno($api_ch)) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'APIリクエストエラー: ' . curl_error($api_ch)]);
    curl_close($api_ch);
    exit;
}
curl_close($api_ch);

// APIからのレスポンスをそのままクライアントに返す
header('Content-Type: application/json');
echo $response;

?>