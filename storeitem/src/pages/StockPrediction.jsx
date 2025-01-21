import React, { useState ,useEffect} from "react";
// import {
//   LineChart,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Line,
//   CartesianGrid,
//   Legend,
// } from "recharts";
import { AlertTriangle, RefreshCcw } from "lucide-react";

// Custom Alert Component
const CustomAlert = ({ type, message, onClose }) => {
  const bgColor =
    type === "error"
      ? "bg-[#d00000]"
      : type === "success"
      ? "bg-[#2d6a4f]"
      : "bg-[#ffcc00]";

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-md flex items-center justify-between mb-4`}
    >
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="text-white hover:opacity-75">
        ×
      </button>
    </div>
  );
};

const StockPrediction = () => {
  const [selectedModel, setSelectedModel] = useState("v1");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [predictionUnit, setPredictionUnit] = useState("months");
  const [predictionLength, setPredictionLength] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionResults, setPredictionResults] = useState(null);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/getproducts"
        );
        const result = await response.json();
        if (result.data) {
          const fetchedProducts = result.data.map((product) => ({
            id: product.productId,
            name: product.name,
            price : product.price,
            description: product.description,
            category: product.category,
            subCategory: product.subCategory,
            unitOfMeasure: product.unitOfMeasure,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          }));
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handlePrediction = async () => {
    setLoading(true);
    setError(null);

    if (!selectedProduct) {
      setError("Please select a product.");
      setLoading(false);
      return;
    }

    try {
      let response;
      const productId = selectedProduct.id;
      const salePrice = selectedProduct.price;
      const saleDate = new Date().toISOString();

      if (selectedModel === "v1") {
        // Random Forest Model (v1)
        const payload = {
          productId: productId,
          salePrice: salePrice,
          saleDate: saleDate,
          forecast_duration: parseInt(predictionLength),
        };
        response = await fetch(
          "http://localhost:5000/api/predict/predict-stock",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else if (selectedModel === "v2") {
        // SARIMA Model (v2)
        const payload = {
          productId: productId,
          predictionLength: parseInt(predictionLength),
          unit: predictionUnit,
        };
        response = await fetch(
          "http://localhost:5000/api/predict/predict-stock-v2",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // SMA/ES Model (v3)
        const payload = {
          productId: productId,
          predictionLength: predictionLength === "SMA" ? "SMA" : "ES",
          periodType: predictionUnit === "months" ? "month" : "week",
        };
        response = await fetch(
          "http://localhost:5000/api/predict/predict-stock-v3",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Prediction failed");

      setPredictionResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedModel("v1");
    setSelectedProduct(null);
    setPredictionUnit("months");
    setPredictionLength("");
    setPredictionResults(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* <h1 className="text-3xl font-bold text-[#343a40] mb-8">
          Stock Prediction Dashboard
        </h1> */}

        {error && (
          <CustomAlert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Input Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-[#343a40] mb-4">
            Model Selection & Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-[#343a40] mb-2">
                Prediction Model
              </label>
              <select
                className="w-full p-2 border border-[#ced4da] rounded-md"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="v1">Random Forest (Regular Patterns)</option>
                <option value="v2">SARIMA (Seasonal Patterns)</option>
                <option value="v3">SMA/ES (Simple Trends)</option>
              </select>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-[#343a40] mb-2">
                Select Product
              </label>
              <select
                className="w-full p-2 border border-[#ced4da] rounded-md"
                value={selectedProduct?.id || ""}
                onChange={(e) =>
                  setSelectedProduct(
                    products.find((p) => p.id === parseInt(e.target.value))
                  )
                }
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.category} : {product.name} 
                  </option>
                ))}
              </select>
            </div>

            {/* Prediction Length */}
            <div>
              <label className="block text-sm font-medium text-[#343a40] mb-2">
                Prediction Length
              </label>
              {selectedModel === "v3" ? (
                <select
                  className="w-full p-2 border border-[#ced4da] rounded-md"
                  value={predictionLength}
                  onChange={(e) => setPredictionLength(e.target.value)}
                >
                  <option value="SMA">Simple Moving Average</option>
                  <option value="ES">Exponential Smoothing</option>
                </select>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border border-[#ced4da] rounded-md"
                  value={predictionLength}
                  onChange={(e) => setPredictionLength(e.target.value)}
                  placeholder="Enter number of periods"
                />
              )}
            </div>

            {/* Time Unit (for v2 and v3) */}
            {selectedModel !== "v1" && (
              <div>
                <label className="block text-sm font-medium text-[#343a40] mb-2">
                  Time Unit
                </label>
                <select
                  className="w-full p-2 border border-[#ced4da] rounded-md"
                  value={predictionUnit}
                  onChange={(e) => setPredictionUnit(e.target.value)}
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              className="bg-[#0077b6] text-white px-6 py-2 rounded-md hover:bg-[#00b4d8] transition-colors disabled:opacity-50"
              onClick={handlePrediction}
              disabled={loading}
            >
              {loading ? (
                <RefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                "Run Prediction"
              )}
            </button>
            <button
              className="border border-[#ced4da] px-6 py-2 rounded-md hover:bg-[#f8f9fa] transition-colors"
              onClick={resetForm}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Results Section */}
        {predictionResults && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#343a40] mb-4">
              Prediction Results
            </h2>

            <div className="bg-[#f8f9fa] p-4 rounded-lg mb-6">
              {selectedModel === "v1" && (
                <div>
                  <h3 className="text-lg font-medium text-[#343a40] mb-2">
                    Predicted Stock Quantity
                  </h3>
                  <p className="text-2xl font-bold text-[#0077b6]">
                    {Math.round(
                      predictionResults.data
                        .predicted_stock_quantity_for_period[0]
                    )}{" "}
                    units
                  </p>

                  {/* Explanation for v1 */}
                  <div className="mt-6 bg-[#f8f9fa] p-4 rounded-md shadow-sm">
                    <h4 className="text-lg font-semibold text-[#343a40] mb-2">
                      How the Prediction is Made (v1)
                    </h4>
                    <p className="text-sm text-gray-700">
                      The predicted stock quantity shown above is based on the
                      standard forecasting method that uses historical sales
                      data, applying the specified forecast duration. This
                      prediction assumes constant sales trends over the given
                      period and does not account for any special circumstances
                      such as seasonality or promotions.
                      <br />
                      <br />
                      In this case, for a product with an ID of 1 and a sale
                      price of $30, the model predicts the required stock
                      quantity for the forecast duration (4 periods), based on
                      the average demand observed in the past sales data.
                      <br />
                      <br />If ouput is null then * Model does not have sufficient data for training * 
                    </p>
                  </div>
                </div>
              )}

              {selectedModel === "v2" && (
                <div>
                  <h3 className="text-lg font-medium text-[#343a40] mb-2">
                    Predicted Stock Quantity
                  </h3>
                  <p className="text-2xl font-bold text-[#0077b6]">
                    {Math.round(
                      predictionResults.data.predicted_stock_quantity
                    )}{" "}
                    units
                  </p>

                  {/* Explanation for v2 */}
                  <div className="mt-6 bg-[#f8f9fa] p-4 rounded-md shadow-sm">
                    <h4 className="text-lg font-semibold text-[#343a40] mb-2">
                      How the Prediction is Made (v2)
                    </h4>
                    <p className="text-sm text-gray-700">
                      The predicted stock quantity shown above is calculated by
                      a more advanced method, incorporating a set prediction
                      length (e.g., 2 days) and a unit of time (e.g., days). The
                      model factors in the sales data over this period and
                      applies mathematical techniques to determine the most
                      likely stock quantity required during the given time
                      frame.
                      <br />
                      <br />
                      The model prediction assumes typical sales trends without
                      major disruptions, and it provides a smoothed estimate of
                      the stock quantity that accounts for short-term sales
                      fluctuations. In this example, for the product with ID 1,
                      the model has predicted **499.99 units** based on the
                      forecast length of 2 days.
                      <br />
                      <br />If ouput is null then * Model does not have sufficient data for training * 
                    </p>
                  </div>
                </div>
              )}

              {selectedModel === "v3" && (
                <div>
                  <h3 className="text-lg font-medium text-[#343a40] mb-2">
                    Predictions by Period
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    The table below shows the predicted smoothed stock values
                    for each period based on the chosen prediction model (SMA or
                    Exponential Smoothing). The "Period" column corresponds to
                    the specific month or week, and the "Smoothed Value"
                    represents the predicted stock quantity for that period
                    after applying the chosen method.
                  </p>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[500px] border-collapse">
                      <thead>
                        <tr>
                          <th className="border px-4 py-2">Period</th>
                          <th className="border px-4 py-2">Smoothed Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictionResults && predictionResults.data.map((item, index) => (
                          <tr key={index}>
                            <td className="border px-4 py-2">{item.period}</td>
                            <td className="border px-4 py-2">
                              {item.smoothedValue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Example Explanation */}
                  <div className="mt-6 bg-[#f8f9fa] p-4 rounded-md shadow-sm">
                    <h4 className="text-lg font-semibold text-[#343a40] mb-2">
                      Example
                    </h4>
                    <p className="text-sm text-gray-700">
                      For example, let's say the model predicted a smoothed
                      value of **58.33 units** for the period **2025-01**. This
                      means that based on the chosen method (either SMA or
                      Exponential Smoothing), we expect the stock quantity for
                      January 2025 to be **58.33 units**.
                      <br />
                      <br />
                      - If **Simple Moving Average (SMA)** was used, this value
                      reflects the average stock quantity over the last few
                      periods (e.g., last 3 months), smoothing any fluctuations
                      in demand.
                      <br />- If **Exponential Smoothing (ES)** was used, this
                      value takes into account more recent sales data, making
                      the prediction more responsive to recent trends in stock
                      movement.
                      <br />- If ouput is null then * Model does not have sufficient data for training * 
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Optional: Display the results as a LineChart (future) */}
            {/* <LineChart> <XAxis> <YAxis> ... </LineChart> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockPrediction;
