# Radar Shopee · Rosa Baby — como instalar

Extensão de navegador (Chrome / Edge / Brave) que pesquisa produtos na Shopee
e coleta os dados de mercado para o app **Radar de Produtos**.

## O que ela coleta de cada anúncio
- Preço de venda
- Total vendido (histórico do anúncio)
- **Data de criação do anúncio** (quando foi publicado)
- **Vendas por dia** (calculado: total vendido ÷ dias no ar)
- Avaliação e número de avaliações
- Loja e link do produto

## Instalar (uma vez só)
1. Descompacte a pasta `extensao-radar-shopee` num lugar fixo do computador
   (ex: Documentos). Os 3 arquivos — `manifest.json`, `content.js`, `panel.css` —
   precisam ficar **na mesma pasta**.
2. No Chrome, abra: `chrome://extensions`
3. Ligue o **Modo do desenvolvedor** (canto superior direito).
4. Clique em **Carregar sem compactação** e selecione a pasta `extensao-radar-shopee`.
5. Pronto — a extensão aparece na lista.

> Atualizou a extensão? Em `chrome://extensions`, clique no ícone de **recarregar** (↻)
> no card da extensão para pegar a versão nova.

## O ícone na barra ficou cinza?
É normal na versão antiga: a extensão não tinha botão na barra, só o painel dentro da Shopee.
Nesta versão (1.1) o ícone é **rosa e clicável** — ao clicar nele, ele abre o painel
se você estiver na Shopee, ou abre a Shopee se não estiver. O painel também continua
aparecendo sozinho no canto inferior direito das páginas da Shopee.

## Usar
1. Abra **shopee.com.br** e faça login normalmente.
2. No canto inferior direito aparece o botão rosa **Radar** (ou clique no ícone rosa da extensão na barra).
3. Três formas de coletar:
   - **Buscar**: digite o nome do produto e clique em Buscar.
   - **Coletar página atual**: estando numa página de busca/loja da Shopee,
     coleta os produtos que estão na tela.
   - **Coletar este anúncio**: estando dentro de um produto, coleta só ele (dados completos).
4. Marque os produtos que interessam.
5. Clique em **Copiar JSON** (ou Baixar JSON).
6. No app **Radar de Produtos** → aba **Importar** → cole o JSON → **Importar**.

## Se der erro na busca
A Shopee muda os endpoints internos de tempos em tempos e tem proteção
anti-robô. Se a busca falhar:
- Tente o botão **Coletar página atual** (faz a busca na própria Shopee e lê a tela).
- Use de forma manual e sem exagero (poucas buscas por vez).
- Se persistir, me mande a mensagem de erro que aparece no painel — ajusto o código.

> Aviso: os Termos de Uso da Shopee restringem coleta automática em massa.
> Esta ferramenta é para pesquisa de mercado pontual, em baixo volume.
