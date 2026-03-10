# ACHAMA — Observatório da Habitação

API + Dashboard para monitorização do mercado habitacional nos 16 municípios do Algarve.

## Estrutura

```
achama-observatorio/
├── backend/
│   ├── main.py           ← FastAPI — fetch INE + endpoints
│   └── requirements.txt
└── frontend/
    └── ObservatorioHabitacao.jsx  ← React — dashboard
```

## Backend

### Instalação

```bash
cd backend
pip install -r requirements.txt
```

### Arrancar (desenvolvimento)

```bash
uvicorn main:app --reload --port 8000
```

### Endpoints

| Método | URL | Descrição |
|--------|-----|-----------|
| GET | `/api/habitacao/algarve` | Todos os 16 municípios |
| GET | `/api/habitacao/municipio/{cod}` | Detalhe (ex: `08005` = Faro) |
| GET | `/api/habitacao/refresh` | Força re-fetch ao INE |
| GET | `/api/habitacao/status` | Estado da cache |
| GET | `/docs` | Swagger UI |

### Resposta exemplo `/api/habitacao/algarve`

```json
{
  "municipios": [
    {
      "cod": "08005",
      "nome": "Faro",
      "lat": 37.019,
      "lon": -7.930,
      "renda_m2": 10.8,
      "variacao_anual_pct": 12.4,
      "preco_venda_m2": 2100,
      "esforco_rendimento_pct": 77.1,
      "periodo": "Q4 2024",
      "fonte": "INE API",
      "is_live": true,
      "serie_historica": [5.82, 6.41, 7.18, 8.45, 9.71, 10.39]
    }
  ],
  "meta": {
    "total": 16,
    "atualizado_em": "2025-03-09T10:30:00",
    "ine_status": "ok",
    "fontes": ["INE API — Rendas trimestrais (0010732)", "..."],
    "proxima_atualizacao": "2025-03-10T10:30:00"
  }
}
```

## Frontend

### Integrar no projeto React (ACHAMA)

```jsx
// Copiar ObservatorioHabitacao.jsx para src/components/
import ObservatorioHabitacao from "./components/ObservatorioHabitacao";

// Usar na página
<ObservatorioHabitacao />
```

### Apontar para backend em produção

No ficheiro `ObservatorioHabitacao.jsx`, alterar:

```js
// Linha 5
const API_BASE = "https://SEU-DOMINIO.railway.app"; // ou Render, VPS, etc.
```

## Deploy (produção)

### Backend — Railway (recomendado, gratuito)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Na pasta backend/
railway init
railway up
```

Ou **Render.com** (também gratuito):
- New Web Service → conectar repo
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### CORS em produção

No `main.py`, alterar a linha do CORS:

```python
allow_origins=["https://achama-algarve.netlify.app"],
```

## Fontes de dados

| Indicador INE | Descrição | Frequência | Cobertura |
|---------------|-----------|------------|-----------|
| `0010732` | Renda mediana/m² novos contratos | Trimestral | Municípios >100k hab |
| `0009827` | Preço mediano/m² transações | Trimestral | Municípios >100k hab |
| `0007509` | Renda média habitação social | Anual | Todos os municípios |

Para municípios sem dados INE diretos, são usadas estimativas baseadas em:
- INE Anuários Regionais 2023
- IHRU — Relatório de Habitação 2024
- Idealista Portugal 2024

## Licença

Dados: INE Portugal (CC BY 4.0) — https://www.ine.pt
Código: MIT
