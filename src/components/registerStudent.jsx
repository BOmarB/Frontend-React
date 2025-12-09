import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { addUser } from "../services/userService";
import { useTheme } from "../contexts/themeContext";

const RegisterStudent = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    cin: "",
    role: "student",
  });

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await addUser(formData);
      setMessage(response.message);
      setStatus("success");
      setTimeout(() => {
        navigate("/waiting-approval");
      }, 1000);
    } catch (error) {
      setMessage("Registration failed. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen ${
        isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
      <div className="w-full max-w-4xl m-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1
            className={`text-4xl font-bold tracking-tight ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Student Registration 👤
          </h1>
          <p
            className={`mt-2 text-lg ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Create your student account to get started
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`rounded-xl shadow-sm p-8 transition-colors duration-200 ${
            isDarkMode
              ? "bg-gray-800/50 backdrop-blur-xl backdrop-saturate-150 border border-gray-700/50"
              : "bg-white/80 backdrop-blur-xl backdrop-saturate-150 border border-gray-100"
          }`}
        >
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                  status === "success"
                    ? isDarkMode
                      ? "bg-green-900/20 border-l-4 border-green-500"
                      : "bg-green-50 border-l-4 border-green-500"
                    : isDarkMode
                    ? "bg-red-900/20 border-l-4 border-red-500"
                    : "bg-red-50 border-l-4 border-red-500"
                }`}
              >
                {status === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <p
                  className={
                    status === "success"
                      ? isDarkMode
                        ? "text-green-400"
                        : "text-green-700"
                      : isDarkMode
                      ? "text-red-400"
                      : "text-red-700"
                  }
                >
                  {message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                {
                  label: "Full Name",
                  name: "full_name",
                  type: "text",
                  icon: User,
                  placeholder: "Enter full name",
                },
                {
                  label: "Email",
                  name: "email",
                  type: "email",
                  icon: Mail,
                  placeholder: "Enter email address",
                },
                {
                  label: "Password",
                  name: "password",
                  type: "password",
                  icon: Lock,
                  placeholder: "Enter password",
                },
                {
                  label: "CIN",
                  name: "cin",
                  type: "text",
                  icon: Lock,
                  placeholder: "Enter your CIN",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {field.label}
                  </label>
                  <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <field.icon
                        className={`h-5 w-5 ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange} 
                      className={`block w-full pl-10 pr-3 py-2 rounded-xl 
                      transition-colors duration-200
                      focus:ring-2 focus:ring-blue-500    ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-offset-gray-800"
                          : "bg-white border-gray-200 text-gray-900 border placeholder-gray-400  focus:ring-offset-gray-100 focus:ring-offset-2  focus:ring-offset-blue-500"
                      }`}
                      placeholder={field.placeholder}
                      required
                    />
                  </motion.div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 text-white rounded-xl
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-500 focus:ring-offset-gray-800"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg"
                }`}
              >
                {loading ? "Registering..." : "Register"}
              </motion.button>
            </div>

            <div
              className={`text-sm text-center ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-500 hover:text-blue-400 transition-colors duration-200 text-decoration-none"
              >
                Sign in
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterStudent;
