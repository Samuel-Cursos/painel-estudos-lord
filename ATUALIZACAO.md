# Atualizar o Painel de Estudos do Lord

Este pacote já contém o site, as 1.000 questões em texto, os checks de aprendizado, o painel ADM e o PDF compacto em `private-materials/caderno-same.pdf`.

## 1. Abrir e testar no VS Code

Abra a pasta deste projeto no VS Code. No terminal PowerShell, execute:

```powershell
npm.cmd install
npm.cmd run dev
```

Abra o endereço mostrado no terminal (normalmente `http://localhost:3000`).

## 2. Publicar as regras do Firebase

No mesmo terminal:

```powershell
npm.cmd install -g firebase-tools
firebase.cmd login
firebase.cmd deploy --project painel-estudos-491a7 --only firestore:rules,storage
```

Na primeira publicação das regras do Storage, o Firebase pode pedir para permitir que o Storage consulte o Firestore. Aceite, pois essa consulta é o que protege o PDF por usuário.

## 3. Enviar o PDF protegido

1. Entre no site com `samuelreisalves765@gmail.com`.
2. Abra **ADM** no menu.
3. Em **Caderno SAME**, clique em **Enviar ou substituir PDF**.
4. Selecione `private-materials/caderno-same.pdf`.
5. Aguarde a mensagem de upload concluído.

A pasta `private-materials` está no `.gitignore`: o PDF não será enviado ao GitHub ou à Vercel.

## 4. Mandar esta atualização ao GitHub

O usuário e o e-mail já estão preenchidos abaixo. Execute dentro da pasta do projeto:

```powershell
git init
git config user.name "Samuel-Cursos"
git config user.email "samuelreisalves765@gmail.com"
git branch -M main
if (git remote | Select-String -Quiet '^origin$') { git remote set-url origin https://github.com/Samuel-Cursos/painel-estudos-lord.git } else { git remote add origin https://github.com/Samuel-Cursos/painel-estudos-lord.git }
git add .
git commit -m "Adiciona ADM, PDF protegido e checks de aprendizado"
git push -u origin main
```

Se aparecer `nothing to commit`, os arquivos já foram adicionados. Execute apenas `git push -u origin main`.

## 5. Vercel

Se a Vercel já está conectada ao repositório `Samuel-Cursos/painel-estudos-lord`, o push inicia a publicação automaticamente. Abra o painel da Vercel, entre no projeto e aguarde o deploy ficar **Ready**. O endereço continua `https://painel-estudos-lord.vercel.app`.

## Como funciona o acesso

- Sem login: 1.000 questões em texto e treino rápido por matéria.
- Usuário logado sem permissão: mesma versão em texto, com progresso sincronizado.
- Dono e pessoas liberadas no ADM: enunciado original renderizado do PDF protegido.
- Só `samuelreisalves765@gmail.com` enxerga e controla o ADM.
- Para liberar alguém, essa pessoa precisa entrar com Google uma vez; depois aparece na lista do ADM.

## Material futuro de terceiros

Não coloque uma apostila privada em `public/` nem transforme seu conteúdo em texto público. Use outro caminho protegido no Firebase e conceda acesso apenas ao seu UID.
