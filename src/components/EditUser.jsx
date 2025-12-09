import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Key,
  Shield,
  Users,
  Clock,
  Phone,
  MapPin,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getUserById, updateUser } from "../services/userService";
import { useTheme } from "../contexts/themeContext";

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userDetails, setUserDetails] = useState({
    id: "",
    email: "",
    full_name: "",
    role: "",
    status: "",
    phone: "",
    address: "",
    bio: "",
    date_of_birth: "",
    gender: "",
    group_id: "",
  });

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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(userId);

        // Format the date to YYYY-MM-DD for input[type="date"]
        if (userData.date_of_birth) {
          const date = new Date(userData.date_of_birth);
          userData.date_of_birth = date.toISOString().split("T")[0];
        }

        setUserDetails(userData);
        setError("");
      } catch (err) {
        setError("Failed to load user details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear any previous success or error messages when user makes changes
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUser(userId, userDetails);
      setSuccess("User updated successfully!");
      setError("");

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError("Failed to update user. Please try again.");
      setSuccess("");
      console.error(err);

      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

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
      } py-6`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button and header section - better spacing */}
        <div className="flex flex-col space-y-3 mb-5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin/manage-users")}
            className={`flex items-center self-start ${
              isDarkMode
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            Back to Users
          </motion.button>

          <div className="flex items-baseline">
            <h1
              className={`text-3xl font-bold tracking-tight mr-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Edit User:
            </h1>
            <span
              className={`text-xl ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {userDetails.full_name}
            </span>
          </div>
        </div>

        {/* Success and Error messages - better spacing */}
        <div className="space-y-3 mb-6">
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: success ? 1 : 0,
              height: success ? "auto" : 0,
            }}
            className={
              success
                ? `p-4 ${
                    isDarkMode
                      ? "bg-green-900/50 border-green-700"
                      : "bg-green-50 border-green-500"
                  } border-l-4 rounded-lg flex items-center`
                : "hidden"
            }
          >
            {success && (
              <>
                <CheckCircle
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-green-400" : "text-green-500"
                  } mr-3`}
                />
                <span
                  className={isDarkMode ? "text-green-300" : "text-green-700"}
                >
                  {success}
                </span>
              </>
            )}
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: error ? 1 : 0,
              height: error ? "auto" : 0,
            }}
            className={
              error
                ? `p-4 ${
                    isDarkMode
                      ? "bg-red-900/50 border-red-700"
                      : "bg-red-50 border-red-500"
                  } border-l-4 rounded-lg flex items-center`
                : "hidden"
            }
          >
            {error && (
              <>
                <AlertCircle
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-red-400" : "text-red-500"
                  } mr-3`}
                />
                <span className={isDarkMode ? "text-red-300" : "text-red-700"}>
                  {error}
                </span>
              </>
            )}
          </motion.div>
        </div>

        {/* Form - with better spacing */}
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className={`rounded-xl shadow-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } overflow-hidden`}
        >
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Full Name
                </label>
                <div className="relative">
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
                    value={userDetails.full_name}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
              } `}
                  />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email
                </label>
                <div className="relative">
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
                    value={userDetails.email}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                    } `}
                  />
                </div>
              </motion.div>

              {/* Role */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Shield
                      className={`h-5 w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <select
                    name="role"
                    value={userDetails.role}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                    } `}
                  >
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </motion.div>

              {/* Status */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Status
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock
                      className={`h-5 w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <select
                    name="status"
                    value={userDetails.status}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                    } `}
                  >
                    <option value="">Select Status</option>
                    <option value="Permissioned">Permissioned</option>
                    <option value="Unpermissioned">Unpermissioned</option>
                  </select>
                </div>
              </motion.div>

              {/* Group ID */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Group ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users
                      className={`h-5 w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type="number"
                    name="group_id"
                    value={userDetails.group_id || ""}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                    } `}
                  />
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone
                      className={`h-5 w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={userDetails.phone || ""}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                    } `}
                  />
                </div>
              </motion.div>

              {/* Date of Birth */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar
                      className={`h-5 w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={userDetails.date_of_birth || ""}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                    } `}
                  />
                </div>
              </motion.div>

              {/* Gender */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Gender
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User
                      className={`h-5 w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <select
                    name="gender"
                    value={userDetails.gender || ""}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                    } `}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </motion.div>
            </div>

            {/* Address */}
            <motion.div variants={itemVariants} className="mt-6">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Address
              </label>
              <div className="relative">
                <div className="absolute top-3 left-4 flex items-start pointer-events-none">
                  <MapPin
                    className={`h-5 w-5 ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <textarea
                  name="address"
                  value={userDetails.address || ""}
                  onChange={handleChange}
                  rows="2"
                  className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                  } `}
                ></textarea>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div variants={itemVariants} className="mt-6">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Bio
              </label>
              <div className="relative">
                <div className="absolute top-3 left-4 flex items-start pointer-events-none">
                  <FileText
                    className={`h-5 w-5 ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <textarea
                  name="bio"
                  value={userDetails.bio || ""}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                  } `}
                ></textarea>
              </div>
            </motion.div>

            {/* Password Reset Section */}
            <motion.div variants={itemVariants} className="mt-8 border-t pt-6">
              <div className="flex items-center">
                <h3
                  className={`text-base font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Password Reset
                </h3>
                <span
                  className={`ml-2 text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  (Optional)
                </span>
              </div>
              <p
                className={`text-xs mt-2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Leave blank to keep the current password
              </p>

              <div className="relative mt-3">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key
                    className={`h-5 w-5 ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter new password"
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 rounded-xl ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 focus:ring-blue-500 border focus:outline-none focus:ring-2"
                  } `}
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className={`px-6 py-3 rounded-lg font-medium ${
                  isDarkMode
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600"
                } text-white hover:shadow-lg flex items-center ${
                  saving ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {saving ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-3"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-3" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default EditUser;
