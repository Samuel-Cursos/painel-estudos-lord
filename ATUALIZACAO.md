# Atualizar o Painel de Estudos do Lord

Este pacote contém o site completo para estudantes do 6º ano do Fundamental à 3ª série do Ensino Médio. São 5.400 atividades organizadas por série e matéria, 55 questões rápidas corrigidas, o caderno SAME com 1.000 questões para o Ensino Médio, checks de aprendizado e a Central ADM.

## 1. Abrir e testar no VS Code

Abra a pasta deste projeto no VS Code. No terminal PowerShell, execute:

```powershell
npm.cmd install
npm.cmd run dev
```

Abra o endereço mostrado no terminal (normalmente `http://localhost:3000`).

## 2. Publicar as regras gratuitas do Firebase

No mesmo terminal:

```powershell
npm.cmd install -g firebase-tools
firebase.cmd login
firebase.cmd use painel-estudos-491a7
firebase.cmd deploy --project painel-estudos-491a7 --only firestore:rules
```

Não ative o Firebase Storage e não faça upgrade para o plano Blaze. O projeto usa somente o Firestore do plano gratuito.

As novas regras são obrigatórias para salvar a série de cada estudante, permitir que o ADM altere essa série, ler o progresso, publicar questões e registrar o histórico administrativo.

## 3. Conferir o PDF protegido

1. Entre no site com `samuelreisalves765@gmail.com`.
2. Abra **ADM** no menu.
3. Abra **ADM → Conteúdo**.
4. Se o cartão disser **PDF protegido pronto**, não envie novamente.
5. Se estiver vazio, clique em **Enviar ou substituir PDF** e escolha seu PDF compacto de até 25 MB.

A pasta `private-materials` está no `.gitignore`: o PDF não será enviado ao GitHub ou à Vercel. O painel ADM divide o arquivo em partes menores e as guarda com proteção no Firestore.

## 4. Mandar esta atualização ao GitHub

O usuário e o e-mail já estão preenchidos abaixo. Execute dentro da pasta do projeto:

```powershell
git init
git config user.name "Samuel-Cursos"
git config user.email "samuelreisalves765@gmail.com"
git branch -M main
if (git remote | Select-String -Quiet '^origin$') { git remote set-url origin https://github.com/Samuel-Cursos/painel-estudos-lord.git } else { git remote add origin https://github.com/Samuel-Cursos/painel-estudos-lord.git }
git add .
git commit -m "Organiza painel por serie escolar"
git push -u origin main
```

Se aparecer `nothing to commit`, os arquivos já foram adicionados. Execute apenas `git push -u origin main`.

## 5. Vercel

Se a Vercel já está conectada ao repositório `Samuel-Cursos/painel-estudos-lord`, o push inicia a publicação automaticamente. Abra o painel da Vercel, entre no projeto e aguarde o deploy ficar **Ready**. O endereço continua `https://painel-estudos-lord.vercel.app`.

## Como funciona o acesso

- No primeiro acesso, o estudante escolhe entre 6º, 7º, 8º, 9º, 1ª, 2ª ou 3ª série.
- Cada série recebe somente suas matérias, 10 unidades por matéria e 100 atividades por matéria.
- A escolha funciona sem login neste aparelho e sincroniza entre aparelhos quando a pessoa entra com Google.
- Alunos do Ensino Médio veem o caderno SAME em texto; dono e pessoas liberadas também veem o PDF original reconstruído das partes protegidas do Firestore.
- Só `samuelreisalves765@gmail.com` enxerga a Central ADM e tem acesso permanente a tudo.
- Para liberar alguém, essa pessoa precisa entrar com Google uma vez; depois aparece na lista do ADM.

## O que a nova Central ADM controla

- Visão geral de usuários, etapas concluídas, questões respondidas e tarefas abertas.
- Progresso individual, última atividade, série escolar, permissão do PDF, bloqueio do painel e zeragem real em todos os aparelhos.
- Criação e exclusão de questões de múltipla escolha ou resposta escrita.
- Upload e substituição do PDF protegido.
- Check de conclusão, banco público, PDF, modo manutenção, aviso geral e meta diária.
- Histórico das últimas ações administrativas.

## Material futuro de terceiros

Não coloque uma apostila privada em `public/` nem transforme seu conteúdo em texto público. Use outro caminho protegido no Firebase e conceda acesso apenas ao seu UID.
