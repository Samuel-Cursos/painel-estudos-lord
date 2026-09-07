# Redações do ENEM · 2020–2025

Nova opção em **Redação → Redações do ENEM**, ao lado do módulo de redação livre e dos materiais do ADM.

## Propostas

`app/enem-writing-data.ts` registra tema, página e fonte de cada aplicação regular impressa. Não inclui digital, PPL, reaplicação ou aplicação especial. Todas as páginas foram conferidas no caderno original em 07/09/2026.

| Ano | Página do caderno amarelo |
| --- | --- |
| 2025 | 20 |
| 2024 | 19 |
| 2023 | 19 |
| 2022 | 20 |
| 2021 | 21 |
| 2020 | 19 |

O leitor usa PDF.js para abrir diretamente a página da redação, incluindo gráficos e imagens. A rota `/api/enem-writing/[year]` transmite os PDFs de URLs fixas porque o acervo não libera CORS. Não aceita URLs fornecidas pelo cliente. Cache público de um dia; falhas não são armazenadas. Os PDFs não fazem parte do repositório.

O PDF de 2021 apresentou falhas no RIEP. A alternativa é uma cópia integral hospedada pelo Brasil Escola, cujo MD5 `a3e9f676b464f1f58df067074a4fd18c` coincide com o checksum informado pela API oficial do Inep. Seu mapeamento de fontes não permite extrair texto legível: a página original permanece disponível com ampliação até 400%, e a interface explica a indisponibilidade da leitura textual. Caracteres corrompidos nunca entram na comparação de trechos.

## Rascunhos e histórico

- Salvamento local imediato, separado por usuário e por ano; troca de ano não apaga o texto.
- “Guardar na conta” e “Finalizar redação” usam o histórico e a sincronização Firebase já existentes. O painel informa o estado real da sincronização.
- Nova tentativa e abertura de outra tentativa guardam a produção atual no histórico antes da troca.
- Redações anteriores continuam no módulo livre; registros ENEM recebem `enemYear` e podem guardar `selfReview`.
- A edição mais recente prevalece ao combinar rascunho local e histórico. IDs são preservados ao salvar uma mesma tentativa.

## Revisão sem IA

Contagens de palavras/parágrafos, palavras consecutivas possivelmente duplicadas, períodos longos, pontuação final e sequências de 12 palavras coincidentes com a página de apoio. O próprio tema é excluído dessa comparação. Esses sinais não determinam plágio, pertinência ao tema, qualidade argumentativa ou nota.

A checklist das cinco competências é preenchida pelo estudante; mudar o texto desmarca os itens. Há espaço para registrar manualmente uma nota e orientações recebidas de professor. Nenhum serviço ou modelo de IA é chamado.

## Validação

`node --test tests/*.test.mjs` após o build verifica catálogo, isolamento e recuperação dos rascunhos, preservação do histórico livre, revisão mecânica, rejeição de extração corrompida e a rota compilada com falhas de origem simuladas. Os 15 testes anteriores também permanecem na suíte. Builds Sites/Vinext e Next.js/Vercel são compatíveis. O teste da rota usa respostas simuladas; não equivale a uma sessão autenticada de navegador nem a uma gravação real no Firebase.
