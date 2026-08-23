# Clareia

Plataforma de estudos focada em preparação para o ENEM e Inglês, com acesso Google, identificação por nome e RA + dígito, progresso individual sincronizado e Central ADM.

## O que existe hoje

- Plano ENEM com 747 itens de estudo organizados por matéria e nível.
- Banco principal com 2.000 questões: 400 de Matemática e 200 de cada uma das outras oito matérias do ENEM.
- Linguagens, História, Geografia, Filosofia e Sociologia funcionam em formato nativo, com alternativas e correção imediata; o PDF original das quatro matérias iniciais continua disponível para contas autorizadas.
- Banco rápido com correção para Linguagens, Matemática, Inglês, Natureza e Humanas.
- Modo Prova completo nas 17 edições de 2009 a 2025: 3.060 questões dentro da Clareia, sem leitor de PDF e em uma sequência contínua de 180 questões.
- Gabarito oficial, correção imediata, mapa de pendentes, cronômetro, retomada sincronizada, resultado por área e revisão de erros.
- Estúdio de Redação com propostas, coletâneas, projeto de texto, editor, rascunho automático, correção e histórico.
- Trilha introdutória de Inglês A1–A2 com 24 aulas dentro da plataforma, vocabulário, exemplos, prática e check de domínio.
- Agenda pessoal com prazos, ordenação e aviso de atraso.
- Central ADM para usuários, permissões do PDF, bloqueio, zeragem de progresso, questões, propostas de redação, redações de apoio, aviso geral, manutenção e auditoria.

## Acesso e dados

1. O aluno entra com Google.
2. No primeiro acesso, confirma nome completo, nome de exibição e RA + dígito.
3. A reserva do RA e o perfil são gravados juntos em um lote atômico do Firestore.
4. O progresso fica no navegador e é sincronizado na conta Google.
5. Somente a conta proprietária definida em `app/access-control.ts` e nas regras enxerga o ADM.

A senha do Google nunca passa pela Clareia. O PDF não fica no GitHub nem na Vercel: o ADM valida o arquivo, divide em partes menores e grava o conteúdo protegido no Firestore.

Os cadernos e gabaritos antigos permanecem nos endereços oficiais do INEP. A Clareia organiza os anos e guarda somente as respostas, anotações e resultados do estudante. A correção automática mostra acertos brutos; ela não tenta reproduzir a nota TRI oficial.

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
