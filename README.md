# Clareia

Plataforma de estudos focada em preparação para o ENEM e Inglês, com acesso Google, identificação por nome e RA + dígito, progresso individual sincronizado e Central ADM.

## O que existe hoje

- Plano ENEM com 747 itens de estudo organizados por matéria e nível.
- Caderno SAME com 1.000 questões: 400 de Matemática e 600 de Ciências da Natureza.
- Versão textual das 1.000 questões e visualização do PDF original para contas autorizadas.
- Banco rápido com correção para Linguagens, Matemática, Inglês, Natureza e Humanas.
- Registro de 35 provas antigas e 12 simulados.
- Redação com nota, competência prioritária, próximo passo e histórico.
- Trilha introdutória de Inglês A1–A2 com 24 aulas dentro da plataforma, vocabulário, exemplos, prática e check de domínio.
- Agenda pessoal com prazos, ordenação e aviso de atraso.
- Central ADM para usuários, permissões do PDF, bloqueio, zeragem de progresso, conteúdo, aviso geral, manutenção e auditoria.

## Acesso e dados

1. O aluno entra com Google.
2. No primeiro acesso, confirma nome completo, nome de exibição e RA + dígito.
3. A reserva do RA e o perfil são gravados juntos em um lote atômico do Firestore.
4. O progresso fica no navegador e é sincronizado na conta Google.
5. Somente a conta proprietária definida em `app/access-control.ts` e nas regras enxerga o ADM.

A senha do Google nunca passa pela Clareia. O PDF não fica no GitHub nem na Vercel: o ADM valida o arquivo, divide em partes menores e grava o conteúdo protegido no Firestore.

## Desenvolvimento

Requisitos: Node.js 22.13 ou superior.

No PowerShell do VS Code:

```powershell
npm.cmd install
npm.cmd run dev
```

Use o endereço exibido pelo terminal. Verificações principais:

```powershell
npm.cmd run lint
npm.cmd test
$env:VERCEL="1"; npm.cmd run build
```

As instruções de publicação estão em [ATUALIZACAO.md](./ATUALIZACAO.md).
