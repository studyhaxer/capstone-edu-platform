import { useState } from "react";
import axiosClient from "../api/axiosClient";

function getErrorMessage(err, fallback) {
  if (!err.response) {
    return "Network error. Please check your connection and try again.";
  }
  const status = err.response.status;
  if (status === 400 || status === 422) {
    return err.response?.data?.detail || "Please check your details — email may already be in use.";
  }
  if (status === 401 || status === 403) {
    return err.response?.data?.detail || "You're not authorized to do that.";
  }
  if (status >= 500) {
    return "Something went wrong on our end. Please try again in a moment.";
  }
  return err.response?.data?.detail || fallback;
}

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await axiosClient.post("/auth/register", formData);
      setSuccessMsg(`Account created for ${res.data.name || formData.name}! You can now log in.`);
      setFormData({ name: "", email: "", password: "", role: "student" });
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-md rounded-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
          Create an Account
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Join Umar Science Academy's learning platform
        </p>

        {successMsg && (
          <div role="status" aria-live="polite" className="bg-green-100 text-green-700 border border-green-300 text-sm rounded-md px-4 py-2 mb-4 break-words">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div role="alert" aria-live="polite" className="bg-red-100 text-red-700 border border-red-300 text-sm rounded-md px-4 py-2 mb-4 break-words">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
              disabled={loading}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Hafiz Atta"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-medium hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;