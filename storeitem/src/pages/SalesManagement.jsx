import React, { useState, useEffect } from "react";

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors duration-200 ${
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
      <label className="block text-sm font-medium text-[#6c757d]">
        {label}
      </label>
    )}
    <input
      className={`w-full px-3 py-2 border ${
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
      <label className="block text-sm font-medium text-[#6c757d]">
        {label}
      </label>
    )}
    <select
      className={`w-full px-3 py-2 border ${
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
  const [sellerInfo, setSellerInfo] = useState({
    name: "",
    buyerName: "",
    buyerAge: "",
    buyerGender: "",
  });

  const ageOptions = [
    { value: "18-25", label: "18-25 years" },
    { value: "26-35", label: "26-35 years" },
    { value: "36-45", label: "36-45 years" },
    { value: "46-55", label: "46-55 years" },
    { value: "56+", label: "56+ years" },
  ];

  // Mock products data (prices in INR)
  const products = [
    {
      id: 1,
      name: "Product A",
      category: "Category X",
      price: 7500,
      unit: "Piece",
      stock: 10,
    },
    {
      id: 2,
      name: "Product B",
      category: "Category Y",
      price: 3750,
      unit: "KG",
      stock: 5,
    },
  ];

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

  const handleSubmit = () => {
    const saleData = {
      salesperson: sellerInfo.name,
      buyer: {
        name: sellerInfo.buyerName,
        age: sellerInfo.buyerAge,
        gender: sellerInfo.buyerGender,
      },
      products: cartItems,
      totalAmount: cartItems.reduce((sum, item) => sum + item.subtotal, 0),
    };

    console.log("Sale Data:", saleData);
  };

  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-[#343a40] mb-6">New Sale</h2>

      <div className="space-y-6">
        {/* Seller Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Seller Name"
            value={sellerInfo.name}
            onChange={(e) =>
              setSellerInfo({ ...sellerInfo, name: e.target.value })
            }
            placeholder="Enter seller name"
          />
          <Input
            label="Buyer Name"
            value={sellerInfo.buyerName}
            onChange={(e) =>
              setSellerInfo({ ...sellerInfo, buyerName: e.target.value })
            }
            placeholder="Enter buyer name"
          />
          <Select
            label="Buyer Age"
            value={sellerInfo.buyerAge}
            onChange={(e) =>
              setSellerInfo({ ...sellerInfo, buyerAge: e.target.value })
            }
            options={ageOptions}
          />
        </div>

        {/* Product Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Product"
            value={selectedProduct?.id || ""}
            onChange={(e) => {
              const product = products.find(
                (p) => p.id === parseInt(e.target.value)
              );
              setSelectedProduct(product);
            }}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.name} (Stock: ${p.stock} ${p.unit})`,
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
          <div className="mt-6">
            <h3 className="text-lg font-medium text-[#343a40] mb-3">
              Cart Items
            </h3>
            <div className="border border-[#ced4da] rounded-md overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-[#f8f9fa] sticky top-0">
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
                          {item.quantity} {item.unit}
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
                <tr className="flex justify-between px-4 py-2">
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
  const [sales, setSales] = useState([
    {
      id: 101,
      date: "2025-01-20",
      products: ["Product A", "Product B"],
      totalAmount: 150,
      salesperson: "John Doe",
    },
    {
      id: 102,
      date: "2025-01-19",
      products: ["Product C"],
      totalAmount: 75,
      salesperson: "Jane Smith",
    },
  ]);

  return (
    <Card className="p-6 mt-8">
      <h2 className="text-xl font-semibold text-[#343a40] mb-6">
        Sales History
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input type="date" label="Start Date" placeholder="Select start date" />
        <Input type="date" label="End Date" placeholder="Select end date" />
        <Input label="Search" placeholder="Search by product or ID" />
      </div>

      {/* Sales Table */}
      <div className="border border-[#ced4da] rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f8f9fa]">
            <tr>
              <th className="px-4 py-2 text-left text-[#6c757d]">ID</th>
              <th className="px-4 py-2 text-left text-[#6c757d]">Date</th>
              <th className="px-4 py-2 text-left text-[#6c757d]">Products</th>
              <th className="px-4 py-2 text-left text-[#6c757d]">Amount</th>
              <th className="px-4 py-2 text-left text-[#6c757d]">
                Salesperson
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-t border-[#ced4da]">
                <td className="px-4 py-2">{sale.id}</td>
                <td className="px-4 py-2">{sale.date}</td>
                <td className="px-4 py-2">{sale.products.join(", ")}</td>
                <td className="px-4 py-2">${sale.totalAmount}</td>
                <td className="px-4 py-2">{sale.salesperson}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-[#6c757d]">Showing 1-2 of 2 entries</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled>
            Previous
          </Button>
          <Button variant="secondary" disabled>
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
      <div className="flex gap-2 border-b border-[#ced4da] mb-6">
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
