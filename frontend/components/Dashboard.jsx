'use client';

import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Users, Loader, Sparkles, RefreshCw } from 'lucide-react';
import KPICard from './KPICard';
import Filters from './Filters';
import SalesOverTime from './charts/SalesOverTime';
import SalesByChannel from './charts/SalesByChannel';
import TopProducts from './charts/TopProducts';
import SalesByHour from './charts/SalesByHour';
import {
  getOverview,
  getSalesByDate,
  getSalesByChannel,
  getTopProducts,
  getSalesByHour
} from '@/lib/api';

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

export default function Dashboard() {
  const [filters, setFilters] = useState({
    start_date: null,
    end_date: null,
    store_id: null,
    channel_id: null,
    time_period: null,
    hour_start: null,
    hour_end: null
  });

  const [loading, setLoading] = useState(true);
  const [filterApplying, setFilterApplying] = useState(false);
  const [overview, setOverview] = useState(null);
  const [salesByDate, setSalesByDate] = useState([]);
  const [salesByChannel, setSalesByChannel] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByHour, setSalesByHour] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    if (!overview) {
      setLoading(true);
    } else {
      setFilterApplying(true);
    }
    
    setError(null);

    try {
      const startTime = Date.now();

      const [
        overviewData,
        salesDateData,
        channelData,
        productsData,
        hourData
      ] = await Promise.all([
        getOverview(filters),
        getSalesByDate(filters, 'day'),
        getSalesByChannel(filters),
        getTopProducts(filters, 10),
        getSalesByHour(filters)
      ]);

      const loadTime = Date.now() - startTime;
      console.log(`✅ Dados carregados em ${loadTime}ms`);
      
      // DEBUG: Ver dados recebidos
      console.log('📊 Overview Data:', overviewData);
      console.log('💰 Total Revenue:', overviewData?.total_revenue);
      console.log('💰 Formatted:', formatCurrency(overviewData?.total_revenue));

      setOverview(overviewData);
      setSalesByDate(salesDateData.data || []);
      setSalesByChannel(channelData.data || []);
      setTopProducts(productsData.data || []);
      setSalesByHour(hourData.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
      setFilterApplying(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // Loading inicial com animação moderna
  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-6 shadow-2xl">
                <Sparkles className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Carregando Dashboard
          </h2>
          <p className="text-slate-600 text-lg">Preparando seus insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header com gradiente e glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Restaurant Analytics
                </h1>
                <p className="text-slate-600 mt-1 font-medium">
                  Análise inteligente de vendas e performance
                </p>
              </div>
            </div>
            
            {/* Status e Refresh */}
            <div className="flex items-center gap-3">
              {filterApplying && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 rounded-xl shadow-lg">
                  <Loader className="w-5 h-5 text-white animate-spin" />
                  <span className="text-sm font-semibold text-white">
                    Atualizando...
                  </span>
                </div>
              )}
              
              {!filterApplying && (
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl shadow-md border border-slate-200 transition-all hover:shadow-lg hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Atualizar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Message com estilo moderno */}
        {error && (
          <div className="bg-red-50 backdrop-blur-sm border-2 border-red-200 rounded-2xl p-5 mb-6 shadow-lg animate-shake">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-2 rounded-full">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-700 font-semibold text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Filters com glassmorphism */}
        <div className="mb-8">
          <Filters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Overlay quando aplicando filtros */}
        <div className={`transition-all duration-300 ${filterApplying ? 'opacity-50 pointer-events-none scale-[0.99]' : 'opacity-100 scale-100'}`}>
          
          {/* KPI Cards com animação stagger */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <KPICard
                title="Total de Vendas"
                value={overview?.total_sales?.toLocaleString('pt-BR') || '0'}
                icon={ShoppingCart}
                color="blue"
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <KPICard
                title="Faturamento Total"
                value={formatCurrency(overview?.total_revenue)}
                icon={DollarSign}
                color="green"
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <KPICard
                title="Ticket Médio"
                value={formatCurrency(overview?.avg_ticket)}
                icon={TrendingUp}
                color="purple"
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <KPICard
                title="Clientes Únicos"
                value={overview?.unique_customers?.toLocaleString('pt-BR') || '0'}
                icon={Users}
                color="orange"
              />
            </div>
          </div>

          {/* Additional KPIs com cards modernos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-white/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Taxa de Customização
                </p>
                <div className="bg-blue-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {overview?.customization_rate?.toFixed(2)}%
              </p>
              <p className="text-sm text-slate-500 font-medium">
                {overview?.total_items_added?.toLocaleString('pt-BR')} itens adicionados
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-white/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Tempo de Preparo
                </p>
                <div className="bg-orange-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                {overview?.avg_production_time_min?.toFixed(1)} min
              </p>
              <p className="text-sm text-slate-500 font-medium">
                Média de produção
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-white/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Tempo de Entrega
                </p>
                <div className="bg-green-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {overview?.avg_delivery_time_min?.toFixed(1)} min
              </p>
              <p className="text-sm text-slate-500 font-medium">
                Média de entrega
              </p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <SalesOverTime data={salesByDate} loading={false} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <SalesByChannel data={salesByChannel} loading={false} />
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <TopProducts data={topProducts} loading={false} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
              <SalesByHour data={salesByHour} loading={false} />
            </div>
          </div>
        </div>

        {/* Footer moderno */}
        <footer className="mt-16 pt-8 border-t border-slate-200/50">
          <div className="text-center">
            <p className="text-slate-500 font-medium mb-2">
              Restaurant Analytics Dashboard
            </p>
            <p className="text-sm text-slate-400">
              God Level Coder Challenge 2025 • Powered by Data Intelligence
            </p>
          </div>
        </footer>
      </main>

      {/* CSS customizado para animações */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}