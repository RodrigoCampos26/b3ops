/* ============================================================
   Radar Shopee · Rosa Baby
   Roda dentro de shopee.com.br. Coleta: preco, total vendido,
   data de criacao do anuncio (ctime), vendas/dia, loja, avaliacoes.
   Exporta JSON para colar na aba "Importar" do app.
   ============================================================ */
(function () {
  "use strict";
  if (window.__rbRadar) return;          // evita injetar duas vezes
  window.__rbRadar = true;

  var collected = [];                    // produtos coletados (selecionaveis)

  // ---------- utilidades ----------
  function brl(n){ return isFinite(n) ? "R$ " + Number(n).toFixed(2) : "—"; }
  function daysBetween(unixSec){
    var d = (Date.now()/1000 - unixSec) / 86400;
    return Math.max(1, Math.round(d));
  }
  function fmtDate(unixSec){
    try { return new Date(unixSec*1000).toLocaleDateString('pt-BR'); }
    catch(e){ return "—"; }
  }
  // a API da Shopee guarda preco como inteiro * 100000
  function price(v){ return (Number(v)||0) / 100000; }

  function normalize(it){
    // it = item_basic (busca) OU item (pagina de produto)
    var ctime    = it.ctime || it.create_time || 0;
    var sold     = it.historical_sold != null ? it.historical_sold : (it.sold || 0);
    var rating   = it.item_rating ? (it.item_rating.rating_star || 0) : 0;
    var rcount   = it.item_rating && it.item_rating.rating_count ? (it.item_rating.rating_count[0] || 0) : 0;
    var days     = ctime ? daysBetween(ctime) : null;
    var perDay   = (days && sold) ? +(sold / days).toFixed(2) : null;
    var pr        = price(it.price);
    return {
      nome: it.name || "",
      preco: +pr.toFixed(2),
      totalVendido: sold,
      vendasPorDia: perDay,
      criadoEm: ctime ? fmtDate(ctime) : null,
      diasNoAr: days,
      avaliacao: +Number(rating).toFixed(1),
      qtdAvaliacoes: rcount,
      loja: it.shop_location || "",
      shopid: it.shopid || it.shop_id || null,
      itemid: it.itemid || it.item_id || null,
      url: (it.shopid && it.itemid)
        ? "https://shopee.com.br/product/" + it.shopid + "/" + it.itemid
        : location.href
    };
  }

  // ---------- chamadas a API interna da Shopee (mesma origem, com cookies) ----------
  async function apiSearch(keyword, limit){
    var url = "https://shopee.com.br/api/v4/search/search_items"
      + "?by=relevancy&keyword=" + encodeURIComponent(keyword)
      + "&limit=" + (limit||40) + "&newest=0&order=desc"
      + "&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2";
    var r = await fetch(url, {
      credentials: "include",
      headers: { "x-api-source": "pc", "x-requested-with": "XMLHttpRequest", "af-ac-enc-dat": "" }
    });
    var j = await r.json();
    if (!j || j.error || !j.items) {
      throw new Error("A Shopee nao retornou resultados (codigo " + (j && j.error) + "). Tente 'Coletar pagina atual'.");
    }
    return j.items.map(function(x){ return normalize(x.item_basic || x); });
  }

  async function apiItem(shopid, itemid){
    var url = "https://shopee.com.br/api/v4/item/get?itemid=" + itemid + "&shopid=" + shopid;
    var r = await fetch(url, {
      credentials: "include",
      headers: { "x-api-source": "pc", "x-requested-with": "XMLHttpRequest" }
    });
    var j = await r.json();
    if (!j || !j.item) throw new Error("Nao consegui ler este anuncio pela API.");
    return normalize(j.item);
  }

  // ---------- fallback: raspar os cards visiveis da pagina atual ----------
  function scrapePage(){
    var out = [], seen = {};
    document.querySelectorAll('a[href*="-i."]').forEach(function(a){
      var m = a.href.match(/i\.(\d+)\.(\d+)/);
      if (!m) return;
      var key = m[1] + "_" + m[2];
      if (seen[key]) return; seen[key] = 1;
      var card = a.closest('li, div[data-sqe], [class*="shopee-search-item-result__item"]') || a.parentElement;
      var txt = (card ? card.innerText : a.innerText) || "";
      var pm = txt.match(/R\$\s*([\d.]+,\d{2})/);
      var sm = txt.match(/([\d.,]+)\s*(mil)?\s*vendid/i);
      var sold = null;
      if (sm){
        sold = parseFloat(sm[1].replace(/\./g,'').replace(',','.'));
        if (/mil/i.test(sm[2]||"")) sold = sold * 1000;
        sold = Math.round(sold);
      }
      out.push({
        nome: (a.getAttribute('title') || a.innerText || "").trim().slice(0,120),
        preco: pm ? +pm[1].replace(/\./g,'').replace(',','.') : null,
        totalVendido: sold,
        vendasPorDia: null, criadoEm: null, diasNoAr: null,
        avaliacao: null, qtdAvaliacoes: null, loja: "",
        shopid: m[1], itemid: m[2],
        url: "https://shopee.com.br/product/" + m[1] + "/" + m[2]
      });
    });
    if (!out.length) throw new Error("Nenhum produto encontrado nesta pagina. Abra uma pagina de busca ou de loja da Shopee.");
    return out;
  }

  // ---------- UI ----------
  var open = false;
  var fab = document.createElement("button");
  fab.id = "rb-fab";
  fab.textContent = "Radar";
  document.body.appendChild(fab);

  var panel = document.createElement("div");
  panel.id = "rb-panel";
  panel.innerHTML = ''
    + '<div id="rb-head"><span>Radar Shopee · Rosa Baby</span><button id="rb-x">×</button></div>'
    + '<div id="rb-body">'
    +   '<div id="rb-search">'
    +     '<input id="rb-kw" placeholder="nome do produto (ex: trofeu acrilico personalizado)">'
    +     '<button id="rb-go" class="rb-btn">Buscar</button>'
    +   '</div>'
    +   '<div id="rb-actions">'
    +     '<button id="rb-scrape" class="rb-btn ghost">Coletar pagina atual</button>'
    +     '<button id="rb-this" class="rb-btn ghost">Coletar este anuncio</button>'
    +   '</div>'
    +   '<div id="rb-status"></div>'
    +   '<div id="rb-list"></div>'
    +   '<div id="rb-export">'
    +     '<button id="rb-copy" class="rb-btn">Copiar JSON</button>'
    +     '<button id="rb-dl" class="rb-btn ghost">Baixar JSON</button>'
    +     '<span id="rb-count">0 selecionados</span>'
    +   '</div>'
    + '</div>';
  document.body.appendChild(panel);

  function toggle(v){ open = (v!=null)?v:!open; panel.style.display = open?"flex":"none"; }
  fab.onclick = function(){ toggle(); };
  panel.querySelector("#rb-x").onclick = function(){ toggle(false); };

  // abrir/fechar o painel ao clicar no icone da extensao
  try {
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse){
      if (req && req.rb === "toggle") { toggle(true); sendResponse && sendResponse({ok:true}); }
      return true;
    });
  } catch(e){}

  function status(msg, kind){
    var s = panel.querySelector("#rb-status");
    s.textContent = msg || "";
    s.className = kind || "";
  }

  function render(){
    var list = panel.querySelector("#rb-list");
    if (!collected.length){ list.innerHTML = ""; updateCount(); return; }
    list.innerHTML = collected.map(function(p, i){
      var lines = [];
      lines.push('<b>'+ (p.preco!=null?brl(p.preco):"—") +'</b>');
      if (p.totalVendido!=null) lines.push(p.totalVendido + " vendidos");
      if (p.vendasPorDia!=null) lines.push("~" + p.vendasPorDia + "/dia");
      if (p.criadoEm) lines.push("criado " + p.criadoEm);
      if (p.qtdAvaliacoes) lines.push("★ " + p.avaliacao + " (" + p.qtdAvaliacoes + ")");
      return ''
        + '<label class="rb-item">'
        +   '<input type="checkbox" data-i="'+i+'" '+(p._sel?'checked':'')+'>'
        +   '<div><div class="rb-nm">'+ escapeHtml(p.nome||"(sem nome)") +'</div>'
        +   '<div class="rb-mt">'+ lines.join(" · ") +'</div></div>'
        + '</label>';
    }).join("");
    list.querySelectorAll('input[type=checkbox]').forEach(function(c){
      c.onchange = function(){ collected[+c.dataset.i]._sel = c.checked; updateCount(); };
    });
    updateCount();
  }
  function updateCount(){
    var n = collected.filter(function(p){ return p._sel; }).length;
    panel.querySelector("#rb-count").textContent = n + " selecionados";
  }
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }

  function setCollected(arr){
    arr.forEach(function(p){ p._sel = true; });
    collected = arr;
    render();
  }

  // acoes
  panel.querySelector("#rb-go").onclick = async function(){
    var kw = panel.querySelector("#rb-kw").value.trim();
    if (!kw){ status("Digite o nome do produto.","err"); return; }
    status("Buscando \""+kw+"\" na Shopee...");
    try { setCollected(await apiSearch(kw, 40)); status("Encontrei "+collected.length+" produtos.","ok"); }
    catch(e){ status(e.message,"err"); }
  };
  panel.querySelector("#rb-kw").addEventListener("keydown", function(e){ if(e.key==="Enter") panel.querySelector("#rb-go").click(); });

  panel.querySelector("#rb-scrape").onclick = function(){
    status("Lendo a pagina...");
    try { setCollected(scrapePage()); status("Coletei "+collected.length+" cards da pagina.","ok"); }
    catch(e){ status(e.message,"err"); }
  };

  panel.querySelector("#rb-this").onclick = async function(){
    var m = location.href.match(/i\.(\d+)\.(\d+)/) || location.href.match(/product\/(\d+)\/(\d+)/);
    if (!m){ status("Abra a pagina de um produto para usar isto.","err"); return; }
    status("Lendo este anuncio...");
    try { setCollected([ await apiItem(m[1], m[2]) ]); status("Anuncio coletado.","ok"); }
    catch(e){ status(e.message,"err"); }
  };

  panel.querySelector("#rb-copy").onclick = function(){
    var data = JSON.stringify(collected.filter(function(p){return p._sel;}).map(clean), null, 2);
    navigator.clipboard.writeText(data).then(
      function(){ status("JSON copiado! Cole na aba Importar do app.","ok"); },
      function(){ status("Nao consegui copiar. Use 'Baixar JSON'.","err"); }
    );
  };
  panel.querySelector("#rb-dl").onclick = function(){
    var data = JSON.stringify(collected.filter(function(p){return p._sel;}).map(clean), null, 2);
    var blob = new Blob([data], {type:"application/json"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "radar-shopee.json";
    a.click();
    status("Arquivo baixado.","ok");
  };
  function clean(p){ var o={}; for (var k in p){ if(k!=="_sel") o[k]=p[k]; } return o; }

})();
