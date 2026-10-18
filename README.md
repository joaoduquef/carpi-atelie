# CARPI Ateliê

Loja online da CARPI Ateliê (carpiatelie.com.br): abajures de design feitos sob encomenda.

## Em que fase estamos

| Fase | O que entra | Situação |
|---|---|---|
| 1. Visual | Todas as páginas, paleta, fonte, celular e "Apagar as luzes" | **Aprovada** |
| 2. Banco de dados | Supabase, cadastro e login, produtos e estoque vindos do banco | **Pronta para teste** (precisa configurar o Supabase, veja abaixo) |
| 3. Sacola e checkout | Cupons, frete pelo Melhor Envio, frete grátis no Sudeste | A fazer |
| 4. Pagamento | Pagar.me e PagBank em teste, cartão e Pix, baixa de estoque | A fazer |
| 5. Painel admin | Produtos, pedidos, status, rastreio, cupons, newsletter, e-mails | A fazer |
| 6. Publicação | Vercel, domínio, checklist final | A fazer |

### O que ainda é simulado

- **Frete:** qualquer CEP de 01000-000 a 39999-999 (Sudeste) dá "Grátis"; os outros dão R$ 39,90. O valor real vem do Melhor Envio na Fase 3.
- **Cupom:** só o cupom de teste `CARPI10` (10% a partir de R$ 100). Os cupons reais serão criados no painel.
- **Juros do cartão:** valores de exemplo (2,99% ao mês). Os reais vêm do intermediador.
- **Pix:** o QR Code é um desenho, não paga nada.
- **Sem o Supabase configurado:** o catálogo vem de `src/data/mock.ts` e as telas de conta mostram uma conta fictícia ("Ana Souza").
- **Com o Supabase configurado (Fase 2):** cadastro, login, recuperação de senha, Minha conta, newsletter e catálogo funcionam de verdade. Sacola e favoritos ficam no navegador e passam para a conta quando a cliente entra.

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
- Dados de cartão nunca são guardados (Fase 4).
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
| Desenho técnico da Babi | Gerado pelo arquivo `scripts/desenho-tecnico-babi.py` (as medidas ficam no topo dele). Rode `python3 scripts/desenho-tecnico-babi.py` para criar o `desenho-tecnico.svg`, gere o `.png` a partir dele e aumente o número em `src/lib/fotos.ts`. |
| Foto de João e Nalu (página Sobre nós) | `public/sobre/joao-e-nalu.jpg` — retrato (em pé, proporção 4 × 5), fundo branco. Depois de trocar, aumente o número em `src/lib/fotos.ts`. |
| E-mail, Instagram, CNPJ, razão social, texto da barra do topo | `src/config/loja.ts` |
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
- Onde ficam os dados dos clientes e como fazer backup: veja "Fase 2: configurar o Supabase", acima.
- Login, cadastro, pagamento e newsletter têm limite de tentativas por IP (tabela `tentativas`), além dos limites do próprio Supabase.
