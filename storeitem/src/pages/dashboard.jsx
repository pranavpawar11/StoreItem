import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  IndianRupee,
  ShoppingCart,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import KPICard from "../components/UI/KPICard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");

  // Color palette
  const colors = {
    primary: "#0077b6",
    secondary: "#00b4d8",
    accent: "#caf0f8",
    danger: "#ef233c",
    warning: "#ff9e00",
    success: "#38b000",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard/");
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen dark:bg-gray-900 dark:text-gray-300">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: colors.primary }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 dark:text-gray-300">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={
            dashboardData?.kpis?.totalRevenue?.toLocaleString("en-IN") || "0"
          }
          trend="up"
          trendValue="12.5%"
          icon={IndianRupee}
          color={colors.primary}
          className="dark:bg-gray-800 dark:border-gray-700"
        />
        <KPICard
          title="Total Sales"
          value={
            dashboardData?.kpis?.totalSales?.toLocaleString("en-IN") || "0"
          }
          trend="up"
          trendValue="8.2%"
          icon={ShoppingCart}
          color={colors.success}
          className="dark:bg-gray-800 dark:border-gray-700"
        />
        <KPICard
          title="Avg Order Value"
          value={
            dashboardData?.kpis?.avgOrderValue?.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            }) || "0"
          }
          trend="up"
          trendValue="5.1%"
          icon={BarChart3}
          color={colors.secondary}
          className="dark:bg-gray-800 dark:border-gray-700"
        />
        <KPICard
          title="Stock Alerts"
          value={dashboardData?.stockAlerts?.length || "0"}
          trend="up"
          trendValue="2 items"
          icon={AlertTriangle}
          color={colors.danger}
          className="dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
              Sales Trend
            </h3>
            <select
              className="text-sm border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  formatter={(value) => [
                    "₹" + value.toLocaleString("en-IN"),
                    "Sales",
                  ]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-6">
            Top Products
          </h3>
          <div className="space-y-4">
            {(dashboardData?.topProducts || []).map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-2 h-12 rounded-full"
                    style={{
                      backgroundColor: colors.primary,
                      opacity: 1 - index * 0.15,
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {product.productInfo.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.totalSales} sales
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-200 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  {product.totalRevenue.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Alerts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
              Stock Alerts
            </h3>
            <button
              onClick={() => navigate("/expiry-alerts")}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              View All Alerts
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(dashboardData?.stockAlerts || []).map((alert, index) => (
              <div
                key={index}
                className="flex items-center p-4 rounded-xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
              >
                <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 mr-4" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-200">
                    {alert.productInfo.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {alert.stock < 10 ? "Low Stock" : "Expiring Soon"} -{" "}
                    {alert.stock} items left
                  </p>
                  <span
                    className={`
                    inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full
                    ${
                      alert.stock < 5
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        : alert.stock < 10
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }
                  `}
                  >
                    {alert.stock < 5
                      ? "Critical"
                      : alert.stock < 10
                      ? "Warning"
                      : "Expiring"}
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
