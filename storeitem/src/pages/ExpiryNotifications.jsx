import React, { useState, useEffect } from 'react';
import { Search, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import AlertPopup from '../components/UI/AlertPopup';
const ExpiryNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingExpiry, setCheckingExpiry] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    alertLevel: '',
    notificationStatus: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertStatus, setAlertStatus] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.alertLevel) queryParams.append('alertLevel', filters.alertLevel);
      if (filters.notificationStatus) queryParams.append('notificationStatus', filters.notificationStatus);
      
      const response = await fetch(`http://localhost:5000/api/notifications/fetchnotifications?${queryParams}`);
      const data = await response.json();
      
      // Sort notifications by alert level priority and date
      const sortedNotifications = data.data.sort((a, b) => {
        const priorityMap = { red: 3, yellow: 2, green: 1 };
        const priorityDiff = priorityMap[b.alertLevel] - priorityMap[a.alertLevel];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.alertGeneratedOn) - new Date(a.alertGeneratedOn);
      });
      
      setNotifications(sortedNotifications);
    } catch (error) {
      showAlertMessage('Failed to fetch notifications', 'error');
    }
    setLoading(false);
  };

  const checkExpiryAlerts = async () => {
    setCheckingExpiry(true);
    try {
      const response = await fetch('http://localhost:5000/api/notifications/checkallstocksforexpiry');
      const data = await response.json();

      if (data.newAlertsCount > 0) {
        showAlertMessage(`${data.newAlertsCount} new expiry alerts detected`, 'warning');
      } else {
        showAlertMessage('No new expiry alerts detected', 'success');
      }
      
      // Refresh notifications list
      await fetchNotifications();
      setLastCheck(new Date());
      localStorage.setItem('lastExpiryCheck', new Date().toISOString());
    } catch (error) {
      showAlertMessage('Failed to check for new expiry alerts', 'error');
    }
    setCheckingExpiry(false);
  };

  useEffect(() => {
    fetchNotifications();
    const lastCheckTime = localStorage.getItem('lastExpiryCheck');
    if (lastCheckTime) {
      setLastCheck(new Date(lastCheckTime));
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [filters]);

  const showAlertMessage = (message, status) => {
    setAlertMessage(message);
    setAlertStatus(status);
    setShowAlert(true);
  };

  const handleAcknowledge = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/acknowledgeNotification/${id}`, {
        method: 'PUT'
      });
      if (response.ok) {
        showAlertMessage('Notification acknowledged successfully', 'success');
        fetchNotifications();
      }
    } catch (error) {
      showAlertMessage('Failed to acknowledge notification', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/deleteNotification/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        showAlertMessage('Notification deleted successfully', 'success');
        fetchNotifications();
      }
    } catch (error) {
      showAlertMessage('Failed to delete notification', 'error');
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.productId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAlertColor = (level) => {
    switch (level) {
      case 'green': return 'bg-[#80ed99] text-black';
      case 'yellow': return 'bg-[#ffca3a] text-black';
      case 'red': return 'bg-[#ff595e] text-white';
      default: return 'bg-gray-200 text-black';
    }
  };

  return (
    <div className="space-y-6">
      {showAlert && (
        <AlertPopup
          message={alertMessage}
          status={alertStatus}
          onClose={() => setShowAlert(false)}
        />
      )}
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {/* <h1 className="text-2xl font-bold text-[#343a40]"></h1>
          <div className="flex items-center gap-4">
            {lastCheck && (
              <span className="text-sm text-[#6c757d]">
                Last checked: {lastCheck.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={checkExpiryAlerts}
              disabled={checkingExpiry}
              className="flex items-center gap-2 px-4 py-2 bg-[#0077b6] text-white rounded-lg hover:bg-[#00b4d8] disabled:opacity-50"
            >
              <RefreshCw size={20} className={`${checkingExpiry ? 'animate-spin' : ''}`} />
              Check Now
            </button>
          </div> */}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by product name or ID..."
              className="w-full pl-10 pr-4 py-2 border border-[#ced4da] rounded-lg focus:outline-none focus:border-[#0077b6] dark:text-gray-50 dark:bg-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-[#6c757d]" size={20} />
          </div>
          
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border border-[#ced4da] rounded-lg focus:outline-none focus:border-[#0077b6] dark:text-gray-50 dark:bg-gray-800"
              value={filters.alertLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, alertLevel: e.target.value }))}
            >
              <option value="">All Alert Levels</option>
              <option value="green">Safe</option>
              <option value="yellow">Expiring Soon</option>
              <option value="red">Urgent</option>
            </select>
            
            <select
              className="px-4 py-2 border border-[#ced4da] rounded-lg focus:outline-none focus:border-[#0077b6] dark:text-gray-50 dark:bg-gray-800"
              value={filters.notificationStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, notificationStatus: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            {lastCheck && (
              <span className="text-sm text-[#6c757d] dark:text-gray-50">
                Last checked: {lastCheck.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={checkExpiryAlerts}
              disabled={checkingExpiry}
              className="flex items-center gap-2 px-4 py-2 bg-[#0077b6] text-white rounded-lg hover:bg-[#00b4d8] disabled:opacity-50"
            >
              <RefreshCw size={20} className={`${checkingExpiry ? 'animate-spin' : ''}`} />
              Check Now
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-[#6c757d] dark:text-gray-50">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="col-span-full text-center py-8 text-[#6c757d]">
            No notifications found
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification._id}
              className="bg-white rounded-lg shadow-md p-4 border border-[#ced4da] dark:text-gray-50 dark:bg-gray-800"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`px-3 py-1 rounded-full text-sm ${getAlertColor(notification.alertLevel)}`}>
                  {notification.alertLevel === 'red' ? 'Urgent' : 
                   notification.alertLevel === 'yellow' ? 'Expiring Soon' : 'Safe'}
                </div>
                <div className="flex gap-2">
                  {notification.notificationStatus === 'pending' && (
                    <button
                      onClick={() => handleAcknowledge(notification._id)}
                      className="p-1 hover:bg-[#f8f9fa] rounded"
                      title="Acknowledge"
                    >
                      <CheckCircle size={20} className="text-[#2d6a4f]" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification._id)}
                    className="p-1 hover:bg-[#f8f9fa] rounded"
                    title="Delete"
                  >
                    <Trash2 size={20} className="text-[#d00000]" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <h3 className="font-semibold text-[#343a40] dark:text-gray-50">
                  {notification.product?.name || 'Unknown Product'}
                </h3>
                <p className="text-sm text-[#6c757d] dark:text-gray-300">ID: {notification.productId}</p>
              </div>

              <div className="text-sm">
                <p className="text-[#6c757d] dark:text-gray-50">
                  Expiry Date: {new Date(notification.alertGeneratedOn).toLocaleDateString()}
                </p>
                <p className="text-[#6c757d] dark:text-gray-300">
                  Status: {notification.notificationStatus}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpiryNotifications;