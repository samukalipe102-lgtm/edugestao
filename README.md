# EduGestão

Aplicação web de **gestão escolar e diário de classe**.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma (SQLite em dev, PostgreSQL em produção) · NextAuth (credenciais).

## Como rodar

```bash
npm install            # instala dependências e gera o Prisma Client
npx prisma db push     # cria/atualiza o banco SQLite (prisma/dev.db)
npm run db:seed        # cria o usuário administrador inicial
npm run dev            # ambiente de desenvolvimento (http://localhost:3000)
```

Build de produção:

```bash
npm run build && npm run start
```

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

## Publicação (GitHub + Vercel + Postgres)

O projeto **já está preparado para deploy**. Nenhuma credencial fica no código — tudo vem de variáveis de ambiente. O `.env` real **não** é versionado (veja `.gitignore`); use `.env.example` como referência.

> **Por que trocar o banco?** Em desenvolvimento local o padrão é **SQLite** (arquivo `prisma/dev.db`). Em produção serverless (Vercel) o sistema de arquivos é efêmero, então use um **PostgreSQL gerenciado** (Neon, Supabase, Vercel Postgres, etc.).

### Passo 1 — Enviar o código ao GitHub

Crie um repositório vazio no GitHub e faça o push:

```bash
git remote add origin https://github.com/SEU-USUARIO/edugestao.git
git push -u origin main
```

### Passo 2 — Preparar o banco para produção (PostgreSQL)

```bash
npm run db:use:postgres    # troca o provider do schema para postgresql
```

Faça commit dessa alteração (o schema passa a ter `provider = "postgresql"`).
Depois, com a `DATABASE_URL` do seu Postgres definida no ambiente:

```bash
npx prisma db push         # cria as tabelas no banco de produção
```

> Para voltar ao SQLite local a qualquer momento: `npm run db:use:sqlite`.

### Passo 3 — Deploy na Vercel

1. Em **vercel.com**, importe o repositório do GitHub (framework detectado: **Next.js**). O build já está definido em `vercel.json` (`prisma generate && next build`).
2. Configure as **Environment Variables** no projeto da Vercel:

   | Variável | Valor |
   |---|---|
   | `DATABASE_URL` | connection string do seu Postgres (com `sslmode=require`) |
   | `NEXTAUTH_SECRET` | segredo forte — gere com `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | a URL pública do site (ex.: `https://edugestao.vercel.app`) |
   | `ADMIN_PASSWORD` | senha do admin inicial (**obrigatória** em produção) |
   | `ADMIN_EMAIL` | (opcional) e-mail do admin inicial |

3. Faça o **Deploy**.
4. **Uma única vez**, crie as tabelas e o administrador no banco de produção. Rode localmente com a `DATABASE_URL` de produção apontada:

   ```bash
   npx prisma db push
   npm run db:seed        # exige ADMIN_PASSWORD em produção
   ```

Pronto — o EduGestão estará acessível pela URL da Vercel. O primeiro acesso é com o admin criado no seed; todo o resto é cadastrado pelo painel.

### Segurança em produção (resumo)

- `NEXTAUTH_SECRET` **sempre** definido (nunca use o valor de exemplo).
- `ADMIN_PASSWORD` obrigatório: o seed **aborta** em produção se ele não estiver definido.
- Nenhum segredo é commitado; `.env` está no `.gitignore`.
