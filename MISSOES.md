# Missões — Chrome DevTools MCP

Abra dois terminais na raiz do projeto.

**Terminal 1**: `npm run dev`

**Terminal 2**: `opencode` (é necessário tê-lo instalado localmente; confira o Google Chrome). No OpenCode execute `/mcps` e confirme a conexão `chrome-devtools`.

## Missão 1 — Build

> Use o chrome-devtools para abrir http://localhost:5173, salvar um print em prints/01-inicio.png e listar os erros e avisos do console. Não altere nenhum arquivo do projeto.

## Missão 2 — Build

> Use o chrome-devtools para rodar o Lighthouse em http://localhost:5173. Mostre as notas de Acessibilidade, Boas práticas e SEO e liste, em português, as auditorias que falharam. Não altere nenhum arquivo do projeto.

Copie as notas reais para a coluna **Antes** do `RESULTADO.md` (histórico inicial no Git: commit `missao 2`). Se a auditoria não executar, não invente valores.

## Missão 3 — Build

> Use o chrome-devtools para redimensionar a página para 375 x 667, adicionar um gasto (por exemplo, Café de teste de R$ 12,50) e salvar um print em prints/03-celular.png. Diga o que ficou quebrado no layout. Não altere nenhum arquivo do projeto.

## Missão 4 — Plan → Build

> Use o chrome-devtools. Planeje a correção das falhas reais do Lighthouse identificadas na missão 2, considerando também a visualização móvel. Não altere o código ainda. Ao executar o plano, rode o Lighthouse de novo e salve um print em prints/04-corrigido.png.

Revise o plano. Mude para **Build**, peça `execute o plano`, revise o diff, anote as notas reais na coluna **Depois** e faça o commit final.

## Commits

O `.git` já registra commits por etapa da atividade e a implementação da correção. Os prints existentes foram capturados pelo Chromium via CDP, não pelo agente OpenCode. Se sua disciplina exigir que **as capturas sejam obtidas pelo agente**, rode os prompts acima na sua máquina e substitua esses prints pelos gerados por ele. O comando `/mcps` não foi validado neste ambiente.

## Observação sobre Lighthouse

O pacote do Lighthouse não está disponível no ambiente em que esta entrega foi construída. `RESULTADO.md` deixa as notas como **Pendente** até uma auditoria oficial efetivamente ser executada no Google Chrome. Essa ausência não deve ser confundida com nota zero.
