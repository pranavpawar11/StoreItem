import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  CheckCircle,
} from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [modelTrainingStatus, setModelTrainingStatus] = useState({
    stockModel: null,
    stockModelV2: null
  });

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/getuser', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
          }
        });

        const result = await response.json();
        if (result.success) {
          setUser(result.data);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  // Train Stock Model
  const trainStockModel = async (modelVersion) => {
    try {
      setModelTrainingStatus(prev => ({
        ...prev,
        [modelVersion]: 'training'
      }));

      const response = await fetch(`http://localhost:5000/api/predict/${modelVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
      });

      const result = await response.json();
      
      setModelTrainingStatus(prev => ({
        ...prev,
        [modelVersion]: result.success ? 'completed' : 'error'
      }));
    } catch (error) {
      setModelTrainingStatus(prev => ({
        ...prev,
        [modelVersion]: 'error'
      }));
      console.error(`Error training ${modelVersion}:`, error);
    }
  };

  const renderPermissionBadge = (permission) => {
    const badgeColors = {
        viewProducts: 'bg-[#80ed99] text-[#2d6a4f]',
        addProducts: 'bg-[#00b4d8] text-white',
        viewReports: 'bg-[#ffd166] text-[#343a40]',
        editProducts: 'bg-[#118ab2] text-white',
        deleteProducts: 'bg-[#ef476f] text-white',
        updateModels: 'bg-[#6a4c93] text-white'
      };
      

    return (
      <span 
        key={permission} 
        className={`${badgeColors[permission] || 'bg-[#f8f9fa] text-[#6c757d]'} 
        px-2 py-1 rounded-md text-sm mr-2 mb-2 inline-flex items-center`}
      >
        <CheckCircle className="mr-1" size={16} /> {permission}
      </span>
    );
  };

  const renderModelTrainingSection = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#343a40] mb-6">ML Model Training</h2>
      
      <div className="space-y-4">
        {/* Stock Model Training */}
        <div className="bg-[#f8f9fa] p-4 rounded-md">
          <h3 className="font-semibold text-[#343a40] mb-3">Stock Prediction Model</h3>
          <button 
            onClick={() => trainStockModel('train-stock-model')}
            disabled={modelTrainingStatus.stockModel === 'training'}
            className="w-full py-3 bg-[#0077b6] text-white rounded-md hover:bg-[#00b4d8] 
                       transition-colors disabled:opacity-50"
          >
            {modelTrainingStatus.stockModel === 'training' 
              ? 'Training in Progress...' 
              : 'Train Stock Model'}
          </button>
          {modelTrainingStatus.stockModel === 'completed' && (
            <div className="mt-2 text-[#2d6a4f] bg-[#80ed99] p-2 rounded-md">
              Stock Model Trained Successfully
            </div>
          )}
          {modelTrainingStatus.stockModel === 'error' && (
            <div className="mt-2 text-white bg-[#d00000] p-2 rounded-md">
              Training Failed. Please try again.
            </div>
          )}
        </div>

        {/* Stock Model V2 Training */}
        <div className="bg-[#f8f9fa] p-4 rounded-md">
          <h3 className="font-semibold text-[#343a40] mb-3">Stock Prediction Model V2</h3>
          <button 
            onClick={() => trainStockModel('train-stock-model-v2')}
            disabled={modelTrainingStatus.stockModelV2 === 'training'}
            className="w-full py-3 bg-[#00b4d8] text-white rounded-md hover:bg-[#0077b6] 
                       transition-colors disabled:opacity-50"
          >
            {modelTrainingStatus.stockModelV2 === 'training' 
              ? 'Training in Progress...' 
              : 'Train Stock Model V2'}
          </button>
          {modelTrainingStatus.stockModelV2 === 'completed' && (
            <div className="mt-2 text-[#2d6a4f] bg-[#80ed99] p-2 rounded-md">
              Stock Model V2 Trained Successfully
            </div>
          )}
          {modelTrainingStatus.stockModelV2 === 'error' && (
            <div className="mt-2 text-white bg-[#d00000] p-2 rounded-md">
              Training Failed. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="mx-auto">
        {/* <h1 className="text-3xl font-bold mb-6 text-[#343a40]">Admin Dashboard</h1> */}
        
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setActiveSection('profile')}
            className={`flex items-center py-2 px-4 rounded-md transition-colors ${
              activeSection === 'profile' 
                ? 'bg-[#0077b6] text-white' 
                : 'bg-[#f8f9fa] text-[#6c757d] hover:bg-[#ced4da]'
            }`}
          >
            <User className="mr-2" /> Profile
          </button>
          
          <button 
            onClick={() => setActiveSection('mltraining')}
            className={`flex items-center py-2 px-4 rounded-md transition-colors ${
              activeSection === 'mltraining' 
                ? 'bg-[#0077b6] text-white' 
                : 'bg-[#f8f9fa] text-[#6c757d] hover:bg-[#ced4da]'
            }`}
          >
            <Shield className="mr-2" /> ML Training
          </button>
        </div>

        {activeSection === 'mltraining' ? renderModelTrainingSection() : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-[#0077b6] text-white rounded-full flex items-center justify-center mr-4">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#343a40]">{user.name}</h2>
                <p className="text-[#6c757d]">{user.email}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#f8f9fa] p-4 rounded-md">
                <h3 className="font-semibold text-[#343a40] mb-2">Account Details</h3>
                <p className="text-[#6c757d] mb-2">Role: <span className="font-medium text-[#0077b6]">{user.role}</span></p>
                <p className="text-[#6c757d] mb-2">Created: {new Date(user.createdAt).toLocaleString()}</p>
                <p className="text-[#6c757d]">Last Updated: {new Date(user.updatedAt).toLocaleString()}</p>
              </div>

              <div className="bg-[#f8f9fa] p-4 rounded-md">
                <h3 className="font-semibold text-[#343a40] mb-2">Permissions</h3>
                <div className="flex flex-wrap">
                  {user.permissions.map(renderPermissionBadge)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;