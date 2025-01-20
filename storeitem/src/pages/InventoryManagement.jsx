import React, { useState, useMemo } from "react";
import { Search, Edit2, Trash2, Eye, Plus, Package } from "lucide-react";

// Custom Button Component
const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2";
  const variants = {
    primary: "bg-[#0077b6] hover:bg-[#0066a0] text-white",
    secondary: "bg-[#00b4d8] hover:bg-[#009dc0] text-white",
    outline: "border border-[#ced4da] hover:bg-[#f8f9fa] text-[#343a40]",
    danger: "bg-[#d00000] hover:bg-[#b00000] text-white",
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

// Custom Input Component
const Input = ({ icon, ...props }) => (
  <div className="relative">
    {icon && (
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6c757d]">
        {icon}
      </span>
    )}
    <input
      className={`w-full px-4 py-2 rounded-md border border-[#ced4da] focus:outline-none focus:border-[#0077b6] ${
        icon ? "pl-10" : ""
      }`}
      {...props}
    />
  </div>
);

// Custom Select Component
const Select = ({ options, value, onChange, placeholder }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full px-4 py-2 rounded-md border border-[#ced4da] focus:outline-none focus:border-[#0077b6] bg-white"
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Custom Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#343a40]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#6c757d] hover:text-[#343a40]"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Custom Badge Component
const Badge = ({ variant, children }) => {
  const variants = {
    success: "bg-[#80ed99] text-[#2d6a4f]",
    warning: "bg-[#ffca3a] text-[#ffcc00]",
    danger: "bg-[#ff595e] text-[#d00000]",
    secondary: "bg-[#f8f9fa] text-[#6c757d]",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-sm font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

const InventoryManagement = () => {
  // Sample initial data
  const initialData = [
    {
      productId: 1,
      name: "iPhone 14",
      category: "Electronics",
      subCategory: "Apple",
      unitOfMeasure: "Piece",
      stockLevel: 150,
      price: 79999,
      expiryDate: "Non-Perishable",
      lowStockAlert: false,
      expiryAlert: "Non-Perishable",
    },
    {
      productId: 2,
      name: "Nike Air Max",
      category: "Footwear",
      subCategory: "Nike",
      unitOfMeasure: "Pair",
      stockLevel: 30,
      price: 12999,
      expiryDate: "2025-03-10",
      lowStockAlert: true,
      expiryAlert: "Warning",
    },
    {
      productId: 3,
      name: "Organic Bananas",
      category: "Grocery",
      subCategory: "Organic",
      unitOfMeasure: "KG",
      stockLevel: 10,
      price: 99,
      expiryDate: "2025-01-25",
      lowStockAlert: true,
      expiryAlert: "Danger",
    },
  ];

  // State management
  const [products, setProducts] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [newStockAmount, setNewStockAmount] = useState("");

  // Computed categories for filter
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productId.toString().includes(searchQuery);
      const matchesCategory =
        !categoryFilter || product.category === categoryFilter;
      const matchesStock =
        !stockFilter ||
        (stockFilter === "low" && product.lowStockAlert) ||
        (stockFilter === "normal" && !product.lowStockAlert);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  // Handle add stock
  const handleAddStock = () => {
    if (selectedProduct && newStockAmount) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.productId === selectedProduct.productId) {
            const newStock = p.stockLevel + parseInt(newStockAmount);
            return {
              ...p,
              stockLevel: newStock,
              lowStockAlert: newStock < 20,
            };
          }
          return p;
        })
      );
      setIsAddStockModalOpen(false);
      setNewStockAmount("");
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="bg-white rounded-lg shadow-sm p-6"> */}
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#343a40]">
          Inventory Management
        </h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          placeholder="All Categories"
          options={categories.map((cat) => ({ value: cat, label: cat }))}
        />
        <Select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          placeholder="All Stock Levels"
          options={[
            { value: "low", label: "Low Stock" },
            { value: "normal", label: "Normal Stock" },
          ]}
        />
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#ced4da]">
              <th className="text-left p-4 text-[#6c757d] font-semibold">ID</th>
              <th className="text-left p-4 text-[#6c757d] font-semibold">
                Name
              </th>
              <th className="text-left p-4 text-[#6c757d] font-semibold">
                Category
              </th>
              <th className="text-left p-4 text-[#6c757d] font-semibold">
                Price
              </th>
              <th className="text-left p-4 text-[#6c757d] font-semibold">
                Stock
              </th>
              <th className="text-left p-4 text-[#6c757d] font-semibold">
                Status
              </th>
              <th className="text-right p-4 text-[#6c757d] font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.productId} className="border-b border-[#ced4da]">
                <td className="p-4">{product.productId}</td>
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">{formatPrice(product.price)}</td>
                <td className="p-4">
                  {product.stockLevel} {product.unitOfMeasure}
                </td>
                <td className="p-4">
                  <Badge variant={product.lowStockAlert ? "danger" : "success"}>
                    {product.lowStockAlert ? "Low Stock" : "In Stock"}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsAddStockModalOpen(true);
                      }}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this product?"
                          )
                        ) {
                          setProducts((prev) =>
                            prev.filter(
                              (p) => p.productId !== product.productId
                            )
                          );
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      <Modal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        title="Add Stock"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Product
              </label>
              <p className="text-[#343a40]">{selectedProduct.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Current Stock
              </label>
              <p className="text-[#343a40]">
                {selectedProduct.stockLevel} {selectedProduct.unitOfMeasure}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Add Stock
              </label>
              <Input
                type="number"
                min="1"
                value={newStockAmount}
                onChange={(e) => setNewStockAmount(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddStockModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddStock}>Add Stock</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Product Details"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Product ID
              </label>
              <p className="text-[#343a40]">{selectedProduct.productId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Name
              </label>
              <p className="text-[#343a40]">{selectedProduct.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Category
              </label>
              <p className="text-[#343a40]">{selectedProduct.category}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Price
              </label>
              <p className="text-[#343a40]">
                {formatPrice(selectedProduct.price)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Stock Level
              </label>
              <p className="text-[#343a40]">
                {selectedProduct.stockLevel} {selectedProduct.unitOfMeasure}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Expiry Date
              </label>
              <p className="text-[#343a40]">{selectedProduct.expiryDate}</p>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Product Name
              </label>
              <Input
                defaultValue={selectedProduct.name}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Category
              </label>
              <Select
                value={selectedProduct.category}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                options={categories.map((cat) => ({
                  value: cat,
                  label: cat,
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Price (₹)
              </label>
              <Input
                type="number"
                defaultValue={selectedProduct.price}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Unit of Measure
              </label>
              <Input
                defaultValue={selectedProduct.unitOfMeasure}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({
                    ...prev,
                    unitOfMeasure: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Expiry Date
              </label>
              <Input
                type="date"
                defaultValue={
                  selectedProduct.expiryDate !== "Non-Perishable"
                    ? selectedProduct.expiryDate
                    : ""
                }
                onChange={(e) =>
                  setSelectedProduct((prev) => ({
                    ...prev,
                    expiryDate: e.target.value || "Non-Perishable",
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setProducts((prev) =>
                    prev.map((p) =>
                      p.productId === selectedProduct.productId
                        ? selectedProduct
                        : p
                    )
                  );
                  setIsEditModalOpen(false);
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6c757d] mb-1">
              Product Name
            </label>
            <Input
              placeholder="Enter product name"
              onChange={(e) =>
                setSelectedProduct((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6c757d] mb-1">
              Category
            </label>
            <Select
              placeholder="Select category"
              options={categories.map((cat) => ({ value: cat, label: cat }))}
              onChange={(e) =>
                setSelectedProduct((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6c757d] mb-1">
              Price (₹)
            </label>
            <Input
              type="number"
              placeholder="Enter price"
              onChange={(e) =>
                setSelectedProduct((prev) => ({
                  ...prev,
                  price: parseFloat(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6c757d] mb-1">
              Initial Stock
            </label>
            <Input
              type="number"
              placeholder="Enter initial stock"
              onChange={(e) =>
                setSelectedProduct((prev) => ({
                  ...prev,
                  stockLevel: parseInt(e.target.value),
                  lowStockAlert: parseInt(e.target.value) < 20,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6c757d] mb-1">
              Unit of Measure
            </label>
            <Input
              placeholder="e.g., Piece, KG, Pair"
              onChange={(e) =>
                setSelectedProduct((prev) => ({
                  ...prev,
                  unitOfMeasure: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6c757d] mb-1">
              Expiry Date
            </label>
            <Input
              type="date"
              onChange={(e) =>
                setSelectedProduct((prev) => ({
                  ...prev,
                  expiryDate: e.target.value || "Non-Perishable",
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (
                  selectedProduct?.name &&
                  selectedProduct?.category &&
                  selectedProduct?.price
                ) {
                  setProducts((prev) => [
                    ...prev,
                    {
                      ...selectedProduct,
                      productId: Math.max(...prev.map((p) => p.productId)) + 1,
                      expiryAlert:
                        selectedProduct.expiryDate === "Non-Perishable"
                          ? "Non-Perishable"
                          : "Normal",
                    },
                  ]);
                  setIsAddModalOpen(false);
                  setSelectedProduct(null);
                } else {
                  alert("Please fill in all required fields");
                }
              }}
            >
              Add Product
            </Button>
          </div>
        </div>
      </Modal>
      {/* </div> */}
    </div>
  );
};

export default InventoryManagement;
