from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore
import pandas as pd # type: ignore
from statsmodels.tsa.statespace.sarimax import SARIMAX # type: ignore
from sklearn.model_selection import train_test_split # type: ignore
from sklearn.ensemble import RandomForestRegressor # type: ignore
import pickle # type: ignore
from sklearn.preprocessing import StandardScaler # type: ignore

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Sample route for testing
@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/train-stock-model", methods=["POST"])
def train_stock_model():
    try:
        sales_data = request.json['salesData']
        df = pd.DataFrame(sales_data)

        # Convert saleDate to datetime
        df['saleDate'] = pd.to_datetime(df['saleDate'])

        # Create time-based features (day of year, month, week)
        df['day_of_year'] = df['saleDate'].dt.day_of_year
        df['month'] = df['saleDate'].dt.month
        df['week'] = df['saleDate'].dt.isocalendar().week
        
        # Feature engineering (including product-related features like price, category)
        X = df[['productId', 'salePrice', 'month', 'week', 'day_of_year']]  # Features
        y = df['quantitySold']  # Target variable: quantity sold
        
        # Normalize data
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Train-test split (you can adjust the size based on your data)
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

        # Create and train a Random Forest model (can be replaced with other models)
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # Save the trained model and scaler
        with open('stock_prediction_model.pkl', 'wb') as model_file:
            pickle.dump(model, model_file)
        with open('scaler.pkl', 'wb') as scaler_file:
            pickle.dump(scaler, scaler_file)

        return jsonify({"message": "Stock model trained successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict-stock", methods=["POST"])
def predict_stock():
    try:
        # Get the request data
        data = request.json
        forecast_duration = data.get('forecast_duration', 6)  # Default to 6 months if not provided
        
        # Prepare the data
        df = pd.DataFrame([data])

        # Convert saleDate to datetime and create time-based features
        df['saleDate'] = pd.to_datetime(df['saleDate'])
        df['day_of_year'] = df['saleDate'].dt.day_of_year
        df['month'] = df['saleDate'].dt.month
        df['week'] = df['saleDate'].dt.isocalendar().week

        # Prepare features for prediction
        X_new = df[['productId', 'salePrice', 'month', 'week', 'day_of_year']]

        # Load the trained model and scaler
        with open('stock_prediction_model.pkl', 'rb') as model_file:
            model = pickle.load(model_file)
        with open('scaler.pkl', 'rb') as scaler_file:
            scaler = pickle.load(scaler_file)

        # Scale the features
        X_new_scaled = scaler.transform(X_new)

        # Predict the stock quantity required for the specified forecast duration
        predicted_quantity = model.predict(X_new_scaled)

        # Predict for the requested period (forecast_duration months)
        predicted_stock_needed = predicted_quantity * forecast_duration  # Multiply by the number of months

        return jsonify({"predicted_stock_quantity_for_period": predicted_stock_needed.tolist()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Train the model to predict stock requirements (Second Model)
@app.route("/train-stock-model-v2", methods=["POST"])
def train_stock_model_v2():
    try:
        # Receive sales data
        sales_data = request.json['salesData']
        df = pd.DataFrame(sales_data)

        # Prepare the data
        df['saleDate'] = pd.to_datetime(df['saleDate'])
        df = df.groupby(['productId', pd.Grouper(key='saleDate', freq='D')]).agg({'quantitySold': 'sum'}).reset_index()
        df.rename(columns={'saleDate': 'ds', 'quantitySold': 'y'}, inplace=True)

        # Fit SARIMA model for each product
        product_ids = df['productId'].unique()
        models = {}
        
        for product_id in product_ids:
            product_data = df[df['productId'] == product_id]
            model = SARIMAX(product_data['y'], order=(1, 1, 1), seasonal_order=(1, 1, 1, 7))  # SARIMA model with weekly seasonality
            model_fitted = model.fit(disp=False)
            models[product_id] = model_fitted

        # Save the trained models
        with open('sarima_stock_models.pkl', 'wb') as file:
            pickle.dump(models, file)

        return jsonify({"message": "Stock model v2 trained successfully using SARIMA"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Predict stock requirements for a specified period (Second Model)
@app.route("/predict-stock-v2", methods=["POST"])
def predict_stock_v2():
    try:
        # Get the input data
        data = request.json
        product_id = data['productId']
        prediction_length = data['predictionLength']  # e.g., 7 days (1 week), 30 days (1 month)

        # Load the trained models
        with open('sarima_stock_models.pkl', 'rb') as file:
            models = pickle.load(file)

        # Get the model for the requested product
        model = models.get(product_id)
        if not model:
            return jsonify({"error": "Model for the specified productId not found"}), 404

        # Make predictions for the required length
        forecast = model.get_forecast(steps=prediction_length)
        predicted_values = forecast.predicted_mean

        # Return the predicted stock requirement for the requested period
        predicted_stock = predicted_values.sum()  # Total predicted stock required over the period

        return jsonify({"predicted_stock_quantity": predicted_stock})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=8000)
