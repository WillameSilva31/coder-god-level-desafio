import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{label}h</p>
        <p className="text-sm text-gray-600">
          Vendas: {payload[0].value.toLocaleString('pt-BR')}
        </p>
        <p className="text-sm text-gray-600">
          Faturamento: {formatCurrency(payload[0].payload.revenue)}
        </p>
        <p className="text-sm text-blue-600 font-semibold">
          {payload[0].payload.percentage}% do total
        </p>
      </div>
    );
  }
  return null;
};

export default function SalesByHour({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Vendas por Hora</h3>
        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
      </div>
    );
  }

  // Find peak hour
  const peakHour = data.reduce((max, item) => 
    item.sales_count > max.sales_count ? item : max
  , data[0]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Distribuição de Vendas por Hora
        </h3>
        <div className="text-right">
          <p className="text-xs text-gray-600">Horário de Pico</p>
          <p className="text-lg font-bold text-blue-600">{peakHour.hour}h</p>
          <p className="text-xs text-gray-600">
            {peakHour.sales_count.toLocaleString('pt-BR')} vendas
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="hour" 
            tick={{ fontSize: 12 }}
            label={{ value: 'Hora do Dia', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toLocaleString('pt-BR')}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="sales_count" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorSales)" 
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Period Highlights */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 mb-1">🌅 Manhã (6h-11h)</p>
          <p className="text-lg font-bold text-blue-600">
            {data.filter(d => d.hour >= 6 && d.hour < 11)
              .reduce((sum, d) => sum + d.sales_count, 0)
              .toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-xs text-gray-600 mb-1">🍽️ Almoço (11h-15h)</p>
          <p className="text-lg font-bold text-orange-600">
            {data.filter(d => d.hour >= 11 && d.hour < 15)
              .reduce((sum, d) => sum + d.sales_count, 0)
              .toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-xs text-gray-600 mb-1">🌙 Jantar (18h-23h)</p>
          <p className="text-lg font-bold text-purple-600">
            {data.filter(d => d.hour >= 18 && d.hour < 23)
              .reduce((sum, d) => sum + d.sales_count, 0)
              .toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}