export default function KPICard({ title, value, icon: Icon, color = 'blue' }) {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'from-blue-600 to-indigo-600',
      ring: 'ring-blue-500/20',
      glow: 'shadow-blue-500/20'
    },
    green: {
      gradient: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'from-green-600 to-emerald-600',
      ring: 'ring-green-500/20',
      glow: 'shadow-green-500/20'
    },
    purple: {
      gradient: 'from-purple-500 to-pink-600',
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'from-purple-600 to-pink-600',
      ring: 'ring-purple-500/20',
      glow: 'shadow-purple-500/20'
    },
    orange: {
      gradient: 'from-orange-500 to-red-600',
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      text: 'from-orange-600 to-red-600',
      ring: 'ring-orange-500/20',
      glow: 'shadow-orange-500/20'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-white/50 transition-all duration-300 hover:scale-105 hover:${colors.glow} overflow-hidden`}>
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      {/* Animated background circles */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${colors.gradient} rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500`}></div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {title}
          </p>
          <div className={`${colors.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>

        {/* Value */}
        <div className="space-y-2">
          <p className={`text-4xl font-bold bg-gradient-to-r ${colors.text} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 origin-left`}>
            {value}
          </p>
          
          {/* Decorative line */}
          <div className={`h-1 bg-gradient-to-r ${colors.gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
        </div>

        {/* Hover indicator */}
        <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient} animate-pulse`}></div>
          <span className="text-xs text-slate-500 font-medium">Atualizado agora</span>
        </div>
      </div>
    </div>
  );
}