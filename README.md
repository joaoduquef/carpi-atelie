# CARPI Ateliê

Loja online da CARPI Ateliê (carpiatelie.com.br): abajures de design feitos sob encomenda.

## Em que fase estamos

| Fase | O que entra | Situação |
|---|---|---|
| 1. Visual | Todas as páginas, paleta, fonte, celular e "Apagar as luzes" | **Aprovada** |
| 2. Banco de dados | Supabase, cadastro e login, produtos e estoque vindos do banco | **No ar** (www.carpiatelie.com.br ligado ao Supabase) |
| 3. Sacola e checkout | Cupons, frete pelo Melhor Envio, frete grátis no Sudeste | **Pronta para teste** (veja "Fase 3: configurar" abaixo) |
| 4. Pagamento | PagBank: Pix e cartão, aviso de pagamento, baixa de estoque | **Pronta para teste** (veja "Fase 4: configurar" abaixo) |
| 5. Painel admin | Produtos, pedidos, status, rastreio, cupons, newsletter, e-mails | A fazer |
| 6. Publicação | Vercel, domínio, checklist final | Domínio no ar; falta o checklist abaixo |

### Pendências (as vendas já estão abertas)

- [ ] **Rodar no SQL Editor** os arquivos de banco que faltarem (tabela "Atualizações do banco", abaixo), principalmente `20261029000001_revisao.sql`, e o comando da caixa de 650 g (o prazo de produção agora vem de `src/config/loja.ts`, não precisa mais mexer no banco).
- [ ] **Proteção contra robôs no cadastro e login:** no Supabase, **Authentication → Attack Protection**, ligar o CAPTCHA (Cloudflare Turnstile, grátis) e conferir os limites em **Rate Limits**. Hoje os limites do site valem nos formulários, mas o Supabase também pode ser chamado direto.

- [ ] **E-mails pelo Resend** (resend.com, grátis até 3.000 por mês): sem isso, só os e-mails da equipe do Supabase recebem a confirmação de cadastro, e os e-mails saem em inglês. Passos: criar a conta, cadastrar o domínio carpiatelie.com.br e copiar os registros DNS para o Registro.br, ativar o SMTP no Supabase (**Authentication → Emails → SMTP Settings**: host `smtp.resend.com`, porta `465`, usuário `resend`, senha = API Key do Resend, remetente `contato@carpiatelie.com.br`) e colar os modelos de `supabase/templates/`.
- [ ] **Mudar o banco para São Paulo:** hoje o projeto do Supabase está no Canadá (`ca-central-1`), por isso o servidor do site está em Washington (`iad1` em `vercel.json`). Criar um projeto novo na região South America (São Paulo), rodar todos os arquivos da tabela "Atualizações do banco", configurar as URLs, trocar as 3 variáveis do Supabase na Vercel e mudar `vercel.json` para `gru1`. Melhor fazer antes de ter clientes cadastrados.
- [ ] **Tornar João e Nalu administradores** (passo 7 da Fase 2, abaixo).
- [ ] **PagBank oficial:** depois de testar no sandbox, gerar o token da conta real, trocar `PAGBANK_TOKEN` na Vercel e criar `PAGBANK_AMBIENTE` = `producao`. (As vendas foram abertas em 24/10/2026: `vendasAbertas: true` em `src/config/loja.ts`; para fechar de novo, volte para `false`.)
- [ ] **Planos pagos:** Vercel Pro (o plano grátis não permite uso comercial) e Supabase Pro (backup diário e sem pausa por falta de uso).
- [ ] **Revisão dos textos provisórios** (políticas, trocas e pagamentos), de preferência com advogado ou contador.
- [ ] **Redirecionar `carpi-atelie.vercel.app`** para www.carpiatelie.com.br e apagar o projeto duplicado `carpi-atelie-public` na Vercel.

### O que ainda é simulado

