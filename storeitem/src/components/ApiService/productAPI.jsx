export const fetchProducts = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/products/getproducts");
    if (!response.ok) throw new Error("Failed to fetch products");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const submitSale = async (saleData) => {
  try {
    const response = await fetch("http://localhost:5000/api/products/createsale", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saleData),
    });
    if (!response.ok) throw new Error("Failed to submit sale");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
