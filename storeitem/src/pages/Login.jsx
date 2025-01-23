import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // API endpoint based on action (Login or Signup)
    const endpoint = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/createuser";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // If successful, store token and navigate
      if (data.success) {
        localStorage.setItem("authToken", data.authToken);
        navigate("/"); // Redirect to the homepage or dashboard
      } else {
        setErrorMessage(data.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error:", error.message);
      setErrorMessage(error.message || "Something went wrong");
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
    });
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-[#343a40] mb-8">
            {isLogin ? "Admin Login" : "Admin Sign Up"}
          </h2>

          {errorMessage && (
            <div className="bg-red-100 text-red-600 p-4 mb-4 rounded-md">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#343a40]">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-3 rounded-md border border-[#ced4da] focus:ring-2 focus:ring-[#0077b6] focus:border-transparent outline-none transition duration-200"
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#343a40]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-3 rounded-md border border-[#ced4da] focus:ring-2 focus:ring-[#0077b6] focus:border-transparent outline-none transition duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#343a40]">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-3 rounded-md border border-[#ced4da] focus:ring-2 focus:ring-[#0077b6] focus:border-transparent outline-none transition duration-200"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0077b6] text-white py-3 px-4 rounded-md hover:bg-[#00b4d8] transition duration-200 font-medium"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#6c757d]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleForm}
                className="ml-2 text-[#0077b6] hover:text-[#00b4d8] font-medium"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