- **Frete:** enquanto o token do Melhor Envio e o CEP de origem não estiverem configurados, aparecem duas opções de exemplo (econômica e expressa). A regra do frete grátis no Sudeste já vale: a opção mais barata sai grátis e nas outras a cliente paga só a diferença.
- **Cupom:** com o Supabase configurado, os cupons vêm da tabela `cupons` (até o painel da Fase 5, crie pelo SQL, veja abaixo). Sem o Supabase, só o cupom de teste `CARPI10`.
- **Juros do cartão:** valores de exemplo (2,99% ao mês). Os reais vêm do intermediador.
- **Pagamento:** no sandbox do PagBank, nada é cobrado de verdade. O pedido fica "Aguardando pagamento" e reserva o estoque; sem pagamento em 1 hora, é cancelado sozinho e o estoque volta.
- **Sem o Supabase configurado:** o catálogo vem de `src/data/mock.ts` e as telas de conta mostram uma conta fictícia ("Ana Souza").
- **Com o Supabase configurado (Fase 2):** cadastro, login, recuperação de senha, Minha conta, newsletter e catálogo funcionam de verdade. Sacola e favoritos ficam no navegador e passam para a conta quando a cliente entra.

## Atualizações do banco (rodar no SQL Editor, na ordem)

| Arquivo | O que faz |
|---|---|
| `supabase/migrations/20261018000001_inicial.sql` | tabelas, regras de segurança e funções da loja |
| `supabase/seed.sql` | produtos, cores e fotos (só na primeira vez) |
| `supabase/migrations/20261024000001_checkout.sql` | criação do pedido com reserva de estoque |
| `supabase/migrations/20261025000001_pagamento.sql` | confirmação do pagamento e cancelamento de pedidos vencidos |
| `supabase/migrations/20261029000001_revisao.sql` | revisão de segurança: reserva de 60 min, limite de cupom, pagamento atrasado, newsletter só pelo servidor |
| `supabase/migrations/20261030000001_altura_babi.sql` | altura da Babi corrigida para 28,6 cm |
| `supabase/migrations/20261030000002_preco_349.sql` | preço dos abajures: R$ 349,00 |

Rodar de novo um arquivo que já foi rodado dá erro em alguns casos; na dúvida, pergunte antes.

**Alertas nos Logs da Vercel:** linhas começando com `[ALERTA]` pedem ação (pagamento em dobro, ou pago depois do prazo quando a peça já acabou): estorne no PagBank ou fale com a cliente. Na Fase 5 esses alertas viram e-mail para vocês.

## Fase 4: configurar (pagamento pelo PagBank)

**1. Atualizar o banco** (obrigatório): no SQL Editor do Supabase, rode `supabase/migrations/20261025000001_pagamento.sql`. Ele cria as funções que confirmam o pagamento (baixa o estoque e conta o uso do cupom) e cancelam os pedidos sem pagamento.

**2. Token de testes:** entre em https://developer.pagbank.com.br com a conta PagBank da empresa, abra a área de **sandbox** e gere o **token**. Na Vercel, crie `PAGBANK_TOKEN` (tipo **Secret**) e faça o Redeploy. Não crie `PAGBANK_AMBIENTE` enquanto estiver testando.

**3. Testar** (como administrador, com as vendas fechadas): sacola → **Finalizar compra (teste)** → **Ir para o pagamento**.
- **Cartão:** use os cartões de teste da documentação do PagBank (seção "Cartões de teste" do sandbox). O resultado (aprovado ou recusado) aparece na hora.
- **Pix:** gere o código e use o simulador de pagamento do sandbox do PagBank. A tela confirma sozinha em alguns segundos. O sandbox pode pedir uma chave Pix cadastrada na conta de testes.
- Pedido pago: aparece como **Pago** em Minha conta, o estoque baixa e a sacola esvazia.

**4. Conta real:** quando os testes estiverem certos, gere o token da conta de produção, troque `PAGBANK_TOKEN`, crie `PAGBANK_AMBIENTE` = `producao`, faça o Redeploy e um pagamento real pequeno para conferir. Só então abra as vendas (`vendasAbertas: true`).

