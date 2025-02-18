import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';

const MemberRow = ({ member, plans, setSelectedItem, setShowDeleteModal, darkMode }) => {
  return (
    <tr key={member.memberId}>
      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{member.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{member.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
        {plans.find(p => p.planId === member.planId)?.name || 'Unknown Plan'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          member.status === 'Active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {member.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
        {new Date(member.renewalDate).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-3">
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
            <Eye className="h-5 w-5" />
          </button>
          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
            <Edit2 className="h-5 w-5" />
          </button>
          <button 
            onClick={() => {
              setSelectedItem(member);
              setShowDeleteModal(true);
            }}
            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default MemberRow;