import React from "react";
import { 
    TrendingUp, 
    TrendingDown,  
    IndianRupee,
  } from 'lucide-react';

const KPICard = ({ title, value, trend, icon: Icon, trendValue, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              {title.includes('Revenue') && <IndianRupee className="w-6 h-6 mr-1" />}
              {value}
            </h3>
          </div>
          <div className={`p-3 rounded-xl bg-opacity-20`} style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color: color }} />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className={`flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
          <span className="text-gray-500 text-sm ml-2">vs last month</span>
        </div>
      </div>
    </div>
  );

  export default KPICard;