import React from 'react';
import { Package, TrendingUp } from 'lucide-react';

const KpiCard = ({ title, value, subtitle, color = '#007bff' }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Package className="w-6 h-6 text-primary" aria-hidden />
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-green-600">
          <TrendingUp className="w-4 h-4" aria-hidden />
          +12%
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1" style={{ color }}>{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="mt-3 text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
};

export default KpiCard;
