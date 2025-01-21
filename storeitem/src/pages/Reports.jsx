import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Download, Filter, Search, RefreshCcw } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ReportsDashboard = () => {
  const [reportType, setReportType] = useState("top-least-product");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("top");

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Only include dates in params if they are both provided
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await axios.get(
        `http://localhost:5000/api/salesReport/${reportType}`,
        { params }
      );
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data immediately when report type changes
    fetchReport();
  }, [reportType]); // Only depend on reportType

  // Add a separate effect for date changes
  useEffect(() => {
    // Only fetch if both dates are provided or both are empty
    if ((startDate && endDate) || (!startDate && !endDate)) {
      fetchReport();
    }
  }, [startDate, endDate]);

  // Add a clear dates button in the header controls section
  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = "";
    let filename = "";

    switch (reportType) {
      case "top-least-product":
        filename = "top-least-products-report.csv";
        csvContent = "Product Name,Brand,Category,Total Sales,Quantity Sold\n";
        [
          ...(reportData.topSelling || []),
          ...(reportData.leastSelling || []),
        ].forEach((item) => {
          csvContent += `"${item.productName}","${item.subCategory}","${item.category}",${item.totalSales},${item.totalQuantity}\n`;
        });
        break;

      case "inventory-movement":
        filename = "inventory-movement-report.csv";
        csvContent = "Product Name,Movement Type,Total Sales,Quantity Sold\n";
        [
          ...(reportData.fastMoving || []),
          ...(reportData.slowMoving || []),
        ].forEach((item) => {
          csvContent += `"${item.productName}","${
            item.totalQuantitySold >= 3 ? "Fast" : "Slow"
          }",${item.totalSales},${item.totalQuantitySold}\n`;
        });
        break;

      case "sales-and-stock-by-category":
        filename = "category-analysis-report.csv";
        csvContent = "Category,Total Stock,Total Sales,Quantity Sold\n";
        (reportData.salesAndStockByCategory || []).forEach((item) => {
          csvContent += `"${item.category}",${item.totalStock},${
            item.totalSales || 0
          },${item.totalQuantitySold || 0}\n`;
        });
        break;

      case "buyer-demographics":
        filename = "demographics-report.csv";
        csvContent =
          "Age Group,Gender,Product Name,Total Sales,Quantity Sold\n";
        Object.entries(reportData.data || {}).forEach(
          ([ageGroup, genderData]) => {
            Object.entries(genderData).forEach(([gender, products]) => {
              products.forEach((product) => {
                csvContent += `"${ageGroup}","${gender}","${product.productName}",${product.totalSales},${product.totalQuantitySold}\n`;
              });
            });
          }
        );
        break;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const renderTopLeastProducts = () => {
    if (!reportData) return null;

    const filteredData = reportData[
      activeTab === "top" ? "topSelling" : "leastSelling"
    ]?.filter((item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab("top")}
            className={`px-4 py-2 rounded ${
              activeTab === "top" ? "bg-[#0077b6] text-white" : "bg-gray-100"
            }`}
          >
            Top Selling
          </button>
          <button
            onClick={() => setActiveTab("least")}
            className={`px-4 py-2 rounded ${
              activeTab === "least" ? "bg-[#0077b6] text-white" : "bg-gray-100"
            }`}
          >
            Least Selling
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-[#ced4da]">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-4 py-2 border-b text-left">Product</th>
                <th className="px-4 py-2 border-b text-left">Brand</th>
                <th className="px-4 py-2 border-b text-left">Category</th>
                <th className="px-4 py-2 border-b text-right">Total Sales</th>
                <th className="px-4 py-2 border-b text-right">Quantity Sold</th>
              </tr>
            </thead>
            <tbody>
              {filteredData?.map((item, index) => (
                <tr key={index} className="hover:bg-[#f8f9fa]">
                  <td className="px-4 py-2 border-b">{item.productName}</td>
                  <td className="px-4 py-2 border-b">{item.subCategory}</td>
                  <td className="px-4 py-2 border-b">{item.category}</td>
                  <td className="px-4 py-2 border-b text-right">
                    ${item.totalSales.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border-b text-right">
                    {item.totalQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="productName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalSales" fill="#0077b6" name="Total Sales ($)" />
            <Bar dataKey="totalQuantity" fill="#00b4d8" name="Quantity Sold" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderInventoryMovement = () => {
    if (!reportData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Fast Moving Inventory</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-[#ced4da]">
              <thead className="bg-[#f8f9fa]">
                <tr>
                  <th className="px-4 py-2 border-b text-left">Product</th>
                  <th className="px-4 py-2 border-b text-right">
                    Quantity Sold
                  </th>
                  <th className="px-4 py-2 border-b text-right">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {reportData.fastMoving?.map((item, index) => (
                  <tr key={index} className="hover:bg-[#f8f9fa]">
                    <td className="px-4 py-2 border-b">{item.productName}</td>
                    <td className="px-4 py-2 border-b text-right">
                      {item.totalQuantitySold}
                    </td>
                    <td className="px-4 py-2 border-b text-right">
                      ${item.totalSales.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Slow Moving Inventory</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-[#ced4da]">
              <thead className="bg-[#f8f9fa]">
                <tr>
                  <th className="px-4 py-2 border-b text-left">Product</th>
                  <th className="px-4 py-2 border-b text-right">
                    Quantity Sold
                  </th>
                  <th className="px-4 py-2 border-b text-right">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {reportData.slowMoving?.map((item, index) => (
                  <tr key={index} className="hover:bg-[#f8f9fa]">
                    <td className="px-4 py-2 border-b">{item.productName}</td>
                    <td className="px-4 py-2 border-b text-right">
                      {item.totalQuantitySold}
                    </td>
                    <td className="px-4 py-2 border-b text-right">
                      ${item.totalSales.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Sales by Category & Brand
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.salesByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSales" fill="#0077b6" name="Total Sales ($)" />
              <Bar
                dataKey="totalQuantitySold"
                fill="#00b4d8"
                name="Quantity Sold"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Stock by Category</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-[#ced4da]">
              <thead className="bg-[#f8f9fa]">
                <tr>
                  <th className="px-4 py-2 border-b text-left">Category</th>
                  <th className="px-4 py-2 border-b text-right">Total Stock</th>
                  <th className="px-4 py-2 border-b text-right">Total Sales</th>
                  <th className="px-4 py-2 border-b text-right">
                    Quantity Sold
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.salesAndStockByCategory?.map((item, index) => (
                  <tr key={index} className="hover:bg-[#f8f9fa]">
                    <td className="px-4 py-2 border-b">{item.category}</td>
                    <td className="px-4 py-2 border-b text-right">
                      {item.totalStock}
                    </td>
                    <td className="px-4 py-2 border-b text-right">
                      ${item.totalSales?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-2 border-b text-right">
                      {item.totalQuantitySold || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDemographics = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {Object.entries(reportData.data || {}).map(([ageGroup, genderData]) => (
          <div key={ageGroup} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              Age Group: {ageGroup}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(genderData).map(([gender, products]) => (
                <div key={gender} className="border rounded p-4">
                  <h4 className="font-medium mb-2 capitalize">{gender}</h4>
                  <ul className="space-y-2">
                    {products.map((product, idx) => (
                      <li key={idx} className="text-sm">
                        <div className="font-medium">{product.productName}</div>
                        <div className="text-[#6c757d]">
                          Sales: ${product.totalSales.toLocaleString()}
                        </div>
                        <div className="text-[#6c757d]">
                          Qty: {product.totalQuantitySold}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap gap-4">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
            >
              <option value="top-least-product">Top/Least Products</option>
              <option value="inventory-movement">Inventory Movement</option>
              <option value="sales-and-stock-by-category">Category Analysis</option>
              <option value="buyer-demographics">Buyer Demographics</option>
            </select>

            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  placeholder="Start Date (Optional)"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  placeholder="End Date (Optional)"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={clearDates}
                  className="px-2 py-1 text-sm text-[#d00000] hover:bg-[#f8d7da] rounded"
                >
                  Clear Dates
                </button>
              )}
            </div>
          </div>

          {/* Add the search and export buttons here */}
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
              />
              <Search className="absolute left-3 top-2.5 text-[#6c757d]" size={20} />
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#00b4d8] text-white rounded hover:bg-[#0077b6] transition-colors"
            >
              <Download size={20} />
              Export
            </button>
          </div>
        </div>

        {/* Add the loading state and report content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCcw className="animate-spin text-[#0077b6]" size={32} />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            {reportType === 'top-least-product' && renderTopLeastProducts()}
            {reportType === 'inventory-movement' && renderInventoryMovement()}
            {reportType === 'sales-and-stock-by-category' && renderCategoryReport()}
            {reportType === 'buyer-demographics' && renderDemographics()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;
