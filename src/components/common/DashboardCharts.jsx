import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

// Standard loader overlay
function ChartLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/20 dark:bg-black/10 backdrop-blur-xs z-10 rounded-2xl">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-t-2 border-brand-500 rounded-full animate-spin"></div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Loading Analytics...</span>
      </div>
    </div>
  );
}

// 1. AreaChartWidget
export function AreaChartWidget({ data = [], xKey = 'label', yKey = 'value', height = 220, loading = false }) {
  const { isDark } = useTheme();
  
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {loading && <ChartLoader />}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea0ea" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#0ea0ea" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#23324C' : '#e2e8f0'} opacity={0.6} />
          <XAxis 
            dataKey={xKey} 
            stroke={isDark ? '#94a3b8' : '#475569'} 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke={isDark ? '#94a3b8' : '#475569'} 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#161F30' : '#ffffff', 
              borderColor: isDark ? '#23324C' : '#e2e8f0', 
              borderRadius: '12px',
              color: isDark ? '#e2e8f0' : '#0f172a',
              fontSize: '11px',
              fontFamily: 'sans-serif'
            }} 
          />
          <Area type="monotone" dataKey={yKey} stroke="#0ea0ea" strokeWidth={2.5} fillOpacity={1} fill="url(#colorArea)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. BarChartWidget
export function BarChartWidget({ data = [], xKey = 'label', yKey = 'value', height = 220, loading = false, color = '#0ea0ea' }) {
  const { isDark } = useTheme();

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {loading && <ChartLoader />}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#23324C' : '#e2e8f0'} opacity={0.6} />
          <XAxis 
            dataKey={xKey} 
            stroke={isDark ? '#94a3b8' : '#475569'} 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke={isDark ? '#94a3b8' : '#475569'} 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#161F30' : '#ffffff', 
              borderColor: isDark ? '#23324C' : '#e2e8f0', 
              borderRadius: '12px',
              color: isDark ? '#e2e8f0' : '#0f172a',
              fontSize: '11px'
            }} 
          />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. LineChartWidget
export function LineChartWidget({ data = [], xKey = 'label', yKey = 'value', height = 220, loading = false, color = '#0ea0ea' }) {
  const { isDark } = useTheme();

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {loading && <ChartLoader />}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#23324C' : '#e2e8f0'} opacity={0.6} />
          <XAxis 
            dataKey={xKey} 
            stroke={isDark ? '#94a3b8' : '#475569'} 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke={isDark ? '#94a3b8' : '#475569'} 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#161F30' : '#ffffff', 
              borderColor: isDark ? '#23324C' : '#e2e8f0', 
              borderRadius: '12px',
              color: isDark ? '#e2e8f0' : '#0f172a',
              fontSize: '11px'
            }} 
          />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} dot={{ r: 4, fill: '#0ea0ea', strokeWidth: 1 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 4. PieChartWidget
export function PieChartWidget({ data = [], nameKey = 'name', valueKey = 'value', height = 220, loading = false }) {
  const { isDark } = useTheme();
  
  const COLORS = ['#0ea0ea', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

  // Scale center and radii dynamically based on height to prevent layout clipping & label overlap
  const cy = height < 180 ? '38%' : '45%';
  const outerRadius = height < 180 ? 55 : 75;
  const innerRadius = height < 180 ? 35 : 50;

  return (
    <div className="relative w-full overflow-hidden flex justify-center items-center" style={{ height }}>
      {loading && <ChartLoader />}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#161F30' : '#ffffff', 
              borderColor: isDark ? '#23324C' : '#e2e8f0', 
              borderRadius: '12px',
              color: isDark ? '#e2e8f0' : '#0f172a',
              fontSize: '11px'
            }} 
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} 
          />
          <Pie
            data={data}
            cx="50%"
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey={valueKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 5. KPITrendChart
export function KPITrendChart({ data = [], height = 65, loading = false, positive = true }) {
  const chartColor = positive ? '#10B981' : '#EF4444';
  
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {loading && <div className="absolute inset-0 bg-white/10 animate-pulse rounded-lg" />}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`trendGrad-${chartColor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.25}/>
              <stop offset="95%" stopColor={chartColor} stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={1.5} fillOpacity={1} fill={`url(#trendGrad-${chartColor})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
