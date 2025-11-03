# 🍔 Restaurant Analytics Platform

> Plataforma de analytics customizável para restaurantes explorarem dados operacionais sem conhecimento técnico.

**God Level Coder Challenge 2025 - Nola**

---

## 📊 Visão Geral

Sistema completo de Business Intelligence para restaurantes, permitindo que donos como "Maria" analisem 500.000+ vendas de múltiplos canais (iFood, Rappi, presencial, etc.) através de dashboards interativos e filtros intuitivos.

### ✨ Principais Features

- 📈 **Dashboard Interativo** com métricas em tempo real
- 🔍 **Filtros Avançados** por data, loja e canal
- 📊 **4 Tipos de Visualizações**: Linha, Pizza, Barra, Área
- ⚡ **Performance Otimizada** (<1s para 500k registros)
- 🎨 **UI/UX Moderna** com Tailwind CSS v4
- 🐳 **Docker Ready** - `docker compose up` e funciona

---

## 🎯 O Problema Resolvido

**Persona: Maria** - Dona de 3 restaurantes
- Vende em 5+ canais (presencial, iFood, Rappi, WhatsApp, app próprio)
- 200+ produtos no cardápio
- ~1.500 pedidos/semana

**Nossa Solução**: Dashboard customizável onde Maria explora dados sem SQL, cria análises personalizadas e toma decisões baseadas em dados reais.

---

## 🏗️ Arquitetura
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Next.js   │ ───► │   FastAPI    │ ───► │ PostgreSQL  │
│  Frontend   │      │   Backend    │      │   500k+     │
│  (Port 3000)│      │  (Port 8000) │      │   vendas    │
└─────────────┘      └──────────────┘      └─────────────┘
```

### Stack Tecnológica

**Frontend:**
- Next.js 16 + React 18
- Tailwind CSS v4
- Recharts (visualizações)
- Axios (HTTP client)
- Lucide React (ícones)

**Backend:**
- FastAPI (Python)
- PostgreSQL 15
- psycopg2 (database driver)

**DevOps:**
- Docker + Docker Compose
- Python 3.11 / Node.js 20

---

## 🚀 Quick Start

### Pré-requisitos

- Docker Desktop instalado
- 8GB RAM disponível
- 5GB espaço em disco

### Instalação (5 minutos)
```bash
# 1. Clone o repositório
git clone https://github.com/WillameSilva31/coder-god-level-desafio.git
cd coder-god-level-desafio

# 2. Inicie o PostgreSQL
docker compose up -d postgres

# 3. Gere os dados (aguarde 5-15 min para 500k vendas)
docker compose run --rm data-generator

# 4. Inicie backend e frontend
docker compose up -d backend frontend

# 5. Acesse a aplicação
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

### Verificação
```bash
# Ver logs
docker compose logs -f backend frontend

# Verificar dados
docker exec -it godlevel-db psql -U challenge -d challenge_db -c "SELECT COUNT(*) FROM sales;"
# Deve retornar: ~500,000
```

---

## 📊 Funcionalidades Principais

### 1. Dashboard Overview
- **KPI Cards**: Total vendas, faturamento, ticket médio, clientes únicos
- **Métricas Operacionais**: Taxa customização, tempo preparo, tempo entrega
- **Atualização em Tempo Real** com filtros aplicados

### 2. Vendas ao Longo do Tempo
- Gráfico de linha com vendas e faturamento
- Agrupamento por dia/semana/mês
- Comparação temporal

### 3. Distribuição por Canal
- Gráfico de pizza com % por canal (iFood, Rappi, Presencial)
- Detalhamento de faturamento e ticket médio
- Identificação do canal mais lucrativo

### 4. Top 10 Produtos
- Ranking de produtos mais vendidos
- Visualização horizontal com barras coloridas
- Destaque para top 3 (🥇🥈🥉)

### 5. Vendas por Hora
- Gráfico de área mostrando distribuição horária
- Identificação de horário de pico
- Segmentação por período (manhã, almoço, jantar)

### 6. Filtros Globais
- **Data Range**: Últimos 7/30/90 dias ou customizado
- **Loja**: Filtrar por estabelecimento específico
- **Canal**: Filtrar por canal de venda
- **Loading State**: Feedback visual ao aplicar filtros

---

## ⚡ Performance

### Otimizações Implementadas

1. **Índices Estratégicos no PostgreSQL**
   - Índices compostos em `(sale_status_desc, created_at, store_id)`
   - Índices em chaves estrangeiras
   - **Resultado**: Queries de 3-5s → 300-800ms

2. **Query Optimization**
   - Agregações no banco (não no backend)
   - Uso de views materializadas para dados estáticos
   - Prefixos de tabela para evitar ambiguidade

3. **Frontend Performance**
   - Loading states com feedback visual
   - Debounce em filtros
   - Parallel API calls com `Promise.all()`

### Benchmarks
```
Overview API:        ~400ms  (500k registros)
Sales by Date:       ~600ms  (agrupamento diário)
Top Products:        ~350ms  (JOIN em 3 tabelas)
Sales by Channel:    ~450ms  (agregação por canal)
```

---

