import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Users,
  FileText,
  Search,
  BarChart2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { getUsers, updatePermissions } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/themeContext";

const AdminDashboard = () => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    permissionedUsers: 0,
    unpermissionedUsers: 0,
    recentUsers: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch users using the getUsers method from API
      const users = await getUsers();

      // Count users by status
      const totalUsers = users.length;
      const permissionedUsers = users.filter(
        (user) => user.status === "Permissioned"
      ).length;
      const unpermissionedUsers = users.filter(
        (user) => user.status === "Unpermissioned"
      ).length;

      // Sort recent users
      const recentUsers = users
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map((user) => ({
          user: user.full_name,
          role: user.role,
          status: user.status,
          time: new Date(user.created_at).toLocaleString(),
          id: user.id,
        }));

      setDashboardData({
        totalUsers,
        permissionedUsers,
        unpermissionedUsers,
        recentUsers,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter users based on search term
  const filteredUsers = dashboardData.recentUsers.filter(
    (user) =>
      user.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCards = [
    {
      label: "Total Users",
      value: dashboardData.totalUsers.toLocaleString(),
      icon: (
        <Users
          className={`${isDarkMode ? "text-blue-300" : "text-blue-500"}`}
        />
      ),
      colorClass: isDarkMode
        ? "bg-blue-900/30 border-blue-900/50"
        : "bg-blue-100 border-blue-200",
      textColorClass: isDarkMode ? "text-blue-300" : "text-blue-700",
    },
    {
      label: "Permissioned Users",
      value: dashboardData.permissionedUsers.toString(),
      icon: (
        <FileText
          className={`${isDarkMode ? "text-green-300" : "text-green-500"}`}
        />
      ),
      colorClass: isDarkMode
        ? "bg-green-900/30 border-green-900/50"
        : "bg-green-100 border-green-200",
      textColorClass: isDarkMode ? "text-green-300" : "text-green-700",
    },
    {
      label: "Unpermissioned Users",
      value: dashboardData.unpermissionedUsers.toString(),
      icon: (
        <FileText
          className={`${isDarkMode ? "text-red-300" : "text-red-500"}`}
        />
      ),
      colorClass: isDarkMode
        ? "bg-red-900/30 border-red-900/50"
        : "bg-red-100 border-red-200",
      textColorClass: isDarkMode ? "text-red-300" : "text-red-700",
    },
    {
      label: "User Permissions",
      value: `${(
        (dashboardData.permissionedUsers / dashboardData.totalUsers) *
        100
      ).toFixed(1)}%`,
      icon: (
        <BarChart2
          className={`${isDarkMode ? "text-orange-300" : "text-orange-500"}`}
        />
      ),
      colorClass: isDarkMode
        ? "bg-orange-900/30 border-orange-900/50"
        : "bg-orange-100 border-orange-200",
      textColorClass: isDarkMode ? "text-orange-300" : "text-orange-700",
    },
  ];

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
        {/* Page Header */}
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
                Admin Dashboard 📊
              </h1>
              <p
                className={`mt-2 text-base sm:text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Comprehensive overview of system users and metrics
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Handling */}
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

        {/* Search Bar */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <motion.input
              type="text"
              placeholder="Search users..."
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

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {stat.label}
                    </h3>
                    <p
                      className={`text-3xl font-semibold mt-2 ${stat.textColorClass}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6"
        >
          {[
            {
              label: "Manage Users",
              icon: Users,
              onClick: () => navigate("/admin/manage-users"),
              colorClass: isDarkMode
                ? "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200",
            },
            {
              label: "Add Users",
              icon: FileText,
              onClick: () => navigate("/admin/add-user"),
              colorClass: isDarkMode
                ? "bg-green-900/30 text-green-300 hover:bg-green-900/50"
                : "bg-green-100 text-green-700 hover:bg-green-200",
            },
          ].map((action) => (
            <motion.button
              key={action.label}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className={`p-4 rounded-xl flex items-center justify-center space-x-2 ${action.colorClass} transition-colors`}
            >
              <action.icon className="h-5 w-5" />
              <span>{action.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Recent Users */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`rounded-xl p-6 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } shadow-sm border`}
        >
          <h2
            className={`text-lg font-medium mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Recent Users
          </h2>
          <motion.div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`flex items-center justify-between pb-3 ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  } border-b`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {user.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user.user}
                      </p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {user.role} - {user.status}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {user.time}
                  </span>
                </motion.div>
              ))
            ) : (
              <motion.div
                variants={itemVariants}
                className={`text-center p-6 ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                No users found
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