O endereço de aviso de pagamento (`https://www.carpiatelie.com.br/api/pagbank/aviso`) vai junto em cada pedido, não precisa configurar no PagBank.

## Fase 3: configurar (sacola e finalização da compra)

**1. Atualizar o banco** (obrigatório): no SQL Editor do Supabase, rode o arquivo `supabase/migrations/20261024000001_checkout.sql` (botão **Raw** no GitHub → copiar → colar → **Run**). Ele cria a função que registra os pedidos e reserva o estoque.

**2. Testar como administrador:** com as vendas fechadas, só quem tem papel `admin` vê o botão "Finalizar compra (teste)" na sacola. O pedido de teste aparece em Minha conta e na tabela `pedidos`. Para apagar os pedidos de teste: `delete from public.pedidos;` no SQL Editor (as reservas de estoque saem junto).

**3. Frete real (Melhor Envio):**
1. Coloque o CEP de onde as peças saem em `src/config/loja.ts` (`envio.cepOrigem`) e confira as medidas e o peso da caixa de cada modelo (tabela `modelos`: `peso_kg`, `largura_cm`, `altura_cm`, `comprimento_cm`).
2. Crie uma conta em https://sandbox.melhorenvio.com.br (testes) → **Configurações → Permissões de acesso → Gerar novo token**, com as permissões de cotação (`shipping-calculate`).
3. Na Vercel, crie `MELHOR_ENVIO_TOKEN` (tipo **Secret**) com esse token e faça o Redeploy.
4. Para usar a conta real (melhorenvio.com.br), gere o token lá e crie também `MELHOR_ENVIO_AMBIENTE` = `producao`.

**4. Criar cupons** (até o painel da Fase 5), no SQL Editor:
```sql
-- 10% a partir de R$ 100, válido até o fim do ano, no máximo 50 usos
insert into public.cupons (codigo, tipo, valor, valor_minimo_centavos, valido_ate, limite_usos)
values ('BEMVINDA10', 'percentual', 10, 10000, '2026-12-31 23:59-03', 50);
-- R$ 30 de desconto, sem mínimo
insert into public.cupons (codigo, tipo, valor) values ('CARPI30', 'fixo', 3000);
-- desligar um cupom
update public.cupons set ativo = false where codigo = 'CARPI30';
```

**Regras da compra** (em `src/config/loja.ts`, bloco `envio`): mostrar todas as opções de frete ou só a mais barata, e o frete grátis no Sudeste (com valor mínimo, se quiserem). Preço, cupom, descontos e frete são sempre recalculados no servidor; o que a tela mostra é só uma cópia.

## Fase 2: configurar o Supabase (banco de dados e contas)

Enquanto isto não for feito, o site funciona com os dados fictícios e as telas de conta mostram um aviso de demonstração. Leva uns 20 minutos.

**1. Criar o projeto**
1. Crie uma conta grátis em https://supabase.com (pode entrar com o GitHub).
2. Clique em **New project**. Nome: `carpi-atelie`. Região: **South America (São Paulo)**.
3. Crie uma senha forte para o banco e guarde num gerenciador de senhas. Ninguém (nem eu) precisa dela no dia a dia.

**2. Criar as tabelas**
1. No menu da esquerda, abra **SQL Editor** → **New query**.
2. No GitHub, abra o arquivo `supabase/migrations/20261018000001_inicial.sql`, clique em **Raw**, copie tudo, cole no SQL Editor e clique em **Run**. Deve aparecer "Success".
3. Faça o mesmo com `supabase/seed.sql` (cadastra a Babi, a Isa, a Manu e as três cores).