## 📁 Estrutura do Projeto
```
nola-god-level/
├── backend/                 # FastAPI Backend
│   ├── routes/             # Endpoints da API
│   │   ├── overview.py     # Métricas gerais
│   │   ├── sales.py        # Análises de vendas
│   │   └── products.py     # Análise de produtos
│   ├── main.py             # App principal
│   ├── database.py         # Conexão PostgreSQL
│   ├── queries.py          # SQL queries otimizadas
│   └── requirements.txt    # Dependências Python
│
├── frontend/               # Next.js Frontend
│   ├── app/               # App Router (Next.js 16)
│   │   ├── page.js        # Página principal
│   │   └── layout.js      # Layout global
│   ├── components/        # Componentes React
│   │   ├── Dashboard.jsx  # Dashboard principal
│   │   ├── Filters.jsx    # Componente de filtros
│   │   └── charts/        # Gráficos
│   ├── lib/
│   │   └── api.js         # Cliente HTTP
│   └── package.json
│
├── docker-compose.yml     # Orquestração dos serviços
├── database-schema.sql    # Schema do banco
├── generate_data.py       # Gerador de dados realistas
└── README.md
```

---

## 🎨 Decisões Arquiteturais

### 1. Por que FastAPI?
- **Performance**: Async nativo, 2-3x mais rápido que Flask
- **Documentação automática**: Swagger UI out-of-the-box
- **Type hints**: Validação automática de dados
- **Developer Experience**: Fácil de testar e debugar

### 2. Por que Next.js 16?
- **SSR/SSG**: Melhor SEO e performance inicial
- **App Router**: Estrutura moderna e intuitiva
- **Turbopack**: Build 10x mais rápido que Webpack
- **React Server Components**: Menor bundle JS

### 3. Por que PostgreSQL?
- **Dados fornecidos**: Base já em PostgreSQL
- **ACID**: Garantia de consistência dos dados
- **Aggregations**: Funções analíticas poderosas (PERCENTILE, WINDOW)
- **Escalabilidade**: Suporta milhões de registros

### 4. Trade-offs Conscientes
**Priorizado:**
- ✅ Performance em queries complexas
- ✅ UX intuitiva para não-técnicos
- ✅ Código limpo e bem documentado
- ✅ Docker setup funcional

---

## 🧪 Testes

### Backend
```bash
cd backend

# Testar conexão com banco
python database.py

# Testar API manualmente
python main.py
# Acesse: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend

# Rodar desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

---

## 📈 Insights dos Dados

### Padrões Identificados (500k vendas)

- **Horário de Pico**: 19h (11.62% das vendas)
- **Melhor Dia**: Sábado (+50% vs média)
- **Canal Dominante**: iFood (38% do faturamento)
- **Ticket Médio**: R$ 64.39
  - Delivery: R$ 82 (+50% vs presencial)
  - Presencial: R$ 54
- **Taxa de Customização**: 59.94% (clientes adoram personalizar!)
- **Tempo Médio Entrega**: 34.96 min
- **Complemento Mais Vendido**: Bacon (41k vezes)

### Anomalias Detectadas

- Semana problemática em Agosto (queda de 54%)
- Dia promocional em Outubro (pico de +192%)
- Crescimento gradual de 2-3% ao mês

---

## 🚧 Próximos Passos

### Features Futuras (Roadmap)

1. **Analytics Avançado**
   - [ ] Análise de cohort (retenção de clientes)
   - [ ] Previsão de demanda com ML
   - [ ] Detecção automática de anomalias
   - [ ] RFM Analysis (Recency, Frequency, Monetary)

2. **UX Melhorias**
   - [ ] Exportar dashboards para PDF
   - [ ] Salvar filtros favoritos
   - [ ] Compartilhar análises via link
   - [ ] Dark mode

3. **Performance**
   - [ ] Cache Redis para queries pesadas
   - [ ] Views materializadas atualizadas em tempo real
   - [ ] Pagination para grandes datasets

4. **Operacional**
   - [ ] Autenticação JWT
   - [ ] Multi-tenancy (múltiplos restaurantes)
   - [ ] Rate limiting
   - [ ] Logs estruturados

---

## 🐛 Troubleshooting

### Problema: "Database connection failed"
```bash
# Verificar se PostgreSQL está rodando
docker compose ps

# Reiniciar banco
docker compose restart postgres

# Ver logs
docker logs godlevel-db
```

### Problema: "Port already in use"
```bash
# Backend (8000)
docker compose stop backend
# ou mude a porta em docker-compose.yml

# Frontend (3000)
docker compose stop frontend
```

### Problema: "Queries muito lentas"
```bash
# Criar índices (executar uma vez)
docker exec -it godlevel-db psql -U challenge -d challenge_db

# Cole e execute os índices do arquivo create_indexes.sql
```

---

## 📝 Licença

Este projeto foi desenvolvido como parte do **God Level Coder Challenge 2025** da Nola/Arcca.

---

## 👨‍💻 Willame Silva

**Seu Nome**
- GitHub: [WillameSilva31](https://github.com/WillameSilva31)
- LinkedIn: [Willame Silva](https://www.linkedin.com/in/willamesilvadev/)
- Email: Willamesilvaop@hotmail.com

---

## 🙏 Agradecimentos

- **Nola/Arcca** pelo desafio técnico inspirador
- **Maria** (persona) por representar milhares de donos de restaurantes com essa dor real
- Comunidade Open Source pelas ferramentas incríveis

---

**⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!**
