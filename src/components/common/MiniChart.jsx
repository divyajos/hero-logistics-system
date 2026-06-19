import React from 'react';
import { LineChartWidget, BarChartWidget } from './DashboardCharts';

export default function MiniChart({ type = 'line', data = [], labels = [], height = 180 }) {
  // Structure raw arrays into Recharts data formats
  const formattedData = data.map((val, idx) => ({
    label: labels[idx] || `${idx + 1}`,
    value: val
  }));

  if (type === 'bar') {
    return <BarChartWidget data={formattedData} height={height} />;
  }

  return <LineChartWidget data={formattedData} height={height} />;
}
