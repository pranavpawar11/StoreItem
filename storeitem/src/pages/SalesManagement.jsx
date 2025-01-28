import React, { useState, useEffect } from "react";
import { fetchProducts, submitSale } from "../components/ApiService/productAPI";

import AlertPopup from "../components/UI/AlertPopup";

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 dark:text-gray-50 dark:bg-gray-800 font-medium text-sm rounded-t-lg transition-colors duration-200 ${
      active
        ? "bg-white text-[#0077b6] border-t-2 border-[#0077b6] border-b-0"
        : "bg-[#f8f9fa] text-[#6c757d] hover:bg-[#e9ecef] border-b border-[#ced4da]"
    }`}
  >
    {children}
  </button>
);

// Common Button Component
const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-colors duration-200";
  const variants = {
    primary: "bg-[#0077b6] hover:bg-[#00b4d8] text-white",
    secondary:
      "bg-white border border-[#ced4da] text-[#6c757d] hover:bg-[#f8f9fa]",
    danger: "bg-[#d00000] hover:bg-[#ff595e] text-white",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
const Input = ({ label, error, ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-[#6c757d] dark:text-gray-50 dark:bg-gray-800">
        {label}
      </label>
    )}
    <input
      className={`w-full px-3 py-2 border dark:text-gray-50 dark:bg-gray-800 ${
        error ? "border-[#d00000]" : "border-[#ced4da]"
      } rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-transparent`}
      {...props}
    />
    {error && <p className="text-sm text-[#d00000]">{error}</p>}
  </div>
);

// Select Component
const Select = ({ label, options, error, ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium dark:text-gray-50 dark:bg-gray-800">
        {label}
      </label>
    )}
    <select
      className={`w-full px-3 py-2 border dark:text-gray-50 dark:bg-gray-800 ${
        error ? "border-[#d00000]" : "border-[#ced4da]"
      } rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-transparent bg-white`}
      {...props}
    >
      <option value="">Select...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-sm text-[#d00000]">{error}</p>}
  </div>
);

// Badge Component
// eslint-disable-next-line
const Badge = ({ variant = "primary", children }) => {
  const variants = {
    primary: "bg-[#0077b6] text-white",
    success: "bg-[#80ed99] text-[#2d6a4f]",
    warning: "bg-[#ffca3a] text-[#343a40]",
    danger: "bg-[#ff595e] text-white",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

// Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

// Billing Section
const BillingSection = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [buyerInfo, setBuyerInfo] = useState({
    buyerName: "",
    buyerAge: "",
    buyerGender: "",
  });
  const [products, setProducts] = useState([]);
  
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Fetch products from the API
    const getProducts = async () => {
      try {
        const response = await fetchProducts();
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    getProducts();
  }, []);

  const handleAddToCart = () => {
    if (!selectedProduct || !quantity) return;

    const newItem = {
      ...selectedProduct,
      quantity: parseInt(quantity),
      subtotal: selectedProduct.price * parseInt(quantity),
    };

    setCartItems([...cartItems, newItem]);
    setSelectedProduct(null);
    setQuantity("");
  };

  const handleSubmit = async () => {
    const saleData = {
      products: cartItems.map((item) => ({
        productId: item.productId, // use productId here
        quantitySold: item.quantity,
        salePrice: item.price,
        totalSaleAmount: item.subtotal,
      })),
      buyerDetails: {
        name: buyerInfo.buyerName,
        age: buyerInfo.buyerAge,
        gender: buyerInfo.buyerGender,
      },
    };

    try {
      const response = await submitSale(saleData);
      if (response.message) {
        setAlert({ message: "Sale Added Succesfully", status: "success" }); // Show pop-up if sale is successful
        setSelectedProduct(null);
        setQuantity("");
        setCartItems([]);
        setBuyerInfo({
          buyerName: "",
          buyerAge: "",
          buyerGender: "",
        });
      }
    } catch (error) {
      console.error("Error submitting sale:", error);
    }
  };

  const formatPrice = (price) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <Card className="p-6 dark:text-gray-50 dark:bg-gray-800">
      {/* Pop-up Confirmation */}
      {alert && (
          <AlertPopup
            message={alert.message}
            status={alert.status}
            onClose={() => setAlert(null)}
          />
      )}
      <h2 className="text-xl font-semibold text-[#343a40] mb-6 dark:text-gray-50 dark:bg-gray-800">New Sale</h2>

      <div className="space-y-6">
        {/* Buyer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          <Input
            label="Buyer Name"
            value={buyerInfo.buyerName}
            onChange={(e) =>
              setBuyerInfo({ ...buyerInfo, buyerName: e.target.value })
            }
            placeholder="Enter buyer name"
          />
          <Input
            label="Buyer Age"
            type="number"
            value={buyerInfo.buyerAge}
            onChange={(e) =>
              setBuyerInfo({ ...buyerInfo, buyerAge: e.target.value })
            }
            placeholder="Enter buyer age"
          />
          <Select
            label="Buyer Gender"
            value={buyerInfo.buyerGender}
            onChange={(e) =>
              setBuyerInfo({ ...buyerInfo, buyerGender: e.target.value })
            }
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />
        </div>

        {/* Product Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Product"
            value={selectedProduct?.productId || ""} // Update to productId
            onChange={(e) => {
              const product = products.find(
                (p) => p.productId === parseInt(e.target.value)
              );
              setSelectedProduct(product);
            }}
            options={products.map((p) => ({
              value: p.productId, // Use productId as the value
              label: `${p.name} (Stock: ${p.stock} ${p.unitOfMeasure})`,
            }))}
          />
          <Input
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
          />
          <div className="flex items-end">
            <Button onClick={handleAddToCart} className="w-full">
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        {cartItems.length > 0 && (
          <div className="mt-6 dark:text-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-medium dark:text-gray-50 dark:bg-gray-800 mb-3">
              Cart Items
            </h3>
            <div className="border border-[#ced4da] rounded-md overflow-hidden dark:text-gray-50 dark:bg-gray-800">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full ">
                  <thead className="bg-[#f8f9fa] sticky top-0 dark:text-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-[#6c757d]">
                        Product
                      </th>
                      <th className="px-4 py-2 text-left text-[#6c757d]">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-[#6c757d]">
                        Price
                      </th>
                      <th className="px-4 py-2 text-left text-[#6c757d]">
                        Subtotal
                      </th>
                      <th className="px-4 py-2 text-left text-[#6c757d]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, index) => (
                      <tr key={index} className="border-t border-[#ced4da]">
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">
                          {item.quantity} {item.unitOfMeasure}
                        </td>
                        <td className="px-4 py-2">{formatPrice(item.price)}</td>
                        <td className="px-4 py-2">
                          {formatPrice(item.subtotal)}
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            variant="danger"
                            className="px-2 py-1 text-sm"
                            onClick={() => {
                              const newItems = [...cartItems];
                              newItems.splice(index, 1);
                              setCartItems(newItems);
                            }}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[#ced4da] bg-[#f8f9fa]">
                <tr className="flex justify-between px-4 py-2 dark:text-gray-50 dark:bg-gray-800">
                  <td className="font-medium">Total:</td>
                  <td className="font-medium">
                    {formatPrice(
                      cartItems.reduce((sum, item) => sum + item.subtotal, 0)
                    )}
                  </td>
                </tr>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button onClick={handleSubmit}>Complete Sale</Button>
        </div>
      </div>

      
    </Card>
  );
};

// Sales Table Section
const SalesTable = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const salesPerPage = 10; // Number of sales to display per page

  // Fetch sales data from the API
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/getsales"
        );
        const data = await response.json();
        if (data.status) {
          setSales(data.data);
          setFilteredSales(data.data); // Initially, display all sales
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };
    fetchSales();
  }, []);

  // Filter the sales data based on selected filters
  useEffect(() => {
    let filtered = sales;

    // Filter by start date
    if (startDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.saleDate) >= new Date(startDate)
      );
    }

    // Filter by end date
    if (endDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.saleDate) <= new Date(endDate)
      );
    }

    // Filter by search query (product ID or name)
    if (searchQuery) {
      filtered = filtered.filter(
        (sale) =>
          sale._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sale.productId.toString().includes(searchQuery)
      );
    }

    // Filter by gender
    if (selectedGender) {
      filtered = filtered.filter(
        (sale) => sale.buyerDetails.gender === selectedGender
      );
    }

    // Set the filtered sales
    setFilteredSales(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [startDate, endDate, searchQuery, selectedGender, sales]);

  // Calculate the index of the last item on the current page
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);

  // Handle page change
  // const handlePageChange = (pageNumber) => {
  //   setCurrentPage(pageNumber);
  // };

  // Handle previous/next page change
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < Math.ceil(filteredSales.length / salesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Card className="p-6 mt-8 dark:text-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-[#343a40] mb-6 dark:text-gray-50 dark:bg-gray-800">
        Sales History
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Select start date"
        />
        <Input
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="Select end date"
        />
        <Input
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by product or ID"
        />
        <Select
          label="Gender"
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          options={[
            { value: "", label: "All Genders" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ]}
        />  
      </div>

      {/* Sales Table */}
      <div className="border border-[#ced4da] rounded-md overflow-hidden" >
        <table className="w-full">
          <thead className="bg-[#f8f9fa] dark:text-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-[#6c757d] dark:text-gray-50">ID</th>
              <th className="px-4 py-2 text-left text-[#6c757d] dark:text-gray-50">Date</th>
              <th className="px-4 py-2 text-left text-[#6c757d] dark:text-gray-50">Products</th>
              <th className="px-4 py-2 text-left text-[#6c757d] dark:text-gray-50">Amount</th>
              <th className="px-4 py-2 text-left text-[#6c757d] dark:text-gray-50">
                Salesperson
              </th>
              <th className="px-4 py-2 text-left text-[#6c757d]">Gender</th>
            </tr>
          </thead>
          <tbody className="text-[#6c757d] dark:text-gray-50">
            {currentSales.length > 0 ? (
              currentSales.map((sale) => (
                <tr key={sale._id} className="border-t border-[#ced4da]">
                  <td className="px-4 py-2 text-[#6c757d] dark:text-gray-100">{sale._id}</td>
                  <td className="px-4 py-2 text-[#6c757d] dark:text-gray-100">
                    {new Date(sale.saleDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-[#6c757d] dark:text-gray-100">{`Product ID: ${sale.productId} (Quantity: ${sale.quantitySold})`}</td>
                  <td className="px-4 py-2 text-[#6c757d] dark:text-gray-100">₹{sale.totalSaleAmount}</td>
                  <td className="px-4 py-2 text-[#6c757d] dark:text-gray-100">
                    {sale.buyerDetails.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-[#6c757d] dark:text-gray-100">{sale.buyerDetails.gender}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-2 text-center text-[#6c757d]"
                >
                  No sales found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-[#6c757d] text-[#6c757d] dark:text-gray-50">
          Showing {indexOfFirstSale + 1} to{" "}
          {Math.min(indexOfLastSale, filteredSales.length)} of{" "}
          {filteredSales.length} entries
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={handleNext}
            disabled={
              currentPage === Math.ceil(filteredSales.length / salesPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Main Sales Management Component
const SalesManagement = () => {
  const [activeTab, setActiveTab] = useState("billing");

  return (
    <div className="space-y-6">
      
      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-[#ced4da] mb-6 ">
        <TabButton
          active={activeTab === "billing"}
          onClick={() => setActiveTab("billing")}
        >
          New Sale
        </TabButton>
        <TabButton
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        >
          Sales History
        </TabButton>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "billing" && <BillingSection />}
        {activeTab === "history" && <SalesTable />}
      </div>
    </div>
  );
};

export default SalesManagement;
