# Subir no Vercel + Firestore

As ferramentas são **páginas estáticas**. Não precisa de servidor/API — o
**Firebase Web SDK** fala direto com o Firestore pelo navegador. Por isso o
projeto `cubagem-api` não é necessário (pode apagar ou ignorar).

As ferramentas já funcionam **sem Firebase** (salvam no localStorage). O Firestore
liga sozinho quando você colar a config.

---

## 1) Firebase (uma vez)

1. Console do Firebase → use o **mesmo projeto do b3 flow** (recomendado, pra os
   dados já nascerem no lugar certo) ou crie um novo.
2. **Firestore Database** → Criar → comece em **modo de teste**.
3. **Regras** → cole o conteúdo de `firestore.rules` (começa em modo público de
   teste; troque pelo bloco autenticado antes de usar pra valer).
4. **Configurações do projeto** → seus apps → **App da Web** (</>) → copie o objeto
   `firebaseConfig` (apiKey, authDomain, projectId, etc.).
   > A apiKey web é **pública por design** — pode ficar no código. A segurança é
   > pelas Regras do Firestore, não pela chave.

## 2) Colar a config nas ferramentas

Abra `ferramentas/b3-box.html` (b3 Price e b3 Radar ganham Firestore quando forem refinados).
No topo do `<script>` tem o bloco:

```js
window.FIREBASE_CONFIG = {
  // apiKey: "...", authDomain: "...", projectId: "...",
  // ...
};
```

Cole sua config dentro das chaves. Pronto: passam a usar Firestore.
(Deixar `{}` mantém em localStorage.)

Os dados ficam em `b3_config/produtos` e `b3_config/caixas_mestre` (campo `lista`).

## 3) Subir no Vercel

**Opção A — GitHub (recomendada, versiona junto):**
1. Suba a pasta `b3-box` num repositório GitHub.
2. vercel.com → **Add New → Project** → importe o repositório.
3. Framework: **Other** (site estático). Sem build. Deploy.
4. Cada commit novo gera deploy automático.

**Opção B — Vercel CLI (rápido):**
```bash
npm i -g vercel
cd b3-box
vercel        # segue o assistente; depois "vercel --prod"
```

O `index.html` na raiz vira a home com o menu das ferramentas.

## 4) Sobre o `cubagem-api`

Era uma API que você não quer mais — pode **apagar** (Vercel → projeto cubagem-api →
Settings → Delete) ou só deixar de lado e criar um projeto novo a partir do repositório.

---

## Resumindo o fluxo
GitHub (versão) → Vercel (site no ar) → Firebase/Firestore (dados na nuvem).
Quando o produto estiver validado, a migração pro b3 flow reaproveita os mesmos
dados (mesmo projeto Firebase) e o mesmo esquema (`comprimentoMm`, `pesoGramas`...).
