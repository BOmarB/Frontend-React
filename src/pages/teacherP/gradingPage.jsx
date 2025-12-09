import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Edit2,
  Save,
  X,
  Users,
  Book,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
} from "lucide-react";
import {
  getAllGroups,
  getAllModules,
  getAttemptDetails,
  updateAttemptScore,
} from "../../services/userService";
import { useTheme } from "../../contexts/themeContext";

const GradeManagement = () => {
  const [attempts, setAttempts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedModule, setSelectedModule] = useState("all");
  const [editingScore, setEditingScore] = useState(null);
  const [notification, setNotification] = useState(null);
  const [tempScore, setTempScore] = useState("");
  const [gradingStatus, setGradingStatus] = useState("all"); // New: grading status filter
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    filters: false,
    grades: false,
  });
  const { isDarkMode } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const groupsResponse = await getAllGroups();
      const modulesResponse = await getAllModules();

      if (groupsResponse.success) {
        setGroups(groupsResponse.groups);
      }
      if (modulesResponse.success) {
        setModules(modulesResponse.modules);
      }

      const attemptsResponse = await getAttemptDetails();
      if (attemptsResponse.success) {
        setAttempts(attemptsResponse.attempts);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setNotification({
        message: "Error loading data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // New: Backup functionality
  const handleBackup = () => {
    const backupData = {
      attempts,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grade-backup-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setNotification({
      message: "Backup created successfully!",
      type: "success",
    });
  };

  // New: Restore functionality
  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          setAttempts(backupData.attempts);
          setNotification({
            message: "Data restored successfully!",
            type: "success",
          });
        } catch (error) {
          setNotification({
            message: "Error restoring backup file",
            type: "error",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUpdateScore = async (attemptId) => {
    try {
      const score = parseFloat(tempScore);
      if (isNaN(score) || score < 0 || score > 100) {
        setNotification({
          message: "Please enter a valid score between 0 and 100",
          type: "error",
        });
        return;
      }

      const response = await updateAttemptScore(attemptId, score);
      if (response.success) {
        setAttempts(
          attempts.map((attempt) =>
            attempt.id === attemptId ? { ...attempt, score: score } : attempt
          )
        );
        setNotification({
          message: "Score updated successfully!",
          type: "success",
        });
        setEditingScore(null);
      }
    } catch (error) {
      console.error("Error updating score:", error);
      setNotification({
        message: "Error updating score",
        type: "error",
      });
    }
  };

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch =
      attempt.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.exam_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup =
      selectedGroup === "all" || attempt.group_id === parseInt(selectedGroup);
    const matchesModule =
      selectedModule === "all" ||
      attempt.module_id === parseInt(selectedModule);
    // New: Filter by grading status
    const matchesStatus =
      gradingStatus === "all" ||
      (gradingStatus === "graded" && attempt.score !== null) ||
      (gradingStatus === "ungraded" && attempt.score === null);

    return matchesSearch && matchesGroup && matchesModule && matchesStatus;
  });

  const toggleSection = (section) => {
    setSectionsCollapsed({
      ...sectionsCollapsed,
      [section]: !sectionsCollapsed[section],
    });
  };

  const LoadingSpinner = () => (
    <motion.div
      className="flex justify-center items-center h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
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
      className={`min-h-screen py-4 sm:py-8 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Responsive Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Grade Management
              </h1>
              <p
                className={`mt-1 sm:mt-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                View and manage student grades
              </p>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={handleBackup}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Backup</span>
              </button>
              <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm sm:text-base">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Restore</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div
          className={`mb-4 sm:mb-6 rounded-xl shadow-sm p-3 sm:p-4 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <button
            onClick={() => toggleSection("filters")}
            className="w-full flex justify-between items-center mb-3 sm:mb-4"
          >
            <h2
              className={`text-lg sm:text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Filters
            </h2>
            {sectionsCollapsed.filters ? (
              <ChevronDown className={isDarkMode ? "text-white" : ""} />
            ) : (
              <ChevronUp className={isDarkMode ? "text-white" : ""} />
            )}
          </button>

          <AnimatePresence>
            {!sectionsCollapsed.filters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search by student or exam..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 text-sm sm:text-base rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {["group", "module", "status"].map((type) => (
                    <select
                      key={type}
                      value={
                        type === "group"
                          ? selectedGroup
                          : type === "module"
                          ? selectedModule
                          : gradingStatus
                      }
                      onChange={(e) =>
                        type === "group"
                          ? setSelectedGroup(e.target.value)
                          : type === "module"
                          ? setSelectedModule(e.target.value)
                          : setGradingStatus(e.target.value)
                      }
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                    >
                      {type === "group" ? (
                        <>
                          <option value="all">All Groups</option>
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </>
                      ) : type === "module" ? (
                        <>
                          <option value="all">All Modules</option>
                          {modules.map((module) => (
                            <option key={module.id} value={module.id}>
                              {module.name}
                            </option>
                          ))}
                        </>
                      ) : (
                        <>
                          <option value="all">All Grades</option>
                          <option value="graded">Graded</option>
                          <option value="ungraded">Ungraded</option>
                        </>
                      )}
                    </select>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grades Section */}
        <div
          className={`rounded-xl shadow-sm p-3 sm:p-4 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <button
            onClick={() => toggleSection("grades")}
            className="w-full flex justify-between items-center mb-3 sm:mb-4"
          >
            <h2
              className={`text-lg sm:text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Grades
            </h2>
            {sectionsCollapsed.grades ? (
              <ChevronDown className={isDarkMode ? "text-white" : ""} />
            ) : (
              <ChevronUp className={isDarkMode ? "text-white" : ""} />
            )}
          </button>

          <AnimatePresence>
            {!sectionsCollapsed.grades && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              >
                {filteredAttempts.map((attempt) => (
                  <motion.div
                    key={attempt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl shadow-sm hover:shadow-lg transition-shadow p-4 sm:p-6 ${
                      isDarkMode ? "bg-gray-700" : "bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div>
                        <h3
                          className={`font-semibold text-base sm:text-lg ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {attempt.student_name}
                        </h3>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {attempt.exam_title}
                        </p>
                      </div>
                      {editingScore === attempt.id ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <input
                            type="number"
                            value={tempScore}
                            onChange={(e) => setTempScore(e.target.value)}
                            className={`w-16 sm:w-20 px-2 py-1 text-sm border rounded ${
                              isDarkMode
                                ? "bg-gray-600 border-gray-500 text-white"
                                : "bg-white border-gray-200"
                            }`}
                            min="0"
                            max="100"
                          />
                          <button
                            onClick={() => handleUpdateScore(attempt.id)}
                            className="p-1 text-green-500 hover:text-green-400"
                          >
                            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => setEditingScore(null)}
                            className="p-1 text-red-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span
                            className={`font-semibold text-base sm:text-lg ${
                              isDarkMode ? "text-white" : ""
                            }`}
                          >
                            {attempt.score ?? "Not graded"}
                          </span>
                          <button
                            onClick={() => {
                              setEditingScore(attempt.id);
                              setTempScore(attempt.score?.toString() ?? "");
                            }}
                            className="p-1 text-blue-500 hover:text-blue-400"
                          >
                            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div
                        className={`flex items-center ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Group:
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ml-2 ${
                            isDarkMode
                              ? "bg-blue-900 text-blue-300"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {attempt.group_name}
                        </span>
                      </div>
                      <div
                        className={`flex items-center ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <Book className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Module:
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ml-2 ${
                            isDarkMode
                              ? "bg-blue-900 text-blue-300"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {attempt.module_name}
                        </span>
                      </div>
                      <div
                        className={`flex items-center ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        <span>
                          Duration: {attempt.duration_minutes} minutes
                        </span>
                      </div>
                      <div
                        className={`flex items-center ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        <span>
                          Date:{" "}
                          {new Date(attempt.start_time).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Responsive Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 p-3 sm:p-4 text-sm sm:text-base rounded-lg shadow-lg z-50 max-w-[90vw] sm:max-w-md ${
                notification.type === "success"
                  ? isDarkMode
                    ? "bg-green-900 border-l-4 border-green-500 text-green-100"
                    : "bg-green-50 border-l-4 border-green-500 text-green-700"
                  : isDarkMode
                  ? "bg-red-900 border-l-4 border-red-500 text-red-100"
                  : "bg-red-50 border-l-4 border-red-500 text-red-700"
              }`}
              onAnimationComplete={() => {
                setTimeout(() => setNotification(null), 3000);
              }}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default GradeManagement;
