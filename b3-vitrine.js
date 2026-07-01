/* ============================================================
   B3 OPS — VITRINE (Nível 1, trava visual)
   Arquivo único compartilhado por todas as páginas.
   Coloque na RAIZ do repositório: /b3-vitrine.js
   Cada página carrega com: <script src="/b3-vitrine.js"></script>

   Config e liberações ficam no localStorage do navegador (mesmo domínio),
   então a home e as ferramentas leem a MESMA configuração.

   ⚠ Nível 1 = trava visual para demonstração. Não separa dados nem
   segura alguém técnico. Separação real vem no multi-tenant (próximo projeto).
   ============================================================ */
(function (global) {
  'use strict';

  /* ---- Config padrão (vale enquanto o admin não configurar neste navegador) ----
     EDITE AQUI o padrão de fábrica: */
  const VITRINE_PADRAO = {
    senhaAdmin:   'b3admin',   // <<< TROQUE pela sua senha de admin
    senhaCliente: 'testar',    // <<< senha padrão que o cliente usa
    trancadas:    [],          // travadas por padrão. ex: ['box','price','radar']
  };

  const LSV = 'b3ops_vitrine';        // config do admin
  const LSU = 'b3ops_desbloqueadas';  // ferramentas já liberadas neste navegador

  const NOMES = {
    flex:  ['B3 Flex',  'bipagem de saída'],
    box:   ['B3 Box',   'empacotador 3D'],
    price: ['B3 Price', 'precificação'],
    radar: ['B3 Radar', 'mercado'],
  };

  function cfg() {
    try { return { ...VITRINE_PADRAO, ...(JSON.parse(localStorage.getItem(LSV) || '{}')) }; }
    catch (e) { return { ...VITRINE_PADRAO }; }
  }
  function salvarCfg(c) { localStorage.setItem(LSV, JSON.stringify(c)); }

  function desbloqueadas() {
    try { return new Set(JSON.parse(localStorage.getItem(LSU) || '[]')); }
    catch (e) { return new Set(); }
  }
  function marcarDesbloqueada(tool) {
    const s = desbloqueadas(); s.add(tool);
    localStorage.setItem(LSU, JSON.stringify([...s]));
  }
  function limparDesbloqueios() { localStorage.removeItem(LSU); }

  // uma ferramenta está travada agora? (trancada na config E não liberada neste navegador)
  function estaTravada(tool) {
    const c = cfg();
    return c.trancadas.includes(tool) && !desbloqueadas().has(tool);
  }

  /* ============================================================
     GUARDA DE PÁGINA — protege uma ferramenta ao carregar.
     Chame em cada ferramenta: B3Vitrine.guard('box')
     Se travada, mostra tela de senha por cima de tudo.
     ============================================================ */
  function guard(tool) {
    if (!estaTravada(tool)) return; // liberada → segue normal

    const nome = (NOMES[tool] || [tool, ''])[0];
    const overlay = document.createElement('div');
    overlay.id = 'b3guard';
    overlay.innerHTML = `
      <style>
        #b3guard{position:fixed;inset:0;z-index:99999;background:#15171c;
          display:flex;align-items:center;justify-content:center;padding:20px;
          font-family:'Inter',system-ui,sans-serif;}
        #b3guard .gbox{background:#1c1f26;border:1px solid #2e333d;border-radius:16px;
          padding:28px;width:100%;max-width:380px;text-align:center;}
        #b3guard .glock{font-size:34px;margin-bottom:10px;}
        #b3guard h2{color:#e8eaed;font-size:20px;font-weight:800;margin-bottom:6px;}
        #b3guard p{color:#9aa1ab;font-size:13px;margin-bottom:18px;line-height:1.5;}
        #b3guard b{color:#f59e0b;}
        #b3guard input{width:100%;background:#23272f;border:1px solid #2e333d;border-radius:9px;
          color:#e8eaed;padding:12px;font-size:15px;font-family:inherit;text-align:center;}
        #b3guard input:focus{outline:none;border-color:#f59e0b;}
        #b3guard .gerr{color:#ef4444;font-size:12px;margin-top:10px;min-height:16px;}
        #b3guard .gbtns{display:flex;gap:8px;margin-top:16px;}
        #b3guard button{flex:1;padding:12px;border:none;border-radius:9px;font-family:inherit;
          font-size:14px;font-weight:700;cursor:pointer;}
        #b3guard .gprim{background:#f59e0b;color:#16161a;}
        #b3guard .gback{background:transparent;color:#9aa1ab;border:1px solid #2e333d;}
      </style>
      <div class="gbox">
        <div class="glock">🔒</div>
        <h2>${nome}</h2>
        <p>Esta ferramenta está bloqueada. Digite a <b>senha de acesso</b> para liberar.</p>
        <input type="password" id="b3gpwd" placeholder="Senha de acesso" autocomplete="off">
        <div class="gerr" id="b3gerr"></div>
        <div class="gbtns">
          <button class="gback" id="b3gback">Voltar ao início</button>
          <button class="gprim" id="b3gok">Liberar</button>
        </div>
      </div>`;
    // esconde o conteúdo da página até liberar
    document.documentElement.style.overflow = 'hidden';
    (document.body || document.documentElement).appendChild(overlay);

    const pwd = overlay.querySelector('#b3gpwd');
    const err = overlay.querySelector('#b3gerr');
    setTimeout(() => pwd.focus(), 100);

    function tentar() {
      if (pwd.value === cfg().senhaCliente) {
        marcarDesbloqueada(tool);
        overlay.remove();
        document.documentElement.style.overflow = '';
      } else {
        err.textContent = 'Senha incorreta.';
        pwd.value = '';
        pwd.focus();
      }
    }
    overlay.querySelector('#b3gok').addEventListener('click', tentar);
    pwd.addEventListener('keydown', e => { if (e.key === 'Enter') tentar(); });
    overlay.querySelector('#b3gback').addEventListener('click', () => {
      window.location.href = '/index.html';
    });
  }

  /* API pública */
  global.B3Vitrine = {
    cfg, salvarCfg,
    desbloqueadas, marcarDesbloqueada, limparDesbloqueios,
    estaTravada, guard,
    NOMES,
  };
})(window);
