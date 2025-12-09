import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUsers, deleteUser } from "../../services/userService";
import { useNavigate } from "react-router-dom";

import {
  Search,
  UserPlus,
  AlertCircle,
  Users,
  Mail,
  Shield,
  Trash2,
} from "lucide-react";
import { useTheme } from "../../contexts/themeContext";

const ManageUsers = () => {
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers();
        setUsers(response);
      } catch (error) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      const response = await deleteUser(userId);

      if (response.status === "success") {
        // Remove the user from state
        setUsers(users.filter((user) => user.id !== userId));

        // Show success notification
        setNotification({
          message: response.message || "User has been deleted successfully",
          type: "success",
        });
      } else {
        setNotification({
          message: response.message || "Failed to delete user",
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        message: "An error occurred while deleting the user",
        type: "error",
      });
    } finally {
      setConfirmDelete(null);

      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingSpinner = () => (
    <motion.div
      className="flex justify-center items-center h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`h-16 w-16 border-4 ${
          isDarkMode
            ? "border-gray-700 border-t-blue-400"
            : "border-blue-200 border-t-blue-600"
        } rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );

  if (loading) return <LoadingSpinner />;

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1
                className={`text-3xl sm:text-4xl font-bold tracking-tight ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                User Management 👥
              </h1>
              <p
                className={`mt-2 text-base sm:text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                View and manage all system users efficiently.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/add-user")}
              className={`px-4 py-3 rounded-xl font-medium ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600"
              } text-white hover:shadow-lg w-full sm:w-auto`}
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              Add New User
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 ${
                isDarkMode
                  ? "bg-red-900/50 border-red-700"
                  : "bg-red-50 border-red-500"
              } border-l-4 rounded-lg flex items-center`}
            >
              <AlertCircle
                className={`w-5 h-5 ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                } mr-2`}
              />
              <span className={isDarkMode ? "text-red-300" : "text-red-700"}>
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <motion.input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-400"
                  : "bg-white border-gray-200 focus:ring-blue-500"
              } border focus:outline-none focus:ring-2`}
              whileFocus={{ scale: 1.01 }}
            />
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-xl font-semibold truncate ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.full_name}
                  </h2>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={`px-3 py-1 text-sm rounded-full ${
                      isDarkMode
                        ? "bg-blue-900/50 text-blue-300"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </motion.span>
                </div>

                <div className="space-y-3 text-sm">
                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>{user.email}</span>
                  </div>

                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>Access Level: {user.role}</span>
                  </div>

                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    <Users className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>User ID: {user.id}</span>
                  </div>
                </div>

                <div
                  className={`mt-6 pt-4 border-t ${
                    isDarkMode ? "border-gray-700" : "border-gray-100"
                  }`}
                >
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                      className={`flex-1 px-4 py-3 rounded-xl text-center font-medium ${
                        isDarkMode
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600"
                      } text-white hover:shadow-lg`}
                    >
                      Edit User
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setConfirmDelete(user.id)}
                      className={`px-4 py-3 rounded-xl ${
                        isDarkMode
                          ? "bg-red-900 hover:bg-red-800"
                          : "bg-red-600 hover:bg-red-700"
                      } text-white hover:shadow-lg`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredUsers.length === 0 && (
            <motion.div
              variants={itemVariants}
              className={`col-span-full flex flex-col items-center justify-center py-12 px-4 rounded-xl shadow-sm border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Users
                  className={`w-16 h-16 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  } mb-4`}
                />
              </motion.div>
              <h3
                className={`text-xl font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                No Users Found
              </h3>
              <p
                className={`mt-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                } text-center`}
              >
                {searchTerm
                  ? "No users match your search criteria. Try adjusting your search terms."
                  : "No users have been added to the system yet."}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/admin/add-user")}
                className={`mt-6 px-4 py-3 rounded-xl font-medium ${
                  isDarkMode
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600"
                } text-white hover:shadow-lg`}
              >
                <UserPlus className="w-5 h-5 inline mr-2" />
                Add New User
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Notification component */}
        <AnimatePresence>
          {notification.message && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${
                notification.type === "success"
                  ? isDarkMode
                    ? "bg-green-900 text-green-100"
                    : "bg-green-50 text-green-700"
                  : isDarkMode
                  ? "bg-red-900 text-red-100"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Dialog */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`rounded-xl shadow-xl p-6 max-w-md w-full mx-4 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3
                  className={`text-xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Confirm Deletion
                </h3>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  Are you sure you want to delete this user? This action cannot
                  be undone.
                </p>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className={`px-4 py-2 rounded-lg ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(confirmDelete)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ManageUsers;
