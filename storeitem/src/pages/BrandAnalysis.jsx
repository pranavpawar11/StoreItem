import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import Combobox from "../components/UI/Combobox"
import StatCard from "../components/UI/StatCard"

const BrandAnalysis = () => {
  const [data, setData] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const colors = {
    primary: "#0077b6",
    secondary: "#00b4d8",
    accent: "#ffb703",
    success: "#2d6a4f",
    warning: "#ffcc00",
    danger: "#d00000",
  };

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Fetch data when brand or dates change
  useEffect(() => {
    if (selectedBrand) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [selectedBrand, startDate, endDate]);

  const fetchBrands = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/salesReport/brands"
      );
      const result = await response.json();
      setBrands(result.data);
      setSelectedBrand(result.data[0] || "");
    } catch (err) {
      setError("Failed to fetch brands");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `http://localhost:5000/api/salesReport/subcategory-analysis-report?brand=${selectedBrand}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-[#343a40]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#343a40] mb-6">
          Brand Analysis {selectedBrand ? "for " +selectedBrand : ""}
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-[#ff595e] text-white rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <Combobox
              options={brands}
              value={selectedBrand}
              onChange={setSelectedBrand}
              placeholder="Search and select brand..."
            />
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 rounded-md border border-[#ced4da] focus:outline-none focus:border-[#0077b6]"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 rounded-md border border-[#ced4da] focus:outline-none focus:border-[#0077b6]"
          />
        </div>
      </div>

      {data && selectedBrand && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`$${data.salesBySubcategory[0]?.totalSales.toLocaleString()}`}
              trend={5.2}
              color={colors.primary}
            />
            <StatCard
              title="Units Sold"
              value={data.salesBySubcategory[0]?.totalQuantitySold.toLocaleString()}
              trend={-2.1}
              color={colors.secondary}
            />
            <StatCard
              title="Average Order Value"
              value={`$${(
                data.salesBySubcategory[0]?.totalSales /
                  data.salesBySubcategory[0]?.totalQuantitySold || 0
              ).toFixed(2)}`}
              trend={1.8}
              color={colors.accent}
            />
            <StatCard
              title="Active Products"
              value={data.productsBySubcategory.length}
              color={colors.success}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Performance */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-[#343a40] mb-4">
                Product Performance
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.productsBySubcategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="totalSales"
                      fill={colors.primary}
                      name="Revenue"
                    />
                    <Bar
                      dataKey="totalQuantitySold"
                      fill={colors.secondary}
                      name="Units Sold"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Trends */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-[#343a40] mb-4">
                Sales Trends
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.salesTrendsBySubcategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalSales"
                      stroke={colors.primary}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="totalQuantitySold"
                      stroke={colors.secondary}
                      name="Units"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-[#343a40] mb-4">
                Customer Demographics
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.customerDemographicsBySubcategory}
                      dataKey="totalSales"
                      nameKey="gender"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.customerDemographicsBySubcategory.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={[colors.primary, colors.secondary][index % 2]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-[#343a40] mb-4">
                Top Selling Products
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#ced4da]">
                      <th className="text-left p-2">Product</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.productsBySubcategory
                      .slice(0, 5)
                      .map((product, index) => (
                        <tr key={index} className="border-b border-[#ced4da]">
                          <td className="p-2">{product.productName}</td>
                          <td className="text-right p-2">
                            ${product.totalSales.toLocaleString()}
                          </td>
                          <td className="text-right p-2">
                            {product.totalQuantitySold.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandAnalysis;
