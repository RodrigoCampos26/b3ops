# b3 Ops

b3 Ops — central de operações da Rosa Baby (embalagem, preço e mercado) (produtos personalizados — fiber, CO2,
UV Mimaki, acrílico). Tudo client-side (HTML/JS), salvando no navegador (localStorage),
pensado para depois migrar para o app **b3 flow** (Vercel + Firestore + Storage).

Abra o `index.html` para o menu com todas as ferramentas.

## Ferramentas

| Ferramenta | Arquivo | O que faz |
|---|---|---|
| **b3 Box** | `ferramentas/b3-box.html` | Empacotador 3D: pedido (1 ou vários produtos) → caixa mestre, com 3D girável e qual caixa do estoque usar. (Pronto) |
| **b3 Price** | `ferramentas/calculadora-de-precos.html` | Precificação por marketplace: margem, custos fixos, lucro líquido, ponto de equilíbrio. (A refinar) |
| **b3 Radar** | `ferramentas/radar-de-produtos.html` | Pesquisa de mercado, viabilidade, kit e importação da Shopee. (A refinar) |
| extensão | `extensao-radar-shopee/` | Coleta dados de produtos na Shopee. Ver `COMO-INSTALAR.md`. |

> A antiga *Cubagem* foi removida (o b3 Box cobre) e a *Tamanho de Caixa* virou parte do b3 Box
> (um pedido de 1 produto já recomenda a caixa).


## Dados de calibração (logística de caixas)

Dados reais usados para calibrar o cálculo de caixas:

Unidades padronizadas em **mm** e peso em **gramas** (esquema do b3 flow).

- **Porta-joia**: 90 × 90 × 45 mm · 110 g/un
  - 240 un → caixa **620 × 510 × 420 mm**
  - 200 un → caixa **540 × 510 × 410 mm**
- **Aproveitamento médio calibrado: ~66%** (as caixas enchem ~66% do volume; o resto é folga real).
- Terceira caixa mestre: *a cadastrar.*

O cálculo combina: encaixe geométrico (grade de peças na melhor orientação) **limitado** pelo
aproveitamento real. Quanto mais exemplos reais (produto → caixa usada), melhor a calibração por tipo.

## Migração para o b3 flow (Vercel + Firestore)

A persistência está isolada em poucos pontos — basta trocar por Firestore:

- `b3-box.html`: `Store.list()` / `Store.save()` (Firestore `b3_config/*` ou localStorage)
- `calculadora-de-precos.html`: objeto `db` (`db.load` / `db.save`)

**Esquema dos dados (igual ao b3 flow):**
- Produto: `{ nome, comprimentoMm, larguraMm, alturaMm, pesoGramas }`
- Caixa mestre: `{ comprimentoMm, larguraMm, alturaMm }`

As ferramentas de caixa **compartilham** o cadastro (`b3_produtos`) e o estoque de
caixas (`b3_caixas_mestre`) — no Firestore viram duas coleções. O catálogo do b3 flow
guarda dimensões em **cm** (`comprimentoCm`); ao migrar, converter **cm → mm (×10)**.
A produção/gravação já usa mm (`pecaLarguraMm`).

O empacotador 3D usa Three.js via CDN; em React (b3 flow) o equivalente é `react-three-fiber` + `drei` (OrbitControls).

## Como versionar (não perder mudanças)

1. Crie um repositório no **GitHub** (ex: `b3-box`, privado).
2. Coloque esta pasta dentro dele.
3. A cada mudança, faça um **commit** com uma mensagem curta (ex: "calibra aproveitamento 66%").
   Assim você tem histórico completo e pode voltar atrás a qualquer momento.
4. Conecte o repositório ao **Vercel** → link online automático a cada commit
   (resolve também abrir no celular e mandar no WhatsApp como site).

Sugestão de mensagens de commit: descreva o "o quê" em poucas palavras
("adiciona orientação no cálculo", "3D girável", "nova caixa 40x30x30").

## Histórico (resumo)

- Radar de produtos + extensão Shopee + calculadora de preços (modelo da planilha).
- Logística: cubagem → tamanho de caixa (estoque real) → empacotador 3D de pedido misto.
- Calibração com dados reais do porta-joia (~66% de aproveitamento).
- 3D do pedido girável com o mouse (Three.js / OrbitControls).
