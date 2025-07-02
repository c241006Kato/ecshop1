document.getElementById('searchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const keyword = document.getElementById('keyword').value;
  fetch(`api_proxy.php?query=${encodeURIComponent(keyword)}`)
    .then(res => res.json())
    .then(data => {
      const area = document.getElementById('resultArea');
      area.innerHTML = '';
      if (!data.ResultSet || !data.ResultSet[0]) {
        area.innerHTML = '<p>商品が見つかりませんでした。</p>';
        return;
      }

      const items = data.ResultSet[0].Result;
      for (let key in items) {
        if (key === 'Request') continue; // 無関係なフィールド除外
        const item = items[key];
        const img = item.Image.Medium;
        const name = item.Name;
        const url = item.Url;
        const stock = item.Stock ? '在庫あり' : '在庫なし';

        area.innerHTML += `
          <div>
            <a href="${url}" target="_blank"><img src="${img}" alt="${name}"></a>
            <p>${name}</p>
            <p>${stock}</p>
          </div>
        `;
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById('resultArea').innerHTML = '<p>エラーが発生しました。</p>';
    });
});
