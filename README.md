# CARPI Ateliê

Loja online da CARPI Ateliê (carpiatelie.com.br): abajures de design feitos sob encomenda.

## Em que fase estamos

| Fase | O que entra | Situação |
|---|---|---|
| 1. Visual | Todas as páginas com dados fictícios, paleta, fonte, celular e "Apagar as luzes" | **Pronta para teste** |
| 2. Banco de dados | Supabase, cadastro e login, produtos e estoque vindos do banco | A fazer |
| 3. Sacola e checkout | Cupons, frete pelo Melhor Envio, frete grátis no Sudeste | A fazer |
| 4. Pagamento | Pagar.me e PagBank em teste, cartão e Pix, baixa de estoque | A fazer |
| 5. Painel admin | Produtos, pedidos, status, rastreio, cupons, newsletter, e-mails | A fazer |
| 6. Publicação | Vercel, domínio, checklist final | A fazer |

### O que ainda é simulado na Fase 1

- **Frete:** qualquer CEP de 01000-000 a 39999-999 (Sudeste) dá "Grátis"; os outros dão R$ 39,90. O valor real vem do Melhor Envio na Fase 3.
- **Cupom:** só o cupom de teste `CARPI10` (10% a partir de R$ 100). Os cupons reais serão criados no painel.
- **Juros do cartão:** valores de exemplo (2,99% ao mês). Os reais vêm do intermediador.
- **Pix:** o QR Code é um desenho, não paga nada.
- **Entrar, cadastro e Minha conta:** só a tela, com uma conta fictícia ("Ana Souza").
- **Newsletter:** mostra a mensagem de sucesso, mas ainda não salva o e-mail.
- **Sacola, favoritos e luzes apagadas** já funcionam de verdade e ficam guardados no navegador.

## Como ver o site no celular (sem instalar nada)

O jeito mais fácil é a **Vercel**, que publica o site a partir do GitHub:

1. Crie uma conta grátis em https://vercel.com, entrando com o GitHub (o usuário `joaoduquef`).
2. Clique em **Add New → Project**, escolha o repositório **carpi-atelie** e clique em **Deploy**. Não precisa mudar nenhuma configuração.
3. Em 1 a 2 minutos a Vercel mostra um link (algo como `carpi-atelie.vercel.app`). Abra no celular.

Cada vez que uma fase nova for salva no GitHub, a Vercel atualiza o link sozinha.

## Como rodar no computador (opcional)

Precisa do **Node.js 20 ou mais novo** (https://nodejs.org, versão "LTS").

```bash
npm install        # baixa as dependências (só na primeira vez)
npm run dev        # abre o site em http://localhost:3000
```

Outros comandos: `npm run build` (gera a versão de produção) e `npm run lint` (procura erros no código).

## Onde trocar cada coisa

| O quê | Onde |
|---|---|
| Logo | `public/brand/logo.svg` (romã) e `public/brand/logo-creme.svg` (creme, usado no modo noite). Troque os dois mantendo os nomes. |
| Fotos da Babi | `public/products/babi/` — `mare-apagado.png`, `mare-aceso.png`, `damasco-…`, `roma-…` (recortadas, fundo transparente), `ambiente-1.jpg` e `desenho-tecnico.png`. Mantenha os nomes e as fotos recortadas em pé (proporção 8 × 11). Depois de trocar, aumente o número em `src/lib/fotos.ts` para o site não mostrar a foto antiga guardada em cache. |
| E-mail, Instagram, CNPJ, razão social, texto da barra do topo | `src/config/loja.ts` |
| Preço, descrição e medidas (até a Fase 2) | `src/data/mock.ts` |
| Cores | `src/app/globals.css` (bloco `:root` para luzes acesas, `html.apagadas` para o modo noite) |
| Textos das páginas | `src/app/<nome-da-página>/page.tsx`. Os textos marcados como provisórios precisam de revisão. |

## Identidade visual (decisões aprovadas)

- **Paleta:** creme `#F7EDDC`, creme claro `#FBF6EC`, romã `#E2627F`, romã escuro `#B63A55`, romã texto `#9C2F48`, rosa claro `#F8C3CE`, maré `#A9CCDD`, maré escuro `#336A89`, damasco `#EE8E3E`, damasco claro `#FBD2A5`, amarelo `#F6D27A`, tinta `#3A2228`.
- **Modo noite (Apagar as luzes):** fundo bordô `#3A1420`, títulos e botões em rosa claro, logo em creme.
- **Logo:** romã só sobre creme; em creme sobre romã escuro e bordô.
- **Nome dos produtos:** `BABI  maré` (modelo em caixa alta, dois espaços, cor em minúsculas).
- **Página inicial enxuta:** só o preço cheio nos cards; Pix, medidas, cuidados, pagamentos e "como funciona" ficam na página do produto.
- **Fonte:** Liberation Sans (licença SIL OFL, arquivo em `public/fonts/LICENSE-Liberation.txt`), hospedada no próprio site.
- Todos os textos passam no contraste mínimo WCAG AA.

## Organização do código

```
src/
  app/            páginas (cada pasta é um endereço do site)
  components/     peças reutilizáveis (cabeçalho, rodapé, cards, botões, modo noite…)
  config/loja.ts  dados públicos da loja
  data/           dados fictícios da Fase 1
  lib/            regras: dinheiro (centavos), datas e dias úteis, frete, catálogo
public/           fontes, logo e fotos
```

Os valores em dinheiro circulam sempre em centavos. O que aparece no navegador serve só para exibir: a partir da Fase 3, preço, cupom, desconto e frete são recalculados no servidor antes de qualquer cobrança.

## Segurança e dados

- Chaves e senhas ficam só no arquivo `.env.local` (que nunca vai para o GitHub). O modelo das variáveis está em `.env.example`.
- Dados de cartão nunca passam pelo nosso servidor (tokenização do intermediador, Fase 4).
- Onde os dados dos clientes ficam e como fazer backup: será explicado aqui na Fase 2.
