import { useState, useEffect } from 'react';
import { Calendar, Store, Radio, Filter, X } from 'lucide-react';
import { getStores, getChannels } from '@/lib/api';
import { format, subDays } from 'date-fns';

export default function Filters({ filters, onFilterChange }) {
  const [stores, setStores] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  // Períodos do dia
  const timePeriods = [
    { value: 'morning', label: '🌅 Manhã (6h-12h)', start: 6, end: 11 },
    { value: 'afternoon', label: '☀️ Tarde (12h-18h)', start: 12, end: 17 },
    { value: 'evening', label: '🌆 Noite (18h-23h)', start: 18, end: 22 },
    { value: 'night', label: '🌙 Madrugada (23h-6h)', start: 23, end: 5 }
  ];

  useEffect(() => {
    loadFiltersData();
  }, []);

  const loadFiltersData = async () => {
    try {
      const [storesData, channelsData] = await Promise.all([
        getStores(),
        getChannels()
      ]);
      
      // Remove duplicatas de canais
      const uniqueChannels = Array.from(
        new Map((channelsData.data || []).map(c => [c.name, c])).values()
      );
      
      setStores(storesData.data || []);
      setChannels(uniqueChannels);
    } catch (error) {
      console.error('Error loading filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    const newValue = value === '' ? null : value;
    onFilterChange({ ...filters, [field]: newValue });
  };

  const setQuickDate = (days) => {
    const end = new Date();
    const start = subDays(end, days);
    onFilterChange({
      ...filters,
      start_date: format(start, 'yyyy-MM-dd'),
      end_date: format(end, 'yyyy-MM-dd')
    });
  };

  const clearFilters = () => {
    onFilterChange({
      start_date: null,
      end_date: null,
      store_id: null,
      channel_id: null
    });
  };

  const hasActiveFilters = filters.start_date || filters.end_date || filters.store_id || filters.channel_id;

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Filtros
              </h2>
              {hasActiveFilters && (
                <p className="text-xs text-blue-100 font-medium">
                  {Object.values(filters).filter(Boolean).length} filtro(s) ativo(s)
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-6">
          {/* Filter inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Data Inicial */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 bg-white/50"
              />
            </div>

            {/* Data Final */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Data Final
              </label>
              <input
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 bg-white/50"
              />
            </div>

            {/* Loja */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Store className="w-4 h-4 text-green-500" />
                Loja
              </label>
              <select
                value={filters.store_id || ''}
                onChange={(e) => handleChange('store_id', e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300 bg-white/50 cursor-pointer"
              >
                <option value="">Todas as lojas</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Canal */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-500" />
                Canal
              </label>
              <select
                value={filters.channel_id || ''}
                onChange={(e) => handleChange('channel_id', e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300 bg-white/50 cursor-pointer"
              >
                <option value="">Todos os canais</option>
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Date Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuickDate(7)}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-xl transition-all hover:shadow-md hover:scale-105 border border-blue-200"
            >
              📅 Últimos 7 dias
            </button>
            <button
              onClick={() => setQuickDate(30)}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 rounded-xl transition-all hover:shadow-md hover:scale-105 border border-green-200"
            >
              📅 Últimos 30 dias
            </button>
            <button
              onClick={() => setQuickDate(90)}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 rounded-xl transition-all hover:shadow-md hover:scale-105 border border-purple-200"
            >
              📅 Últimos 90 dias
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 text-red-700 rounded-xl transition-all hover:shadow-md hover:scale-105 border border-red-200 ml-auto"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}