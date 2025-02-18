import React from 'react';

const PlanCard = ({ plan, darkMode }) => {
  return (
    <div className={`border dark:border-gray-700 rounded-lg p-6 dark:bg-gray-700`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{plan.name}</h3>
      <p className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">₹ {plan.price}/mo</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.subscribers} subscribers</p>
      <ul className="mt-4 space-y-2">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="mr-2">•</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanCard;