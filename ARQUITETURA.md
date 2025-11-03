# 🏗️ Arquitetura Técnica Detalhada

## Visão Geral do Sistema
```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│  Next.js 16 + React 18 + Tailwind v4 + Recharts        │
│  Port: 3000                                              │
└────────────────┬─────────────────────────────────────────┘
                 │ HTTP/REST
                 │ (Axios)
┌────────────────▼─────────────────────────────────────────┐
│                      BACKEND                             │
│  FastAPI + Python 3.11                                   │
│  Port: 8000                                              │
│                                                          │
│  Routes:                                                 │
│  ├── /api/overview          (métricas gerais)          │
│  ├── /api/sales/*           (análise temporal)         │
│  ├── /api/products/*        (produtos e items)         │
│  ├── /api/stores/*          (performance lojas)        │
│  └── /api/filters/*         (dropdowns)                │
└────────────────┬─────────────────────────────────────────┘
                 │ psycopg2
                 │ (SQL)
┌────────────────▼─────────────────────────────────────────┐
│                     DATABASE                             │
│  PostgreSQL 15                                           │
│  Port: 5432                                              │
│                                                          │
│  Tables:                                                 │
│  ├── sales (500k+ registros)                           │
│  ├── product_sales (1.2M)                              │
│  ├── item_product_sales (800k)                         │
│  ├── customers (10k)                                    │
│  ├── stores (50)                                        │
│  └── channels (6)                                       │
└──────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

### 1. Requisição do Usuário
```javascript
// Frontend: components/Dashboard.jsx
const loadDashboardData = async () => {
  // Parallel API calls
  const [overview, sales, channels, products] = await Promise.all([
    getOverview(filters),      // ~400ms
    getSalesByDate(filters),   // ~600ms
    getSalesByChannel(filters),// ~450ms
    getTopProducts(filters)    // ~350ms
  ]);
  // Total: ~600ms (tempo da mais lenta)
};
```

### 2. Backend API
```python
# Backend: routes/overview.py
@router.get("/api/overview")
async def get_overview(filters):
    query, params = get_overview_query(filters)  # Build SQL
    cur.execute(query, params)                    # Execute
    return serialize_row(cur.fetchone())          # JSON response
```

### 3. SQL Query
```sql
-- Backend: queries.py
SELECT 
    COUNT(*) as total_sales,
    SUM(s.total_amount) as total_revenue,
    AVG(s.total_amount) as avg_ticket
FROM sales s
WHERE s.sale_status_desc = 'COMPLETED'
  AND s.created_at >= '2024-10-01'
  AND s.created_at <= '2024-10-31'
  AND s.store_id = 1;
-- Execution time: ~400ms (com índices)
```

## Schema do Banco de Dados

### Modelo Relacional
```
sales (1) ─────── (N) product_sales (1) ─────── (N) item_product_sales
  │                                                        │
  │                                                        │
  ├── (N) payments                                         │
  ├── (1) delivery_sales (1) ─── (1) delivery_addresses   │
  ├── (N) stores                                           │
  ├── (N) channels                                         │
  └── (N) customers                                        │
                                                           │
products (1) ──────────────────────────────────────────────┘
items (1) ─────────────────────────────────────────────────┘
```

### Índices Críticos
```sql
-- Queries de filtro (WHERE clauses)
idx_sales_status_date (sale_status_desc, created_at)

-- Queries com múltiplos filtros
idx_sales_status_store_date (sale_status_desc, store_id, created_at)
idx_sales_status_channel_date (sale_status_desc, channel_id, created_at)

-- JOINs frequentes
idx_product_sales_sale (sale_id)
idx_product_sales_product (product_id)
idx_item_product_sales_product_sale (product_sale_id)
```

## APIs Principais

### GET /api/overview

**Propósito**: KPIs principais do dashboard

**Parâmetros**:
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `store_id` (optional): integer
- `channel_id` (optional): integer

**Response**:
```json
{
  "total_sales": 500489,
  "total_revenue": 32234567.89,
  "avg_ticket": 64.39,
  "unique_customers": 7019,
  "customization_rate": 59.94,
  "avg_production_time_min": 18.15,
  "avg_delivery_time_min": 34.96
}
```

**Performance**: ~400ms

### GET /api/sales/by-date

**Propósito**: Vendas agregadas por período

**Parâmetros**:
- `group_by`: "day" | "week" | "month"
- + filtros comuns

**Response**:
```json
{
  "data": [
    {
      "date": "2024-10-01",
      "sales_count": 3500,
      "revenue": 225000.50,
      "avg_ticket": 64.28
    }
  ],
  "group_by": "day",
  "total_records": 31
}
```

**Performance**: ~600ms

## Otimizações Implementadas

### 1. Database Layer

**Agregações no Banco**
```python
# ✅ BOM: Agregação no PostgreSQL
SELECT COUNT(*), SUM(total_amount)
FROM sales
WHERE sale_status_desc = 'COMPLETED';

# ❌ RUIM: Buscar tudo e agregar no Python
rows = fetch_all("SELECT * FROM sales")
count = len(rows)
total = sum(row['total_amount'] for row in rows)
```

**Índices Compostos**
```sql
-- Query comum: filtrar por status + data
WHERE sale_status_desc = 'COMPLETED' 
  AND created_at >= '2024-10-01';

-- Índice otimizado:
CREATE INDEX idx_sales_status_date 
ON sales(sale_status_desc, created_at);
-- Resultado: 3s → 400ms
```

### 2. Backend Layer

**Parallel Queries**
```python
# ✅ BOM: Execução paralela
overview, sales = await asyncio.gather(
    get_overview(filters),
    get_sales_by_date(filters)
)
# Tempo: max(400ms, 600ms) = 600ms

# ❌ RUIM: Execução sequencial
overview = await get_overview(filters)  # 400ms
sales = await get_sales_by_date(filters)  # 600ms
# Tempo: 400ms + 600ms = 1000ms
```

### 3. Frontend Layer

**Loading States**
```javascript
// Feedback visual durante carregamento
{filterApplying && (
  <div className="loading-indicator">
    <Loader2 className="animate-spin" />
    Aplicando filtros...
  </div>
)}
```

**Debounce em Filtros**
```javascript
// Evitar múltiplas requisições ao digitar
const debouncedFilter = useMemo(
  () => debounce(handleFilterChange, 300),
  []
);
```

## Segurança

### SQL Injection Protection
```python
# ✅ BOM: Prepared statements
query = "SELECT * FROM sales WHERE store_id = %s"
cur.execute(query, (store_id,))

# ❌ RUIM: String concatenation
query = f"SELECT * FROM sales WHERE store_id = {store_id}"
cur.execute(query)
```

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Específico em produção
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## Escalabilidade

### Limitações Atuais

- **Concorrência**: 50-100 usuários simultâneos (FastAPI default)
- **Dados**: 500k vendas (~500MB) - OK para single-tenant
- **Queries**: <1s para 90% dos casos

### Próximos Passos para Escala

1. **Horizontal Scaling**: Load balancer + múltiplas instâncias FastAPI
2. **Cache Layer**: Redis para queries frequentes (TTL 5min)
3. **Database**: Read replicas para queries analíticas
4. **CDN**: Servir assets estáticos do frontend

---

**Documentação técnica completa para desenvolvedores**
