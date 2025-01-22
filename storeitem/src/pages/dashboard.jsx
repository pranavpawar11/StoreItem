import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  IndianRupee,
  ShoppingCart,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/UI/KPICard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  // Color palette
  const colors = {
    primary: '#0077b6',
    secondary: '#00b4d8',
    accent: '#caf0f8',
    danger: '#ef233c',
    warning: '#ff9e00',
    success: '#38b000'
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard/');
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.primary }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={dashboardData?.kpis?.totalRevenue?.toLocaleString('en-IN') || '0'}
          trend="up"
          trendValue="12.5%"
          icon={IndianRupee}
          color={colors.primary}
        />
        <KPICard
          title="Total Sales"
          value={dashboardData?.kpis?.totalSales?.toLocaleString('en-IN') || '0'}
          trend="up"
          trendValue="8.2%"
          icon={ShoppingCart}
          color={colors.success}
        />
        <KPICard
          title="Avg Order Value"
          value={dashboardData?.kpis?.avgOrderValue?.toLocaleString('en-IN', {
            maximumFractionDigits: 0
          }) || '0'}
          trend="up"
          trendValue="5.1%"
          icon={BarChart3}
          color={colors.secondary}
        />
        <KPICard
          title="Stock Alerts"
          value={dashboardData?.stockAlerts?.length || '0'}
          trend="up"
          trendValue="2 items"
          icon={AlertTriangle}
          color={colors.danger}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
            <select 
              className="text-sm border rounded-lg px-3 py-2 bg-gray-50 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData?.salesTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => ['₹' + value.toLocaleString('en-IN'), 'Sales']}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke={colors.primary}
                  strokeWidth={2}
                  dot={{ fill: colors.primary }}
                  activeDot={{ r: 6, fill: colors.primary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
          <div className="space-y-4">
            {(dashboardData?.topProducts || []).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-2 h-12 rounded-full"
                    style={{ backgroundColor: colors.primary, opacity: 1 - (index * 0.15) }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{product.productInfo.name}</p>
                    <p className="text-sm text-gray-500">{product.totalSales} sales</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  {product.totalRevenue.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Alerts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
            <button 
              onClick={() => navigate('/expiry-alerts')}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              View All Alerts
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(dashboardData?.stockAlerts || []).map((alert, index) => (
              <div key={index} 
                className="flex items-center p-4 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 transition-colors duration-200">
                <AlertTriangle className="w-8 h-8 text-red-500 mr-4" />
                <div>
                  <h4 className="font-medium text-gray-900">{alert.productInfo.name}</h4>
                  <p className="text-sm text-gray-600">
                    {alert.stock < 10 ? 'Low Stock' : 'Expiring Soon'} - {alert.stock} items left
                  </p>
                  <span className={`
                    inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full
                    ${alert.stock < 5 ? 'bg-red-100 text-red-800' : 
                      alert.stock < 10 ? 'bg-orange-100 text-orange-800' : 
                      'bg-yellow-100 text-yellow-800'}
                  `}>
                    {alert.stock < 5 ? 'Critical' : alert.stock < 10 ? 'Warning' : 'Expiring'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;