**3. Endereços do site**
Em **Authentication → URL Configuration**:
- **Site URL:** o link fixo da Vercel (por exemplo `https://carpi-atelie.vercel.app`). Na Fase 6 trocamos por `https://carpiatelie.com.br`.
- **Redirect URLs:** adicione `https://carpi-atelie.vercel.app/**` (o seu link da Vercel seguido de `/**`).

**4. E-mails em português**
Em **Authentication → Emails → Templates**:
- **Confirm signup:** assunto `Confirme o seu e-mail · CARPI Ateliê`; no corpo, cole o conteúdo de `supabase/templates/confirmacao.html`.
- **Reset password:** assunto `Crie uma nova senha · CARPI Ateliê`; no corpo, cole `supabase/templates/recuperacao.html`.

Esses modelos fazem o link funcionar mesmo se a cliente abrir o e-mail em outro aparelho.

> **Importante sobre os e-mails:** sem um serviço de e-mail próprio, o Supabase só envia e-mails para quem faz parte da equipe do projeto, e poucos por hora. Para testar agora, usem os e-mails de vocês (o dono do projeto já faz parte da equipe; para incluir a outra pessoa: **Organization → Team → Invite**). Antes de abrir a loja, configuramos um serviço de envio (Resend, grátis até 3.000 e-mails por mês) com o domínio carpiatelie.com.br, que também vai enviar os e-mails de status dos pedidos.

**5. Ligar o site ao Supabase**
1. No Supabase, abra **Project Settings → API Keys** e copie: **Project URL**, a **Publishable key** e a **Secret key**.
2. Na Vercel, abra o projeto → **Settings → Environment Variables** e crie:

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key |
| `SUPABASE_SECRET_KEY` | Secret key (marque como **Sensitive**) |
| `NEXT_PUBLIC_SITE_URL` | o link fixo da Vercel |

3. Em **Deployments**, clique nos três pontinhos da publicação mais recente → **Redeploy**.

A chave secreta dá acesso total ao banco: nunca a coloque no código, em prints ou em mensagens (nem para mim).

**6. Testar**
Crie uma conta no site com o e-mail de vocês, confirme pelo link do e-mail, adicione um endereço e coloque algo na sacola. No Supabase, em **Table Editor**, vocês veem os dados nas tabelas `perfis`, `enderecos` e `sacola_itens`.

**7. Tornar vocês dois administradores** (vai servir para o painel da Fase 5)
Depois que os dois criarem conta no site, rode no SQL Editor, trocando pelos e-mails de vocês:
```sql
update public.perfis set papel = 'admin' where email in ('email1@exemplo.com', 'email2@exemplo.com');
```

### Onde ficam os dados dos clientes (LGPD)

- Tudo fica no banco do Supabase, no projeto de vocês, na região de São Paulo: perfis (nome, e-mail, CPF, telefone), endereços, favoritos, sacola, pedidos e inscritos na newsletter.
- Senhas ficam criptografadas pelo próprio Supabase; nem vocês conseguem ver.
- Dados de cartão nunca são guardados: são criptografados no navegador da cliente e vão direto para o PagBank.
- Cada cliente só enxerga os próprios dados (regras de segurança "RLS" em todas as tabelas). Só quem tem papel `admin` vê tudo.
- Pedidos de exclusão feitos em Minha conta aparecem na coluna `exclusao_solicitada_em` da tabela `perfis`. A lei pede resposta em até 15 dias; na Fase 5 isso aparece no painel.

### Backup

