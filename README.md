# Sea Power — Unit Database

App web estática gerada a partir de `sea-power-unit-database.xlsx` (Sea Power: base game + 80 mods do Steam Workshop).

## Dados
- **Ships** — 593 unidades (ID, nome, nação, classe, código, dimensões, deslocamento, velocidade, variantes, fonte)
- **Aircraft** — 420 unidades (ID, nome, nação, tipo, capacidade de porta-aviões, fonte)
- **Armaments** — 666 unidades (ID, nome, nação, categoria, tipo de módulo, cadência, fonte)
- **Munitions** — 1724 unidades (ID, nome, nação, tipo, massa, fonte)

## Funcionalidades
- Abas por categoria com contagem de registos
- Pesquisa por nome ou ID
- Filtros por nação, tipo/classe e fonte (Base Game vs Mods)
- Ordenação por qualquer coluna (clicando no cabeçalho)
- Paginação (50 por página)
- Ficha de detalhe ao clicar numa linha

## Como usar
Não precisa de servidor. Abre `index.html` diretamente no browser, ou serve a pasta:

```bash
python3 -m http.server 8000
```

e abre `http://localhost:8000`.

> Nota: abrir `index.html` via `file://` funciona na maioria dos browsers; se o browser bloquear o `fetch` local, usa o servidor acima.

## Estrutura
- `index.html` — página única
- `style.css` — tema escuro
- `app.js` — lógica (filtros, ordenação, paginação, modal)
- `data/database.json` — dados convertidos do Excel (atualizável)
- `scripts/convert_xlsx.py` — script de conversão Excel → JSON
