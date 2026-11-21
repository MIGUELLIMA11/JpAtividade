# Resultado · Chrome DevTools

**Nome: Miguel de Sousa Lima**

| Categoria | Antes | Depois |
|---|---|---|
| Acessibilidade | 89 | 100 |
| Boas práticas | 100 | 100 |
| SEO | 90 | 100 |

> **Missão 2:** auditoria Lighthouse real executada para a revisão anterior (`3970be6`) e para a revisão atual, sem alterar o código-fonte.

## Falhas no Antes (Lighthouse real)

- **Acessibilidade:** `color-contrast`, `label-content-name-mismatch`, `select-name`.
- **SEO:** `meta-description`.
- **Boas práticas:** sem falhas.

## O que foi corrigido (1 ou 2 linhas)

Corrigidos rótulos de campos, contraste de textos (incluindo tabela, rodapé e orçamento), descrição SEO e o nome acessível da marca; também foi preservado o ajuste de layout para 375 px sem overflow.

## O que o agente fez aqui que o webfetch não faria? (1 ou 2 linhas)

Com Chrome DevTools, o agente pode abrir a aplicação renderizada, interagir com formulários, inspecionar console, alterar viewport e capturar a página. O `webfetch` só recupera conteúdo HTTP e não reproduz esse fluxo de navegador.
