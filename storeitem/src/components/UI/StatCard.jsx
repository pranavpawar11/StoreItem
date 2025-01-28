import React from "react";

const StatCard = ({ title, value, trend, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm dark:text-gray-50 dark:bg-gray-800">
    <h3 className="text-sm text-[#6c757d] mb-2 dark:text-gray-50 dark:bg-gray-800">{title}</h3>
    <p className="text-2xl font-bold" style={{ color }}>
      {value}
    </p>
    {trend && (
      <p
        className={`text-sm mt-2 ${
          trend > 0 ? "text-[#2d6a4f]" : "text-[#d00000]"
        }`}
      >
        {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last month
      </p>
    )}
  </div>
);

export default StatCard