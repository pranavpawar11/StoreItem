import React, { useState } from "react";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Plus,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";

// Sample data - replace with API call
const sampleData = [
  {
    productId: 1,
    name: "iPhone 14 Pro",
    category: "Electronics",
    subCategory: "Apple",
    unitOfMeasure: "Piece",
    stockLevel: 150,
    costPrice: 85000,
    sellingPrice: 129900,
    expiryDate: "Non-Perishable",
    lowStockAlert: false,
    expiryAlert: "Non-Perishable",
  },
  {
    productId: 2,
    name: "Tata Tea Gold",
    category: "Grocery",
    subCategory: "Tata",
    unitOfMeasure: "KG",
    stockLevel: 15,
    costPrice: 380,
    sellingPrice: 490,
    expiryDate: "2024-06-15",
    lowStockAlert: true,
    expiryAlert: "Yellow",
  },
  {
    productId: 3,
    name: "Amul Butter",
    category: "Dairy",
    subCategory: "Amul",
    unitOfMeasure: "gm",
    stockLevel: 8,
    costPrice: 45,
    sellingPrice: 55,
    expiryDate: "2024-02-01",
    lowStockAlert: true,
    expiryAlert: "Red",
  },
];

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const getStockStatus = (level) => {
    if (level <= 10) return { color: "red", text: "Low Stock" };
    if (level <= 20) return { color: "yellow", text: "Medium Stock" };
    return { color: "green", text: "In Stock" };
  };

  const getExpiryStatus = (date) => {
    if (date === "Non-Perishable") return { color: "gray", text: "N/A" };
    const daysUntilExpiry = Math.ceil(
      (new Date(date) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry <= 7) return { color: "red", text: "Expiring Soon" };
    if (daysUntilExpiry <= 30) return { color: "yellow", text: "Expiring" };
    return { color: "green", text: "Safe" };
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Inventory Management
        </h2>
        <button className="flex items-center px-4 py-2 bg-[#0077b6] text-white rounded-lg hover:bg-[#00b4d8] transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add New Product
        </button>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Grocery">Grocery</option>
            <option value="Dairy">Dairy</option>
          </select>
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Stock Filter */}
        <div className="relative">
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock</option>
            <option value="medium">Medium Stock</option>
            <option value="high">High Stock</option>
          </select>
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category/Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock & Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleData.map((product) => {
                const stockStatus = getStockStatus(product.stockLevel);
                const expiryStatus = getExpiryStatus(product.expiryDate);

                return (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.productId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.category}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.subCategory}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Stock: {product.stockLevel} {product.unitOfMeasure}
                      </div>
                      <div className="text-sm text-gray-500">
                        ₹{product.sellingPrice.toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${stockStatus.color}-100 text-${stockStatus.color}-800`}
                      >
                        {stockStatus.text}
                      </span>
                      <span
                        className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${expiryStatus.color}-100 text-${expiryStatus.color}-800`}
                      >
                        {expiryStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button className="text-[#0077b6] hover:text-[#00b4d8]">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="text-green-600 hover:text-green-700">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">3</span> of{" "}
              <span className="font-medium">3</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
