import React, { useState, useMemo, useEffect } from "react";
import { Search, Edit2, Trash2, Eye, Plus, Package } from "lucide-react";
import AlertPopup from "../components/UI/AlertPopup";
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
  // State management
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [newStockAmount, setNewStockAmount] = useState(0);
  const [newPrice, setPrice] = useState(0);
  const [alert, setAlert] = useState(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [categoriesData, setCategoriesData] = useState([]);

  const [categoryData, setCategoryData] = useState({
    name: "",
    description: "",
  });
  // Fetch products data from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/getproducts"
        );
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        if (data.status) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProducts();
  }, [selectedProduct]);

  // Computed categories for filter
  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/category/categories"
        );
        const result = await response.json();

        if (result.message === "Categories fetched successfully") {
          // Extracting categories and setting state
          setCategoriesData(result.data);
        } else {
          console.error("Error fetching categories:", result.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Use memo to create a unique list of category names
  const categories = useMemo(() => {
    return Array.from(new Set(categoriesData.map((category) => category.name)));
  }, [categoriesData]);

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
        (stockFilter === "low" && product.stock === 0) ||
        (stockFilter === "normal" && product.stock > 0);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0"); // Ensure day is two digits
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Return in d-m-y format
  };

  const handleAddStock = async () => {
    if (selectedProduct && newStockAmount && expiryDate) {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/addstock",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              products: [
                {
                  productId: selectedProduct.productId,
                  stock: parseInt(newStockAmount),
                  price: selectedProduct.price,
                  expiryDate,
                },
              ],
            }),
          }
        );

        const result = await response.json();
        if (response.ok) {
          setAlert({ message: result.message, status: "success" });
        } else {
          setAlert({
            message: result.errors[0]?.msg || "Failed to add stock",
            status: "error",
          });
        }
      } catch (error) {
        setAlert({
          message: "Server error. Please try again later.",
          status: "error",
        });
      } finally {
        setIsAddStockModalOpen(false);
        setNewStockAmount(0);
        setPrice(0);
        setSelectedProduct(null);
        setExpiryDate("");
      }
    }
  };

  const updateProductAndStock = async () => {
    try {
      console.log(selectedProduct);
      const response = await fetch(
        `http://localhost:5000/api/products/updateProductAndStock/${selectedProduct.productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedProduct),
        }
      );

      if (response.status) {
        setAlert({
          message: "Product and stock updated successfully",
          status: "success",
        });
      } else {
        setAlert({ message: "Error in Updating details", status: "error" });
      }
      setSelectedProduct(null);
      // const result = await response.json();
      // if (response.ok) {
      //   return { success: true, data: result.data.product };
      // } else {
      //   return {
      //     success: false,
      //     message: result.error || "Failed to update product",
      //   };
      // }
    } catch (error) {
      console.error("Error updating product:", error);
      setAlert({ message: "Server error", status: "error" });
      // return { success: false, message: "Server error" };
    } finally {
      setNewStockAmount(0);
      setIsEditModalOpen(false);
    }
  };

  const handleAddProduct = async () => {
    if (
      selectedProduct?.name &&
      selectedProduct?.category &&
      selectedProduct?.price &&
      selectedProduct?.stock
    ) {
      try {
        // Send data to the backend to create the product
        const response = await fetch(
          "http://localhost:5000/api/products/createproduct",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: selectedProduct.name,
              description: selectedProduct.description,
              category: selectedProduct.category,
              subCategory: selectedProduct.subCategory,
              unitOfMeasure: selectedProduct.unitOfMeasure,
              initialStock: selectedProduct.stock,
              price: selectedProduct.price,
              expiryDate:
                selectedProduct.expiryDate === "Non-Perishable"
                  ? null
                  : selectedProduct.expiryDate,
            }),
          }
        );

        const result = await response.json();
        if (response.ok) {
          // Add the product to the local state and close modal
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

          setAlert({
            message: "Product created and stock added successfully",
            status: "success",
          });
        } else {
          setAlert({ message: "Failed to create product", status: "error" });
        }
      } catch (error) {
        console.error("Error adding product:", error);
        setAlert({
          message: "An error occurred while adding the product",
          status: "error",
        });
      }
    } else {
      setAlert({
        message: "Please fill in all required fields",
        status: "error",
      });
    }
  };

  const handleAddCategory = async () => {
    const { name, description } = categoryData;

    if (!name) {
      setAlert({
        message: "Category name is required",
        status: "error",
      });
      return;
    }

    const categoryExists = categoriesData.find(
      (category) => category.name === name
    );

    if (categoryExists) {
      // If category exists, set the alert and return early
      setAlert({
        message: "Category name already exists",
        status: "error",
      });
      return; // Exit early to prevent submission
    }
    try {
      // Send category data to backend
      const response = await fetch(
        "http://localhost:5000/api/category/createcategory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Add the newly created category to the local categories list
        setCategoriesData((prev) => [...prev, result.data]);

        // Close the modal and reset the form
        setIsAddCategoryModalOpen(false);
        setCategoryData({
          name: "",
          description: "",
        });
        setAlert({
          message: "Category Added Successfully",
          status: "success",
        });
      } else {
        setAlert({
          message: "Failed to create category",
          status: "error",
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      setAlert({
        message: "An error occurred while adding the category.",
        status: "error",
      });
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      // Send category data to backend
      const response = await fetch(
        `http://localhost:5000/api/products/deleteproduct/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      console.log(result);
      if (result.status) {
        setProducts((prev) => prev.filter((p) => p.productId !== id));
        setAlert({
          message: result.message,
          status: "success",
        });
      } else {
        setAlert({
          message: result.message,
          status: "error",
        });
      }
    } catch (error) {
      console.error("Error in Delelting ", error);
      setAlert({
        message: "Error in Delelting Product",
        status: "error",
      });
    }
  };
  return (
    <div className="space-y-6">
      {alert && (
        <AlertPopup
          message={alert.message}
          status={alert.status}
          onClose={() => setAlert(null)}
        />
      )}
      {/* <div className="bg-white rounded-lg shadow-sm p-6"> */}
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#343a40]">
          Inventory Management
        </h1>

        <div className="flex justify-between gap-4 items-center ">
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
          <Button onClick={() => setIsAddCategoryModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
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
                Brand
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
                <td className="p-4">{product.subCategory}</td>
                <td className="p-4">{formatPrice(product.price)}</td>
                <td className="p-4">
                  {product.stock} {product.unitOfMeasure}
                </td>
                <td className="p-4">
                  <Badge variant={product.stock === 0 ? "danger" : "success"}>
                    {product.stock === 0 ? "Out of Stock" : "In Stock"}
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
                          handleDeleteProduct(product.productId);
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
                {selectedProduct.stock} {selectedProduct.unitOfMeasure}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Add Stock Quantity
              </label>
              <Input
                type="number"
                min="1"
                value={newStockAmount}
                onChange={(e) => setNewStockAmount(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6c757d] mb-1">
                Expiry Date
              </label>
              <Input
                type="date"
                value={
                  expiryDate ||
                  (selectedProduct.expiryDate
                    ? new Date(selectedProduct.expiryDate)
                        .toISOString()
                        .split("T")[0]
                    : "")
                }
                onChange={(e) => setExpiryDate(e.target.value)}
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

      {/* View Product Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Product Details"
      >
        {selectedProduct && (
          <div className="space-y-3">
            {/* Enhanced Header */}
            <div className="flex justify-between items-center border-gray-100">
              <div className="text-lg font-semibold text-[#343a40]">
                {selectedProduct.name}
              </div>
              <div className="px-3 py-1 bg-blue-50 rounded-full text-sm font-medium text-blue-600">
                {selectedProduct.category}
              </div>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="text-lg font-semibold text-[#343a40]">
                <label className="block text-sm font-medium text-[#6c757d] mb-2">
                  Product ID
                </label>
                <p className="text-[#343a40] font-medium">
                  {selectedProduct.productId}
                </p>
              </div>

              <div className="text-lg font-semibold text-[#343a40]">
                {/* <label className="block text-sm font-medium text-[#6c757d] mb-2">
                  Brand
                </label> */}
                <div className="px-3 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-600">
                  {selectedProduct.subCategory}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Product ID */}
              {/* <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <label className="block text-sm font-medium text-[#6c757d] mb-2">
                  Product ID
                </label>
                <p className="text-[#343a40] font-medium">
                  {selectedProduct.productId}
                </p>
              </div> */}

              {/* Description */}
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <label className="block text-sm font-medium text-[#6c757d] mb-2">
                  Description
                </label>
                <p className="text-[#343a40] leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Subcategory */}
              {/* <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <label className="block text-sm font-medium text-[#6c757d] mb-2">
                  Brand
                </label>
                <p className="text-[#343a40]">{selectedProduct.subCategory}</p>
              </div> */}

              {/* Price - Special Styling */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <label className="block text-sm font-medium text-[#6c757d] mb-2">
                  Price
                </label>
                <p className="text-[#343a40] font-bold text-lg">
                  {formatPrice(selectedProduct.price)}
                  <span className="text-sm font-normal text-[#6c757d] ml-1">
                    /{selectedProduct.unitOfMeasure}
                  </span>
                </p>
              </div>

              {/* Stock Level */}
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <label className="block text-sm font-medium text-[#6c757d] mb-2">
                  Stock Level
                </label>
                <p className="text-[#343a40]">
                  <span className="font-medium">{selectedProduct.stock}</span>
                  <span className="text-[#6c757d] ml-1">
                    {selectedProduct.unitOfMeasure}
                  </span>
                </p>
              </div>

              {/* Expiry Date */}
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <label className="block text-sm font-medium text-[#6c757d] mb-2">
                  Expiry Date
                </label>
                <p className="text-[#343a40]">
                  {formatDate(selectedProduct.expiryDate)}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-6 py-2 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Updated Edit Product Modal */}
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
                Add Stock Quantity
              </label>
              <Input
                type="number"
                defaultValue={selectedProduct.stock}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({
                    ...prev,
                    stock: parseInt(e.target.value),
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
                  selectedProduct.expiryDate &&
                  selectedProduct.expiryDate !== "Non-Perishable"
                    ? new Date(selectedProduct.expiryDate)
                        .toISOString()
                        .split("T")[0]
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
              <Button onClick={updateProductAndStock}>Save Changes</Button>
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
              Brand Name
            </label>
            <Input
              placeholder="Enter brand name"
              onChange={(e) =>
                setSelectedProduct((prev) => ({
                  ...prev,
                  subCategory: e.target.value,
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
                  stock: parseInt(e.target.value),
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
            <Button onClick={handleAddProduct}>Add Product</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title="Add New Category"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6c757d] mb-1">
              Category Name
            </label>
            <Input
              placeholder="Enter category name"
              value={categoryData.name}
              onChange={(e) =>
                setCategoryData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6c757d] mb-1">
              Description (Optional)
            </label>
            <Input
              placeholder="Enter category description"
              value={categoryData.description}
              onChange={(e) =>
                setCategoryData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </div>
        </div>
      </Modal>
      {/* </div> */}
    </div>
  );
};

export default InventoryManagement;
