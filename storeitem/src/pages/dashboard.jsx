import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  DollarSign,
  ShoppingCart,
  BarChart3,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for charts
const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 }
];

const Dashboard = () => {
  const KPICard = ({ title, value, trend, icon: Icon, trendValue, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-full bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <div className={`flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          <span className="text-sm font-medium">{trendValue}</span>
        </div>
        <span className="text-gray-400 text-sm ml-2">vs last month</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value="$54,238"
          trend="up"
          trendValue="12.5%"
          icon={DollarSign}
          color="blue"
        />
        <KPICard
          title="Total Sales"
          value="1,485"
          trend="up"
          trendValue="8.2%"
          icon={ShoppingCart}
          color="teal"
        />
        <KPICard
          title="Stock Items"
          value="485"
          trend="down"
          trendValue="3.1%"
          icon={Package}
          color="yellow"
        />
        <KPICard
          title="Low Stock Alerts"
          value="12"
          trend="up"
          trendValue="2 items"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
            <select className="text-sm border rounded-md px-2 py-1">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#0077b6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {[
              { name: 'Product A', sales: 245, revenue: '$2,400' },
              { name: 'Product B', sales: 190, revenue: '$1,900' },
              { name: 'Product C', sales: 145, revenue: '$1,400' },
              { name: 'Product D', sales: 120, revenue: '$1,200' },
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-12 bg-[#0077b6] rounded-full opacity-75" 
                       style={{ opacity: 1 - (index * 0.2) }} />
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Alerts Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { product: 'Product X', status: 'Urgent', stock: 5, type: 'Low Stock' },
            { product: 'Product Y', status: 'Warning', stock: 15, type: 'Expiring Soon' },
            { product: 'Product Z', status: 'Critical', stock: 2, type: 'Low Stock' },
          ].map((alert, index) => (
            <div key={index} className="flex items-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-500 mr-4" />
              <div>
                <h4 className="font-medium text-gray-900">{alert.product}</h4>
                <p className="text-sm text-gray-500">{alert.type} - {alert.stock} items left</p>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                  {alert.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;