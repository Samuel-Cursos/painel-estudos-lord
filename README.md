# Painel de Estudos do Lord

Painel Next.js pronto para GitHub e Vercel. O progresso é salvo no aparelho e, quando você entra com Google, também no Firebase.

## 1. Finalizar o Firebase

1. Abra o [Firebase Console](https://console.firebase.google.com/) e entre no projeto `painel-estudos-491a7`.
2. Vá em **Build > Authentication > Sign-in method**.
3. Ative **Google**, escolha um e-mail de suporte e salve.
4. Vá em **Build > Firestore Database** e crie o banco em **Production mode**.
5. Abra a aba **Rules**, copie todo o conteúdo de `firestore.rules`, cole e clique em **Publish**.
6. Em **Authentication > Settings > Authorized domains**, adicione:
   - `painel-estudos-lord.validodiscord.chatgpt.site`
   - depois do deploy, adicione também o endereço sem `https://` que a Vercel criar, por exemplo `painel-estudos-lord.vercel.app`.

## 2. Testar no computador

Instale o Node.js LTS. Depois abra o terminal dentro desta pasta e rode:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## 3. Colocar no GitHub

1. Instale o Git e crie uma conta no GitHub.
2. No GitHub, clique em **New repository**.
3. Nome: `painel-estudos-lord`.
4. Escolha **Private** e não marque README, `.gitignore` ou licença.
5. Clique em **Create repository**.
6. No terminal, dentro desta pasta, rode os comandos abaixo. Troque `SEU-USUARIO` pelo seu usuário do GitHub:

```bash
git init
git add .
git commit -m "Painel de estudos completo"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/painel-estudos-lord.git
git push -u origin main
```

## 4. Publicar na Vercel

1. Entre em [vercel.com](https://vercel.com/) usando o GitHub.
2. Clique em **Add New > Project**.
3. Encontre `painel-estudos-lord` e clique em **Import**.
4. Confirme **Framework Preset: Next.js**.
5. Não precisa criar variável de ambiente: a configuração web do Firebase é pública e já está no projeto. A segurança vem do login e das regras do Firestore.
6. Clique em **Deploy**.
7. Quando terminar, copie o domínio criado pela Vercel.
8. Volte ao Firebase em **Authentication > Settings > Authorized domains** e adicione esse domínio sem `https://` e sem barra no final.
9. Abra o site da Vercel no notebook, entre com Google e marque uma aula. Depois abra o mesmo site no celular, entre com a mesma conta e confira o progresso.

## Atualizações futuras

Edite os arquivos, teste e rode:

```bash
git add .
git commit -m "Atualiza o painel"
git push
```

A Vercel publica a atualização automaticamente depois do `git push`.
