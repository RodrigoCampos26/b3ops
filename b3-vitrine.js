/* ============================================================
   B3 OPS — VITRINE v2 (Nível 2, etapa A1)
   Config da vitrine agora vem do FIRESTORE (documento b3_config/vitrine),
   então vale em qualquer aparelho. Fallback: localStorage -> padrão.
   Coloque na RAIZ do repositório: /b3-vitrine.js
   ============================================================ */
(function (global) {
  'use strict';

  const VITRINE_PADRAO = {
    senhaAdmin:   'b3admin',   // <<< TROQUE pela sua senha de admin
    senhaCliente: 'testar',    // <<< senha padrão do cliente
    trancadas:    [],          // ex: ['box','price','radar']
  };

  const LSV = 'b3ops_vitrine';
  const LSU = 'b3ops_desbloqueadas';

  const NOMES = {
    flex:  ['B3 Flex',  'bipagem de saída'],
    box:   ['B3 Box',   'empacotador 3D'],
    price: ['B3 Price', 'precificação'],
    radar: ['B3 Radar', 'mercado'],
  };

  const firebaseConfig = {
    apiKey: "AIzaSyADBo2Ft7VEPwRsqBDveVOByOE99CnWj-w",
    authDomain: "b3ops-ab662.firebaseapp.com",
    projectId: "b3ops-ab662",
    storageBucket: "b3ops-ab662.firebasestorage.app",
    messagingSenderId: "695969657587",
    appId: "1:695969657587:web:d79c4f0e6766bda0db3d86"
  };
  const COL = 'b3_config', DOCID = 'vitrine';

  let _cfgCache = null, _fb = null, _fbTentado = false;

  function lerLocal() {
    try { return JSON.parse(localStorage.getItem(LSV) || 'null'); } catch (e) { return null; }
  }
  function salvarLocal(c) { try { localStorage.setItem(LSV, JSON.stringify(c)); } catch (e) {} }
  function desbloqueadas() {
    try { return new Set(JSON.parse(localStorage.getItem(LSU) || '[]')); } catch (e) { return new Set(); }
  }
  function marcarDesbloqueada(tool) {
    const s = desbloqueadas(); s.add(tool);
    localStorage.setItem(LSU, JSON.stringify([...s]));
  }
  function limparDesbloqueios() { localStorage.removeItem(LSU); }
  function mesclar(base) { return { ...VITRINE_PADRAO, ...(base || {}) }; }

  async function initFirebase() {
    if (_fb || _fbTentado) return _fb;
    _fbTentado = true;
    try {
      const appMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
      const fsMod  = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      const app = appMod.initializeApp(firebaseConfig);
      const db  = fsMod.getFirestore(app);
      _fb = { db, getDoc: fsMod.getDoc, setDoc: fsMod.setDoc, doc: fsMod.doc };
    } catch (e) {
      console.warn('[vitrine] Firestore indisponivel:', e);
      _fb = null;
    }
    return _fb;
  }

  async function carregarConfig() {
    const fb = await initFirebase();
    if (fb) {
      try {
        const ref = fb.doc(fb.db, COL, DOCID);
        const snap = await fb.getDoc(ref);
        if (snap.exists()) {
          _cfgCache = mesclar(snap.data());
          salvarLocal(_cfgCache);
          return _cfgCache;
        }
      } catch (e) { console.warn('[vitrine] leitura Firestore falhou:', e); }
    }
    _cfgCache = mesclar(lerLocal());
    return _cfgCache;
  }

  async function salvarConfig(c) {
    const cfg = mesclar(c);
    _cfgCache = cfg;
    salvarLocal(cfg);
    const fb = await initFirebase();
    if (fb) {
      try {
        const ref = fb.doc(fb.db, COL, DOCID);
        await fb.setDoc(ref, cfg, { merge: true });
        return true;
      } catch (e) { console.warn('[vitrine] gravacao Firestore falhou:', e); return false; }
    }
    return false;
  }

  function cfgSync() { return _cfgCache || mesclar(lerLocal()); }

  /* ---- DADOS DA EMPRESA (b3_config/empresa) ---- */
  const LSE = 'b3ops_empresa';
  let _empresaCache = null;
  function empresaLocal() {
    try { return JSON.parse(localStorage.getItem(LSE) || 'null'); } catch (e) { return null; }
  }
  async function carregarEmpresa() {
    const fb = await initFirebase();
    if (fb) {
      try {
        const ref = fb.doc(fb.db, 'b3_config', 'empresa');
        const snap = await fb.getDoc(ref);
        if (snap.exists()) {
          _empresaCache = snap.data();
          try { localStorage.setItem(LSE, JSON.stringify(_empresaCache)); } catch (e) {}
          return _empresaCache;
        }
      } catch (e) { console.warn('[vitrine] leitura empresa falhou:', e); }
    }
    _empresaCache = empresaLocal() || {};
    return _empresaCache;
  }
  async function salvarEmpresa(dados) {
    _empresaCache = dados;
    try { localStorage.setItem(LSE, JSON.stringify(dados)); } catch (e) {}
    const fb = await initFirebase();
    if (fb) {
      try {
        await fb.setDoc(fb.doc(fb.db, 'b3_config', 'empresa'), dados, { merge: true });
        return true;
      } catch (e) { console.warn('[vitrine] gravacao empresa falhou:', e); return false; }
    }
    return false;
  }
  function empresaSync() { return _empresaCache || empresaLocal() || {}; }

  function estaTravada(tool, c) {
    c = c || cfgSync();
    return c.trancadas.includes(tool) && !desbloqueadas().has(tool);
  }

  async function guardAsync(tool) {
    const hideId = 'b3guard-hide';
    if (!document.getElementById(hideId)) {
      const st = document.createElement('style');
      st.id = hideId;
      st.textContent = 'body{visibility:hidden!important}';
      (document.head || document.documentElement).appendChild(st);
    }
    function mostrarPagina() { const s = document.getElementById(hideId); if (s) s.remove(); }

    // rede lenta: se em 6s não resolveu, decide pelo cache local e mostra
    let resolvido = false;
    const timer = setTimeout(() => {
      if (resolvido) return;
      resolvido = true;
      const cLocal = cfgSync();
      if (estaTravada(tool, cLocal)) mostrarTela(cLocal); else mostrarPagina();
    }, 6000);

    const c = await carregarConfig();
    if (resolvido) return;
    resolvido = true; clearTimeout(timer);

    if (!estaTravada(tool, c)) { mostrarPagina(); return; }
    mostrarTela(c);
    return;

    function mostrarTela(c){

    const nome = (NOMES[tool] || [tool, ''])[0];
    const overlay = document.createElement('div');
    overlay.id = 'b3guard';
    overlay.innerHTML = `
      <style>
        #b3guard{position:fixed;inset:0;z-index:99999;background:#15171c;
          display:flex;align-items:center;justify-content:center;padding:20px;
          font-family:'Inter',system-ui,sans-serif;visibility:visible;}
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
    document.documentElement.style.overflow = 'hidden';
    (document.body || document.documentElement).appendChild(overlay);
    const hideStyle = document.getElementById(hideId);
    if (hideStyle) hideStyle.textContent = 'body>*:not(#b3guard){visibility:hidden!important}';

    const pwd = overlay.querySelector('#b3gpwd');
    const err = overlay.querySelector('#b3gerr');
    setTimeout(() => pwd.focus(), 100);

    function tentar() {
      if (pwd.value === cfgSync().senhaCliente) {
        marcarDesbloqueada(tool);
        overlay.remove();
        document.documentElement.style.overflow = '';
        mostrarPagina();
      } else {
        err.textContent = 'Senha incorreta.';
        pwd.value = ''; pwd.focus();
      }
    }
    overlay.querySelector('#b3gok').addEventListener('click', tentar);
    pwd.addEventListener('keydown', e => { if (e.key === 'Enter') tentar(); });
    overlay.querySelector('#b3gback').addEventListener('click', () => {
      window.location.href = '/index.html';
    });
    }
  }

  global.B3Vitrine = {
    carregarConfig, salvarConfig, cfgSync,
    carregarEmpresa, salvarEmpresa, empresaSync,
    desbloqueadas, marcarDesbloqueada, limparDesbloqueios,
    estaTravada, guardAsync,
    NOMES,
  };
})(window);
