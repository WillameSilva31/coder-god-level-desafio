import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Radio } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0
  }).format(value);
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{data.channel_name}</p>
        <p className="text-sm text-gray-600">
          Vendas: {data.sales_count?.toLocaleString('pt-BR')}
        </p>
        <p className="text-sm text-gray-600">
          Faturamento: {formatCurrency(data.revenue)}
        </p>
        <p className="text-sm text-gray-600">
          Ticket Médio: {formatCurrency(data.avg_ticket)}
        </p>
        <p className="text-sm font-semibold text-blue-600 mt-1">
          {data.revenue_percentage}% do faturamento
        </p>
      </div>
    );
  }
  return null;
};

const renderLabel = (entry) => {
  return `${entry.channel_name}: ${entry.revenue_percentage}%`;
};

export default function SalesByChannel({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Vendas por Canal</h3>
        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Radio className="w-5 h-5 text-blue-600" />
        Vendas por Canal
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="revenue"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend com detalhes */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {data.map((channel, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div>
              <p className="font-medium">{channel.channel_name}</p>
              <p className="text-gray-600 text-xs">
                {formatCurrency(channel.revenue)} ({channel.revenue_percentage}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}