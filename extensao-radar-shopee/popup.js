(function () {
  var msg = document.getElementById('msg');
  var btn = document.getElementById('act');

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs && tabs[0];
    var onShopee = tab && tab.url && /:\/\/([^\/]*\.)?shopee\.com\.br/.test(tab.url);

    if (onShopee) {
      msg.innerHTML = 'Você está na Shopee. Clique para abrir o painel <b>Radar</b> e pesquisar um produto.';
      btn.textContent = 'Abrir painel Radar';
      btn.onclick = function () {
        chrome.tabs.sendMessage(tab.id, { rb: 'toggle' }, function () {
          // se o content script ainda nao carregou, apenas fecha o popup
          window.close();
        });
        window.close();
      };
    } else {
      msg.innerHTML = 'O Radar funciona dentro da <b>Shopee</b>. Abra a Shopee, faça login e use o botão rosa no canto inferior direito.';
      btn.textContent = 'Abrir Shopee';
      btn.onclick = function () {
        chrome.tabs.create({ url: 'https://shopee.com.br/' });
        window.close();
      };
    }
  });
})();