- O plano grátis do Supabase **não** tem backup automático que vocês possam baixar, e pausa o projeto depois de 7 dias sem uso. Antes de abrir a loja, recomendo o plano **Pro** (cerca de US$ 25 por mês), que tem backup diário dos últimos 7 dias.
- Backup manual a qualquer momento: em **Table Editor**, abra cada tabela → **Export → CSV**. Guarde os arquivos num lugar seguro (eles têm dados pessoais).

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
| Logo | `public/brand/logo.svg` (rosa) e `public/brand/logo-creme.svg` (branco, para fundos escuros). Troque mantendo os nomes. |
| Fotos da Babi | `public/products/babi/` — `mare-apagado.png`, `mare-aceso.png`, `damasco-…`, `roma-…` (recortadas, fundo transparente), `ambiente-1.jpg` e `desenho-tecnico.png`. Mantenha os nomes e as fotos recortadas em pé (proporção 8 × 11). Depois de trocar, aumente o número em `src/lib/fotos.ts` para o site não mostrar a foto antiga guardada em cache. |
| Desenho técnico da Babi | Gerado pelo arquivo `scripts/desenho-tecnico-babi.py` (as medidas ficam no topo dele). Rode `python3 scripts/desenho-tecnico-babi.py` para criar o `desenho-tecnico.svg`, gere o `.png` a partir dele (folha A3 deitada, 2400 px de largura; copie também para `desenhos/`) e aumente o número em `src/lib/fotos.ts`. |
| Foto de João e Nalu (página Sobre nós) | `public/sobre/joao-e-nalu.jpg` — retrato (em pé, proporção 4 × 5), fundo branco. Depois de trocar, aumente o número em `src/lib/fotos.ts`. |
| E-mail, Instagram, CNPJ, razão social, texto da barra do topo, aviso das marcas de impressão (embaixo de "Como funciona" em todos os produtos) | `src/config/loja.ts` |
| Prazo de produção (vale no site todo: produto, frete, finalização, Sobre nós, Pagamentos e entrega) | `src/config/loja.ts`, `prazoProducaoDias` |
| Abrir as vendas (tirar o aviso "Vendas abrem em breve") | `src/config/loja.ts`, trocar `vendasAbertas: false` por `true` (só depois da Fase 4) |
| Preço, descrição e medidas (até a Fase 2) | `src/data/mock.ts` |
| Cores e efeito das luzes | `src/app/globals.css` (bloco `:root` para as cores; seção "Luzes" para o efeito de apagar) |
| Textos das páginas | `src/app/<nome-da-página>/page.tsx`. Os textos marcados como provisórios precisam de revisão. |

## Identidade visual (decisões aprovadas)

- **Três cores:** rosa da marca `#B63A55`, branco e preto `#171717` (só nos textos). Um rosa bem diluído (`#FAF1F3`) separa áreas, no lugar de linhas.
- **Apagar as luzes**: o site inteiro passa para a paleta noturna, só bordô (`#3A1420`) e branco, e os abajures acendem devagar, com brilho na cor de cada um. Botão na página inicial, na coleção, na página do produto e no menu do celular. Ao clicar em **Acender as luzes**, as peças apagam primeiro e depois o site clareia.
- **Logo:** no rosa da marca (`public/brand/logo.svg`).
- **Nome dos produtos:** `BABI  maré` (modelo em caixa alta, dois espaços, cor em minúsculas).
- **Página inicial enxuta:** cores do destaque passam sozinhas; só o preço cheio nos cards; Pix, medidas, cuidados, pagamentos e "como funciona" ficam na página do produto.
- **Cabeçalho fixo** no topo ao rolar a página.
- **Navegação tradicional:** cada clique recarrega a página inteira (o navegador mostra o "carregando"). Para voltar à troca instantânea, tire `<NavegacaoCompleta />` de `src/app/layout.tsx`.
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
- Dados de cartão nunca passam pelo nosso servidor: o SDK do PagBank criptografa o cartão no navegador e o servidor só recebe o texto cifrado.
- O aviso de pagamento do PagBank (`/api/pagbank/aviso`) tem a assinatura conferida (`x-authenticity-token`) e, mesmo assim, o site só marca como pago depois de consultar o pedido no PagBank com o próprio token. Um aviso falso não aprova nada.
- Onde ficam os dados dos clientes e como fazer backup: veja "Fase 2: configurar o Supabase", acima.
- Login, cadastro, pagamento e newsletter têm limite de tentativas por IP (tabela `tentativas`), além dos limites do próprio Supabase.
