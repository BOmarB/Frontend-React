import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  CircleHelp,
  Clock,
  Users,
  Book,
  Send,
  Search,
  Calendar,
  GroupIcon,
  X,
  Brain,
  PencilRuler,
  Edit2,
  BarChart2,
} from "lucide-react";

import {
  getExamsByTeacher,
  getAllGroups,
  toggleExamStatus,
  deleteExam,
} from "../../services/userService";
import styled from "@emotion/styled";
import { useTheme } from "../../contexts/themeContext"; // Import useTheme hook
import ManagementMenu from "../../components/ManagementMenu";

const SearchInput = styled(motion.input)`
  &:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
`;

export const GlassCard = styled(motion.div)`
  background: ${(props) =>
    props.isDarkMode ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.8)"};
  backdrop-filter: blur(10px);
  border: 1px solid
    ${(props) =>
      props.isDarkMode ? "rgba(30, 41, 59, 0.3)" : "rgba(255, 255, 255, 0.3)"};
  color: ${(props) => (props.isDarkMode ? "white" : "inherit")};
`;

const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [publishing, setPublishing] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [deleting, setDeleting] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const { isDarkMode } = useTheme(); // Get isDarkMode from theme context

  const handleDeleteExam = async (examId) => {
    try {
      setDeleting(examId);
      const response = await deleteExam(examId);
      if (response.success) {
        setExams(exams.filter((exam) => exam.id !== examId));
        setNotification({
          message: "Exam deleted successfully!",
          type: "success",
        });
        setShowDeleteConfirm(null);
      } else {
        setNotification({
          message: "Failed to delete exam",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      setNotification({
        message: "Error deleting exam",
        type: "error",
      });
    } finally {
      setDeleting(null);
    }
  };

  const DeleteConfirmationModal = ({
    examId,
    examTitle,
    onClose,
    onConfirm,
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className={`${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white"
        } rounded-xl p-6 max-w-md w-full`}
      >
        <h3 className="text-xl font-semibold mb-4">Delete Exam</h3>
        <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} mb-6`}>
          Are you sure you want to delete "{examTitle}"? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const handleCreateAAQuiz = () => {
    navigate("/teacher/create-quiz");
  };

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
    loadExams();
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await getAllGroups();
      if (response.success) {
        setGroups(response.groups);
      }
    } catch (err) {
      console.error("Error loading groups:", err);
    }
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await getExamsByTeacher(user.id);
      if (response.success) {
        const parsedExams = response.exams.map((exam) => ({
          ...exam,
          questions: Array.isArray(exam.questions)
            ? exam.questions
            : JSON.parse(exam.questions || "[]"),
        }));
        setExams(parsedExams);
      } else {
        setError("Failed to load exams");
      }
    } catch (err) {
      console.error("Error loading exams:", err);
      setError("Error loading exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 2000); // 2 seconds

      // Cleanup the timer if the component unmounts or notification changes
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleToggleExamStatus = async (examId, currentStatus) => {
    try {
      setPublishing(examId);
      const response = await toggleExamStatus(examId, currentStatus);
      if (response.success) {
        setExams(
          exams.map((exam) =>
            exam.id === examId
              ? {
                  ...exam,
                  status: currentStatus === "published" ? "draft" : "published",
                }
              : exam
          )
        );
        setNotification({
          message: `Exam ${
            currentStatus === "published" ? "unpublished" : "published"
          } successfully!`,
          type: "success",
        });
      } else {
        setNotification({
          message: `Failed to ${
            currentStatus === "published" ? "unpublish" : "publish"
          } exam`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error toggling exam status:", error);
      setNotification({
        message: "Error updating exam status",
        type: "error",
      });
    } finally {
      setPublishing(null);
    }
  };

  const LoadingSpinner = () => (
    <motion.div
      className={`flex justify-center items-center h-screen ${
        isDarkMode ? "bg-gray-900" : ""
      }`}
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

  // Filter and search functionality
  const filteredExams =
    selectedGroup === "all"
      ? exams
      : exams.filter((exam) => {
          // Split the group_ids string into an array and convert to numbers
          const examGroupIds = exam.group_ids
            ? exam.group_ids.split(",").map((id) => Number(id))
            : [];
          return examGroupIds.includes(Number(selectedGroup));
        });

  const filteredAndSearchedExams = filteredExams
    .filter(
      (exam) =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.created_at) - new Date(a.created_at);
        case "title":
          return a.title.localeCompare(b.title);
        case "attempts":
          return (b.attempt_count || 0) - (a.attempt_count || 0);
        default:
          return 0;
      }
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-4 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1
                className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Welcome back, {user.full_name}! 👋
              </h1>
              <p
                className={`mt-2 text-base sm:text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Manage and create exams for your students.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/teacher/create-exam")}
                className="w-full sm:w-auto px-4 py-2 sm:py-3 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg text-sm sm:text-base"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                Create New Exam
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateAAQuiz}
                className="w-full sm:w-auto px-4 py-2 sm:py-3 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg flex items-center justify-center text-sm sm:text-base"
              >
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Create Quiz
              </motion.button>

              <ManagementMenu
                isDarkMode={isDarkMode}
                onGroupCreate={(newGroup) => {
                  console.log("New group created:", newGroup);
                }}
                onModuleCreate={(newModule) => {
                  console.log("New module created:", newModule);
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Search and Filters Section */}
        <motion.div
          className="mb-6 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              } w-5 h-5`}
            />
            <SearchInput
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-200 text-gray-900"
              } focus:outline-none text-sm sm:text-base`}
              whileFocus={{ scale: 1.01 }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className={`px-4 py-2 rounded-xl border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-200 text-gray-900"
              } focus:outline-none focus:border-blue-500 text-sm sm:text-base`}
            >
              <option value="all">All Groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-xl border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-200 text-gray-900"
              } focus:outline-none focus:border-blue-500 text-sm sm:text-base`}
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="attempts">Sort by Attempts</option>
            </select>
          </div>
        </motion.div>

        {/* Exam Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {filteredAndSearchedExams.map((exam) => (
            <motion.div
              key={exam.id}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border relative ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-100 text-gray-900"
              }`}
            >
              {/* Delete Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDeleteConfirm(exam.id)}
                disabled={deleting === exam.id}
                className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors "
              >
                <X className="w-4 h-4" />
              </motion.button>

              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 mb-4 pr-6">
                  <h2
                    className={`text-lg sm:text-xl font-semibold truncate ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {exam.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    {exam.is_aa_quiz ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs flex items-center whitespace-nowrap">
                        <Brain className="w-3 h-3 mr-1" />
                        Quiz
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center whitespace-nowrap">
                        <PencilRuler className="w-3 h-3 mr-1" />
                        Exam
                      </span>
                    )}
                    <button
                      onClick={() =>
                        handleToggleExamStatus(exam.id, exam.status)
                      }
                      disabled={publishing === exam.id}
                      className={`px-3 py-1 text-xs sm:text-sm ${
                        exam.status === "published"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      } rounded-full flex items-center gap-2 transition-colors whitespace-nowrap`}
                    >
                      <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                      {publishing === exam.id
                        ? "Updating..."
                        : exam.status === "published"
                        ? "Published"
                        : "Draft"}
                    </button>
                  </div>
                </div>

                <p
                  className={`mb-4 sm:mb-6 line-clamp-2 text-sm sm:text-base ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {exam.description}
                </p>

                <div className="space-y-3 text-sm">
                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Clock className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>{exam.duration_minutes} minutes</span>
                  </div>

                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <CircleHelp className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>{exam.questions?.length || 0} Questions</span>
                  </div>

                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Users className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>{exam.attempt_count || 0} Attempts</span>
                  </div>

                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Book className="w-4 h-4 mr-3 flex-shrink-0" />
                    Module:
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        isDarkMode
                          ? "bg-gray-700 text-blue-300"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {exam.module_name || "No module"}
                    </span>
                  </div>

                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <GroupIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                    Group:
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        isDarkMode
                          ? "bg-gray-700 text-blue-300"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {exam.group_names || "No group"}
                    </span>
                  </div>

                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>Created: {formatDate(exam.created_at)}</span>
                  </div>
                </div>

                <div
                  className={`mt-4 sm:mt-6 pt-4 border-t flex flex-wrap gap-2 ${
                    isDarkMode ? "border-gray-700" : "border-gray-100"
                  }`}
                >
                  <motion.button
                    onClick={() => navigate(`/exam/${exam.id}/edit`)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 px-3 py-2 rounded-full text-xs sm:text-sm font-medium ${
                      isDarkMode
                        ? "bg-blue-900 text-blue-300 hover:bg-blue-800"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    } transition-colors flex items-center justify-center gap-2`}
                  >
                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Edit
                  </motion.button>

                  {exam.attempt_count > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/exam/${exam.id}/attempts`)}
                      className={`flex-1 px-3 py-2 rounded-full text-xs sm:text-sm font-medium ${
                        isDarkMode
                          ? "bg-emerald-900 text-emerald-300 hover:bg-emerald-800"
                          : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      } transition-colors flex items-center justify-center gap-2`}
                    >
                      <BarChart2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Attempts
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {filteredAndSearchedExams.length === 0 && (
            <motion.div
              variants={itemVariants}
              className={`col-span-full flex flex-col items-center justify-center py-8 sm:py-12 px-4 rounded-xl shadow-sm border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
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
                <Book
                  className={`w-12 h-12 sm:w-16 sm:h-16 mb-4 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
              </motion.div>
              <h3
                className={`text-lg sm:text-xl font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                No Exams Found
              </h3>
              <p
                className={`mt-2 text-center text-sm sm:text-base ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {searchTerm
                  ? "No exams match your search criteria. Try adjusting your filters."
                  : "You haven't created any exams yet. Get started by creating your first exam!"}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/teacher/create-exam")}
                className="mt-6 px-4 py-2 sm:py-3 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg text-sm sm:text-base"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                Create New Exam
              </motion.button>
            </motion.div>
          )}
        </motion.div>
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.2 }}
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                notification.type === "success"
                  ? `${
                      isDarkMode ? "bg-green-900" : "bg-green-50"
                    } border-l-4 border-green-500 ${
                      isDarkMode ? "text-green-300" : "text-green-700"
                    }`
                  : `${
                      isDarkMode ? "bg-red-900" : "bg-red-50"
                    } border-l-4 border-red-500 ${
                      isDarkMode ? "text-red-300" : "text-red-700"
                    }`
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard
            isDarkMode={isDarkMode}
            className="max-w-md w-full rounded-2xl p-6"
          >
            <h3
              className={`text-xl font-semibold mb-4 ${
                isDarkMode ? "text-white" : ""
              }`}
            >
              Delete Exam
            </h3>
            <p
              className={`mb-6 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to delete "
              {exams.find((e) => e.id === showDeleteConfirm)?.title}" ? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={`px-4 py-2 rounded-xl ${
                  isDarkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteExam(showDeleteConfirm)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </motion.div>
  );
};

export default TeacherDashboard;
