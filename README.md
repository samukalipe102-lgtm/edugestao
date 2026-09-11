# EduGestão

Aplicação web de **gestão escolar e diário de classe**.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma (SQLite em dev, PostgreSQL em produção) · NextAuth (credenciais).

> O repositório já vem **pré-configurado para deploy** (PostgreSQL). O jeito mais fácil de publicar é pelo **Railway** — veja [Publicação no Railway](#publicação-no-railway-recomendado--só-cliques). Também há instruções para Render e Vercel. Para desenvolvimento local em SQLite, veja a seção abaixo.

## Como rodar localmente (SQLite)

```bash
npm install                 # instala dependências e gera o Prisma Client
npm run db:use:sqlite       # usa SQLite localmente (o padrão do repo é Postgres)
# defina DATABASE_URL="file:./dev.db" no seu .env
npx prisma db push          # cria o banco SQLite (prisma/dev.db)
npm run db:seed             # cria o usuário administrador inicial
npm run dev                 # http://localhost:3000
```

> **Não** faça commit da troca para SQLite — o repositório deve permanecer em PostgreSQL
> para o deploy na Vercel funcionar. Reverta com `npm run db:use:postgres` antes de commitar.

## Acesso inicial

Após o seed, use:

- **E-mail:** `admin@edugestao.local`
- **Senha:** `admin123`

> Nenhuma turma, aluno, professor ou dado fictício é criado automaticamente.
> Você cadastra tudo pelo painel administrativo.

Para personalizar o admin no seed, defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` no ambiente.

### (Opcional) Dados de demonstração

Para explorar o sistema já preenchido (escola, turma, professor, alunos, notas, frequência, BNCC, aula e material):

```bash
npm run db:seed:demo
```

> Este comando **limpa** todos os dados exceto o administrador e recria um cenário de exemplo. Use apenas em ambiente de teste. Contas criadas:
> - Professor: `professor@escolaexemplo.edu.br` / `teste123`
> - Aluno: `aluno@escolaexemplo.edu.br` / `teste123`

## Perfis e permissões

| Perfil        | Rota base        | Acesso |
|---------------|------------------|--------|
| Administrador | `/admin`         | Painel completo |
| Professor(a)  | `/professor`     | Apenas turmas/disciplinas atribuídas |
| Aluno(a)      | `/aluno`         | Suas notas e frequência |
| Responsável   | `/responsavel`   | Alunos vinculados |

A proteção de rotas é feita por `middleware.ts` + verificação de perfil em cada layout.

## Progresso (blocos)

- [x] **Bloco 1 — Fundação:** projeto, banco, perfis, autenticação, permissões, Configurações da Escola.
- [x] **Bloco 2 — Administração:** disciplinas, professores (com convite + ativação de conta), turmas, atribuições (Turma+Disciplina+Professor), alunos (cadastro, matrícula, transferência, situação).
- [x] **Bloco 3 — Diário:** grade de horários, Portal do Professor (minhas turmas + próximas aulas), diário de classe com chamada (detecção da aula pelo horário, máx. 2 aulas/registro), registro de aula (com seleção de aula planejada), aulas anteriores, frequência e médias. Professor só acessa o que lhe foi atribuído (validado).
- [x] **Bloco 4 — Pedagógico:** banco BNCC (CRUD + importar Sociologia), planejamento do professor (planos + aulas planejadas + importar as 22 aulas de Sociologia + BNCC por disciplina), avaliações e lançamento/edição de notas com médias (normalizadas 0–10) e situação, painéis de notas/planejamento do admin, portais de aluno e responsável com notas e frequência reais.
- [x] **Bloco 5 — Documentos e relatórios:** documentos imprimíveis (boletim, histórico, declaração, ficha individual) e relatórios (por turma, de notas, de frequência, individual), com cabeçalho institucional e assinatura da Secretaria puxados de Configurações da Escola. Layout com CSS de impressão (botão Imprimir / Salvar PDF). Acesso restrito ao admin.
- [x] **Bloco 6 — Polimento:** calendário semanal (admin/professor/aluno) a partir da grade de horários, materiais de apoio por turma/disciplina (professor), remoção de placeholders, revisão de segurança (todas as ações de admin exigem ADMIN; ações do professor validam a atribuição via `getAccessibleAssignment`), UI responsiva (sidebar retrátil no mobile, tabelas com rolagem), e bateria de testes de regressão.

## Testes

Testes de regressão em `scripts/` (cada um limpa seus dados ao final, preservando o admin):

```bash
npx tsx scripts/test-bloco2.mjs   # administração
npx tsx scripts/test-bloco3.mjs   # diário/frequência
npx tsx scripts/test-bloco4.mts   # BNCC/notas/médias
npx tsx scripts/test-bloco6.mts   # materiais/calendário/cascata
```

## Publicação no Railway (recomendado — só cliques)

O Railway cria o banco PostgreSQL sozinho e liga tudo automaticamente. Você só precisa clicar e digitar uma senha.

### Passos (só cliques)

1. Acesse **[railway.app](https://railway.app)** e entre com sua conta do **GitHub**.
2. **New Project → Deploy from GitHub repo → `edugestao`**.
3. Ainda no projeto, clique em **New → Database → Add PostgreSQL**. O Railway cria o banco e disponibiliza o `DATABASE_URL` automaticamente.
4. Abra o serviço do app → aba **Variables** → adicione (com **New Variable**):
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (o Railway sugere a referência ao banco; basta selecionar)
   - `NEXTAUTH_SECRET` = qualquer texto longo aleatório (ex.: `edugestao-prod-8f3k2n9x7q1w5e4r6t8y0u2i3o5p`)
   - `ADMIN_PASSWORD` = a senha que você quer para o administrador
5. Em **Settings → Networking → Generate Domain**, gere a URL pública. Copie-a e crie a variável:
   - `NEXTAUTH_URL` = a URL gerada (ex.: `https://edugestao-production.up.railway.app`)
6. O Railway redeploya sozinho. Ao terminar, acesse a URL e faça login:
   - **E-mail:** `admin@edugestao.local`
   - **Senha:** a que você definiu em `ADMIN_PASSWORD`

As tabelas e o administrador são criados automaticamente no start (`scripts/start.mjs`).

---

## Publicação no Render (alternativa)

O Render também funciona. Crie um **PostgreSQL** e um **Web Service** a partir deste repositório, e defina as variáveis `DATABASE_URL` (ligada ao banco), `NEXTAUTH_SECRET`, `NEXTAUTH_URL` e `ADMIN_PASSWORD`. As tabelas e o admin são criados no start.

---

## Publicação na Vercel (alternativa)

O repositório também está pré-configurado para a Vercel com PostgreSQL. As tabelas do banco e o usuário administrador são criados **automaticamente no deploy**. Nenhuma credencial fica no código; tudo vem de variáveis de ambiente (`.env` não é versionado).

### 1. Crie um banco PostgreSQL gerenciado

Use um provedor gratuito, por exemplo **Neon** (neon.tech), **Supabase** ou **Vercel Postgres**. Copie a *connection string* (algo como `postgresql://usuario:senha@host/db?sslmode=require`).

### 2. Importe o projeto na Vercel

Em **vercel.com** → **Add New… → Project** → importe o repositório do GitHub. O framework **Next.js** é detectado automaticamente (build definido em `vercel.json`).

### 3. Defina as variáveis de ambiente na Vercel

Em **Settings → Environment Variables**, adicione:

| Variável | Valor | Obrigatória |
|---|---|:---:|
| `DATABASE_URL` | connection string do seu Postgres (com `?sslmode=require`) | ✅ |
| `NEXTAUTH_SECRET` | segredo forte — gere com `openssl rand -base64 32` | ✅ |
| `NEXTAUTH_URL` | a URL pública do site (ex.: `https://edugestao.vercel.app`) | ✅ |
| `ADMIN_PASSWORD` | senha do administrador inicial | ✅ |
| `ADMIN_EMAIL` | e-mail do administrador inicial (padrão: `admin@edugestao.local`) | opcional |

### 4. Deploy

Clique em **Deploy**. Durante o build, o projeto executa automaticamente (via `scripts/build.mjs`):

1. `prisma generate`
2. `prisma db push` — cria as tabelas no seu Postgres (se `DATABASE_URL` estiver definida);
3. seed do administrador — cria o admin com `ADMIN_EMAIL`/`ADMIN_PASSWORD` (idempotente: não recria se já existir);
4. `next build`.

Ao terminar, o EduGestão estará acessível pela URL da Vercel. Faça login com o e-mail/senha do admin definidos nas variáveis; todo o resto é cadastrado pelo painel.

> **Nota sobre a `NEXTAUTH_URL`:** no primeiro deploy você ainda não sabe a URL final. Você pode fazer o deploy, copiar a URL gerada pela Vercel, definir `NEXTAUTH_URL` com ela e **redeployar** — ou usar um domínio fixo desde o início.

### Segurança (resumo)

- Nenhum segredo é commitado; `.env` está no `.gitignore`.
- `NEXTAUTH_SECRET` e `ADMIN_PASSWORD` vêm apenas das variáveis de ambiente.
- Os passos de banco no build são "best-effort": se o banco estiver indisponível no momento do build, o deploy não trava — a aplicação passa a funcionar assim que o banco estiver acessível (basta um redeploy).
