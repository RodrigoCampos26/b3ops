# Briefing — b3 Ops

Documento curto de referência do projeto. Atualizar conforme evolui.
Última atualização: 22/06/2026.

---

## 1. O que é

**b3 Ops** = app à parte (validação) com as ferramentas de operação da **Rosa Baby**
(produtos personalizados: fiber laser, CO2, UV Mimaki, corte de acrílico).
Faz parte do ecossistema do **b3 flow** (o ERP principal, em Next.js + Firebase) e,
quando validado, migra pra dentro dele.

**Dono:** Rodrigo Campos · Cordeirópolis/SP · vende em Shopee e Mercado Livre.

## 2. As 3 ferramentas

| Ferramenta | Status | O que faz |
|---|---|---|
| **b3 Box** | **pronto** | Empacotador 3D: monta o pedido (1+ produtos) → caixa mestre, com encaixe girável e qual caixa do estoque usar. |
| **b3 Price** | a refinar | Precificação por marketplace: margem, custos fixos, lucro líquido, ponto de equilíbrio. |
| **b3 Radar** | a refinar | Pesquisa de mercado, viabilidade, kit, importação da Shopee (+ extensão Chrome). |

## 3. Stack e deploy

- **Front:** HTML/JS estático (sem build, sem npm). Tema escuro, gradiente roxo→azul→ciano.
- **Dados:** Firebase **Firestore** (projeto `b3ops-ab662`) via Web SDK no navegador;
  cai pra localStorage se não houver config. Docs em `b3_config/produtos` e `b3_config/caixas_mestre` (campo `lista`).
- **Hospedagem:** **Vercel** (projeto `b3ops`), deploy automático a cada commit no **GitHub** (`RodrigoCampos26/b3ops`).
- **Fluxo de atualização:** editar arquivo no GitHub → commit → Vercel publica sozinho. (Não mexe no Vercel a cada vez.)
- **URL:** b3ops.vercel.app · estrutura: `index.html` na raiz + `ferramentas/` + `extensao-radar-shopee/`.

## 4. Esquema de dados (igual ao b3 flow)

- **Produto:** `{ nome, comprimentoMm, larguraMm, alturaMm, pesoGramas, aproveitamento }`
- **Caixa mestre:** `{ comprimentoMm, larguraMm, alturaMm }`
- Tudo em **mm** e **gramas**. (Catálogo do b3 flow usa cm → na migração ×10.)
- **Aproveitamento por produto** = quanto o produto enche a caixa de verdade.
  Rígido/empilhável ~85-90%; solto ~65%.

## 5. Produtos calibrados (dados reais)

| Produto | Medida (mm) | Peso | Aprov. | Validação real |
|---|---|---|---|---|
| Porta Joia | 90×90×45 | 110 g | 66% | 240un→620×510×420 · 200un→540×510×410 · 100un→520×270×410 |
| Fone i9s | 78×78×57 | 75 g | 85% | 100un→420×330×295 |
| Caixa de Som Altomex AL 6888 | 72×73×80 | 183 g | 92% | 100un→375×375×332 ✓ |

**Caixas mestre cadastradas (mm):** 620×510×420 · 540×510×410 · 520×270×410 · 420×330×295 · 375×375×332

## 6. Pendências (cobrar)

- [x] **Caixa de som:** aproveitamento **92%** (100 un cabem na 375×375×332). ✓
- [ ] **Copo térmico 475 ml:** medir C×L×A (mm) + peso (g) + quantos/qual caixa. *(Rodrigo vai medir.)*
- [ ] **Garrafas térmicas:** medir (mm) + peso + quantos/caixa. *(Depois.)*
- [ ] Outros produtos/caixas que faltam cadastrar.
- [ ] Trocar regras do Firestore de **modo teste (público)** → **autenticado**, antes de usar pra valer.
- [ ] Refinar **b3 Price** e **b3 Radar**.
- [ ] Migração pro b3 flow (quando validado): vira uma tela, lê produtos do catálogo, caixas em coleção nova.

## 7. Como Claude deve trabalhar (pra ir rápido)

- Responder em **PT-BR**, direto, sem reler o projeto todo a cada vez — usar este briefing.
- Manter o padrão: mm/gramas, esquema acima, tema do b3 flow, código limpo p/ migração.
- Ao calibrar: pedir sempre medida (mm) + peso (g) + quantos cabem em qual caixa.
