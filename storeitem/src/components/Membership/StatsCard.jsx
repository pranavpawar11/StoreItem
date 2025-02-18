import React from 'react';

const StatsCard = ({ title, value, darkMode }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow`}>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};

export default StatsCard;