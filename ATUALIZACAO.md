# Atualizar a Clareia

## 1. Testar no VS Code

Abra a pasta do projeto e execute no PowerShell:

```powershell
npm.cmd install
npm.cmd run lint
npm.cmd test
$env:VERCEL="1"; npm.cmd run build
```

Para abrir localmente:

```powershell
npm.cmd run dev
```

## 2. Publicar as regras do Firebase

Esta etapa é obrigatória quando `firestore.rules` muda. As regras protegem perfis, RA, progresso, folhas de respostas, materiais de Redação, permissões do PDF, configurações e ADM.

```powershell
npx.cmd firebase-tools login
npx.cmd firebase-tools deploy --only firestore:rules --project painel-estudos-491a7
```

O cadastro usa o formato `RA-DÍGITO`. Se as regras antigas estiverem publicadas, um aluno novo pode entrar com Google e ficar travado na criação do perfil.

## 3. Conferir o PDF protegido

1. Entre em `https://painel-estudos-lord.vercel.app` com a conta proprietária.
2. Abra **ADM → Conteúdo**.
3. Confira se o cartão mostra o nome do arquivo, tamanho e quantidade de partes.
4. Só substitua se necessário. O arquivo precisa ser um PDF válido de até 25 MB.

O PDF não deve ser colocado em `public/`, no GitHub ou na Vercel. A Clareia o guarda em partes protegidas no Firestore. Um envio interrompido limpa automaticamente as partes incompletas.

## 4. Publicar no GitHub

Dentro da pasta do projeto:

```powershell
git add .
git commit -m "Adiciona provas oficiais e novo estudio de redacao"
git push origin main
```

Se aparecer `nothing to commit`, execute apenas o `git push`. A Vercel inicia o deploy automaticamente porque o projeto está conectado ao repositório `Samuel-Cursos/painel-estudos-lord`.

## 5. Verificar a produção

Espere o deploy ficar **Ready** e confira:

- entrada com Google e cadastro de um perfil novo;
- Modo Prova completo de 2009 a 2025, com 180 questões contínuas dentro da Clareia;
- correção imediata pelo gabarito oficial, cronômetro, retomada, mapa de pendentes e resultado por área;
- Redação, textos de apoio, projeto de texto, editor e rascunho;
- publicação de propostas e redações-modelo pelo ADM;
- Início, Plano ENEM, Questões, Inglês e Agenda;
- carregamento textual das 2.000 questões;
- PDF em uma conta liberada pelo ADM;
- Central ADM, configurações e histórico;
- celular e computador;
- ausência de erros da aplicação no console.

Endereço oficial: `https://painel-estudos-lord.vercel.app`

## Escopo atual, sem ambiguidade

- A Clareia não pede série, data de nascimento ou e-mail institucional.
- O Google autentica; nome e RA + dígito identificam o perfil do estudante.
- O banco principal de 2.000 questões cobre as nove matérias do plano ENEM: Matemática, Linguagens, Biologia, Química, Física, História, Geografia, Filosofia e Sociologia.
- As 24 aulas de Inglês e seus checks funcionam dentro do próprio site; o apoio do ChatGPT é opcional.
- Só a conta proprietária acessa o ADM e tem acesso permanente ao PDF.
