import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addUser } from "../services/userService";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Users,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/themeContext";

const AddUsers = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "teacher",
    cin: "",
  });

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      // setTimeout(() => {
      //   navigate("/admin/manage-users");
      // }, 2000);
    } catch (error) {
      setMessage("Failed to add user. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      } py-8`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className={`flex items-center self-start ${
              isDarkMode
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-3 " />
            Back to Users
          </motion.button>
          <div className="mt-3 flex items-center gap-3">
            <h1
              className={`  text-4xl font-bold tracking-tight ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Add New User 👤
            </h1>
          </div>
          <p
            className={`mt-2 text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Create a new user account with specific role and permissions
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`rounded-xl shadow-sm p-8 border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
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
                      ? "bg-green-900/50 border-l-4 border-green-700"
                      : "bg-green-50 border-l-4 border-green-500"
                    : isDarkMode
                    ? "bg-red-900/50 border-l-4 border-red-700"
                    : "bg-red-50 border-l-4 border-red-500"
                }`}
              >
                {status === "success" ? (
                  <CheckCircle
                    className={`h-5 w-5 ${
                      isDarkMode ? "text-green-400" : "text-green-500"
                    }`}
                  />
                ) : (
                  <AlertCircle
                    className={`h-5 w-5 ${
                      isDarkMode ? "text-red-400" : "text-red-500"
                    }`}
                  />
                )}
                <p
                  className={`mt-3 ${
                    status === "success"
                      ? isDarkMode
                        ? "text-green-300"
                        : "text-green-700"
                      : isDarkMode
                      ? "text-red-300"
                      : "text-red-700"
                  }`}
                >
                  {message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Full Name
                </label>
                <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User
                      className={`h-5 w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                    } `}
                    placeholder="Enter full name"
                    required
                  />
                </motion.div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email
                </label>
                <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail
                      className={`h-5 w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                    } `}
                    placeholder="Enter email address"
                    required
                  />
                </motion.div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Password
                </label>
                <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className={`h-5 w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                    } `}
                    placeholder="Enter password"
                    required
                  />
                </motion.div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Role
                </label>
                <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users
                      className={`h-5 w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                    } `}
                    required
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                    <option value="student">Student</option>
                  </select>
                </motion.div>
                {formData.role === "student" && (
                  <div className="mt-4">
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Cin
                    </label>
                    <motion.div
                      className="relative"
                      whileFocus={{ scale: 1.01 }}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield
                          className={`h-5 w-5 ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        name="cin"
                        value={formData.cin}
                        onChange={handleChange}
                        className={` w-full pl-10 pr-4 py-2 rounded-xl ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                        } `}
                        placeholder="Enter cin"
                        required
                      />
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <motion.button
                type="button"
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600"
                    : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600"
                } hover:shadow-lg`}
              >
                {loading ? "Adding User..." : "Add User"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AddUsers;
