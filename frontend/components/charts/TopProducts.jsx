import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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
        <p className="font-semibold text-gray-900 mb-2">{data.product_name}</p>
        <p className="text-sm text-gray-600">Categoria: {data.category_name}</p>
        <p className="text-sm text-gray-600 mt-1">
          Vendido: <span className="font-semibold">{data.times_sold}</span> vezes
        </p>
        <p className="text-sm text-gray-600">
          Quantidade: {data.total_quantity?.toLocaleString('pt-BR')}
        </p>
        <p className="text-sm text-green-600 font-semibold mt-1">
          Receita: {formatCurrency(data.total_revenue)}
        </p>
      </div>
    );
  }
  return null;
};

export default function TopProducts({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Top 10 Produtos</h3>
        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
      </div>
    );
  }

  // Truncate long product names
  const chartData = data.map(item => ({
    ...item,
    short_name: item.product_name.length > 30 
      ? item.product_name.substring(0, 27) + '...' 
      : item.product_name
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-600" />
        Top 10 Produtos Mais Vendidos
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 150 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis 
            dataKey="short_name" 
            type="category" 
            width={140}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="times_sold" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Top 3 Highlight */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {data.slice(0, 3).map((product, index) => (
          <div 
            key={product.product_name}
            className={`p-4 rounded-lg border-2 ${
              index === 0 ? 'border-yellow-400 bg-yellow-50' :
              index === 1 ? 'border-gray-300 bg-gray-50' :
              'border-orange-300 bg-orange-50'
            }`}
          >
            <div className="text-2xl font-bold mb-1">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate" title={product.product_name}>
              {product.product_name}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {product.times_sold} vendas
            </p>
            <p className="text-xs text-green-600 font-semibold">
              {formatCurrency(product.total_revenue)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}