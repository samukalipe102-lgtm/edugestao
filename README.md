# EduGestão

Aplicação web de **gestão escolar e diário de classe**.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma (SQLite em dev, PostgreSQL em produção) · NextAuth (credenciais).

> O repositório já vem **pré-configurado para deploy** (PostgreSQL). O jeito mais fácil de publicar é pelo **Render** (1 clique, cria banco + site juntos) — veja [Publicação no Render](#publicação-no-render-recomendado--1-clique). Também há instruções para a Vercel. Para desenvolvimento local em SQLite, veja a seção abaixo.

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

## Publicação no Render (recomendado — 1 clique)

O jeito mais simples: o Render cria **o banco PostgreSQL e o site juntos**, automaticamente, a partir do arquivo `render.yaml` já incluído no repositório. Você não precisa criar banco à parte nem copiar connection string.

### Passos

1. Acesse **[dashboard.render.com](https://dashboard.render.com)** e crie uma conta (pode usar o GitHub).
2. Clique em **New → Blueprint** e selecione o repositório **`edugestao`**.
3. O Render lê o `render.yaml` e mostra o que será criado: **1 banco PostgreSQL** + **1 web service**. Ele vai pedir para você preencher duas variáveis:
   - **`ADMIN_PASSWORD`** — a senha do administrador inicial (escolha uma forte).
   - **`NEXTAUTH_URL`** — deixe em branco por enquanto (ou coloque `http://localhost` provisoriamente).
4. Clique em **Apply**. O Render cria o banco, conecta o `DATABASE_URL` automaticamente, gera o `NEXTAUTH_SECRET` sozinho, e durante o build cria as **tabelas** e o **administrador**.
5. Quando o deploy terminar, copie a URL pública gerada (ex.: `https://edugestao.onrender.com`), cole em **`NEXTAUTH_URL`** nas variáveis do serviço e clique em **Manual Deploy → Deploy latest commit**. (Esse segundo deploy é rápido.)

Pronto! Acesse a URL e faça login com `ADMIN_EMAIL` (padrão `admin@edugestao.local`) e a `ADMIN_PASSWORD` que você definiu. Todo o resto é cadastrado pelo painel.

> **Plano gratuito do Render:** o site "hiberna" após um tempo sem uso e demora alguns segundos para acordar no primeiro acesso — normal no tier free.

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
