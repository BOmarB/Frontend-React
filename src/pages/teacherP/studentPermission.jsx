import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Users, Search, AlertCircle } from "lucide-react";
import {
  getUsers,
  getAllGroups,
  updatePermissions,
} from "../../services/userService";
import styled from "@emotion/styled";
import { useTheme } from "../../contexts/themeContext";

const SearchInput = styled(motion.input)`
  &:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
`;

const ManagePermissions = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("unpermissioned");
  const [notification, setNotification] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
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
    fetchData();
  }, [viewMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, groupsResponse] = await Promise.all([
        getUsers(),
        getAllGroups(),
      ]);

      const filteredStudents = usersResponse.filter(
        (user) =>
          user.role === "student" &&
          user.status ===
            (viewMode === "unpermissioned" ? "Unpermissioned" : "Permissioned")
      );

      setStudents(filteredStudents);
      setGroups(groupsResponse.groups);
    } catch (error) {
      console.error("Error fetching data:", error);
      setNotification({
        message: "Failed to load data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handlePermissionUpdate = async () => {
    if (
      (!selectedGroup && viewMode === "unpermissioned") ||
      selectedStudents.length === 0
    )
      return;

    setLoading(true);
    try {
      const response = await updatePermissions({
        studentIds: selectedStudents,
        groupId: viewMode === "unpermissioned" ? selectedGroup : null,
        action: viewMode === "unpermissioned" ? "permit" : "unpermit",
      });

      if (response.success) {
        await fetchData();
        setSelectedStudents([]);
        setSelectedGroup("");
        setNotification({
          message: `Successfully ${
            viewMode === "unpermissioned" ? "granted" : "removed"
          } permissions`,
          type: "success",
        });
      } else {
        setNotification({
          message: "Failed to update permissions",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Failed to update permissions:", error);
      setNotification({
        message: "Error updating permissions",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingSpinner = () => (
    <motion.div
      className="flex justify-center items-center h-64"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`h-16 w-16 border-4 ${
          isDarkMode
            ? "border-blue-700 border-t-blue-300"
            : "border-blue-200 border-t-blue-600"
        } rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );

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
          <div className="flex justify-between items-center">
            <div>
              <h1
                className={`text-4xl font-bold tracking-tight ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Manage Student Permissions
              </h1>
              <p
                className={`mt-2 text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Control access and permissions for your students.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={`rounded-xl shadow-md p-6 mb-8 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  } w-5 h-5`}
                />
                <SearchInput
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                  } focus:outline-none`}
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </div>

            <select
              value={viewMode}
              onChange={(e) => {
                setViewMode(e.target.value);
                setSelectedStudents([]);
                setSelectedGroup("");
              }}
              className={`px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <option value="unpermissioned">Unpermissioned Students</option>
              <option value="permissioned">Permissioned Students</option>
            </select>
            {viewMode === "unpermissioned" && (
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className={`px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}
            <motion.button
              onClick={handlePermissionUpdate}
              disabled={
                loading ||
                (viewMode === "unpermissioned" && !selectedGroup) ||
                selectedStudents.length === 0
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-2 rounded-xl font-medium text-white ${
                loading
                  ? "bg-gray-400"
                  : viewMode === "unpermissioned"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                  : "bg-gradient-to-r from-red-600 to-pink-600"
              } disabled:opacity-50`}
            >
              {loading
                ? "Processing..."
                : viewMode === "unpermissioned"
                ? "Grant Permission"
                : "Remove Permission"}
            </motion.button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="overflow-x-auto"
            >
              <table className="w-full">
                <thead
                  className={`rounded-t-xl ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedStudents.length === filteredStudents.length
                        }
                        onChange={() => {
                          if (
                            selectedStudents.length === filteredStudents.length
                          ) {
                            setSelectedStudents([]);
                          } else {
                            setSelectedStudents(
                              filteredStudents.map((s) => s.id)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Name
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Email
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Status
                    </th>
                    {viewMode === "permissioned" && (
                      <th
                        className={`px-6 py-3 text-left text-sm font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Group
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDarkMode ? "divide-gray-700" : "divide-gray-200"
                  }`}
                >
                  {filteredStudents.map((student) => (
                    <motion.tr
                      key={student.id}
                      variants={itemVariants}
                      whileHover={{
                        backgroundColor: isDarkMode
                          ? "rgba(59, 130, 246, 0.1)"
                          : "rgba(59, 130, 246, 0.05)",
                      }}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleSelectStudent(student.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td
                        className={`px-6 py-4 font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {student.full_name}
                      </td>
                      <td
                        className={`px-6 py-4 ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {student.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            student.status === "Permissioned"
                              ? isDarkMode
                                ? "bg-green-900 text-green-200"
                                : "bg-green-100 text-green-800"
                              : isDarkMode
                              ? "bg-yellow-900 text-yellow-200"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      {viewMode === "permissioned" && (
                        <td
                          className={`px-6 py-4 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {groups.find((g) => g.id === student.group_id)
                            ?.name || "-"}
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <motion.div
                  variants={itemVariants}
                  className="text-center py-12"
                >
                  <Users
                    className={`mx-auto h-12 w-12 ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <h3
                    className={`mt-2 text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    No students found
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "No students available in this category"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                notification.type === "success"
                  ? isDarkMode
                    ? "bg-green-900 border-l-4 border-green-500 text-green-200"
                    : "bg-green-50 border-l-4 border-green-500 text-green-700"
                  : isDarkMode
                  ? "bg-red-900 border-l-4 border-red-500 text-red-200"
                  : "bg-red-50 border-l-4 border-red-500 text-red-700"
              }`}
            >
              <div className="flex items-center">
                {notification.type === "success" ? (
                  <Check className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                {notification.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ManagePermissions;
