import React, { useState, useEffect } from "react";
import {
  Clock,
  BookOpen,
  Users,
  Calendar,
  AlertCircle,
  Book,
  Search,
  PencilRuler,
  Brain,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "@emotion/styled";
import { useTheme } from "../../contexts/themeContext";
import { useNavigate } from "react-router-dom";
import {
  getStudentExamsById,
  startExam,
  validateStartExam,
} from "../../services/userService";

const SearchInput = styled(motion.input)`
  &:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
`;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { isDarkMode } = useTheme();
  const user = JSON.parse(localStorage.getItem("user"));

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
    fetchAvailableExams();
  }, []);

  // Filtering logic
  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === "all") return matchesSearch;
    if (filterType === "attempted") return matchesSearch && exam.has_attempted;
    if (filterType === "available") return matchesSearch && !exam.has_attempted;

    return matchesSearch;
  });

  const fetchAvailableExams = async () => {
    try {
      const response = await getStudentExamsById(user.id);

      if (response.success) {
        setExams(response.exams);
      } else {
        setError(response.message || "Failed to fetch exams");
      }
    } catch (error) {
      setError("Failed to fetch exams. Please try again later.");
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateAndStartExam = async (examId) => {
    try {
      // First validate exam access
      const validateResponse = await validateStartExam({
        exam_id: examId,
        student_id: user.id,
      });

      if (!validateResponse.success) {
        setError(validateResponse.message);
        return;
      }

      // If validated, start the exam
      const startResponse = await startExam({
        exam_id: examId,
        student_id: user.id,
      });

      if (startResponse.success) {
        // Clear any existing exam data for this exam
        sessionStorage.removeItem(`exam_${examId}_attempt`);
        sessionStorage.removeItem(`exam_${examId}_answers`);
        sessionStorage.removeItem(`exam_${examId}_flags`);
        sessionStorage.removeItem(`exam_${examId}_languages`);
        sessionStorage.removeItem(`exam_${examId}_time_left`);
        sessionStorage.removeItem(`exam_${examId}_end_time`);

        // Set a transition flag to indicate an explicit exam start
        sessionStorage.setItem(`exam_transition_${examId}`, "true");

        // Clear any attempt-specific transition flags
        const keys = Object.keys(sessionStorage);
        keys.forEach((key) => {
          if (key.startsWith(`exam_transition_${examId}_`)) {
            sessionStorage.removeItem(key);
          }
        });

        navigate(`/student/take-exam/${examId}/${startResponse.attempt_id}`, {
          replace: true, // This prevents going back to the dashboard
        });
      } else {
        setError(startResponse.message || "Failed to start exam");
        console.error("Error starting exam:", error);
      }
    } catch (error) {
      setError("Failed to start exam. Please try again later.");
      console.error("Error starting exam:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const LoadingSpinner = () => (
    <motion.div
      className={`flex justify-center items-center h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`h-16 w-16 border-4 rounded-full ${
          isDarkMode
            ? "border-gray-700 border-t-blue-400"
            : "border-blue-200 border-t-blue-600"
        }`}
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
      className={`min-h-screen py-8 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Welcome back, {user.full_name}! 👋
          </h1>
          <p
            className={`mt-2 text-lg ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Ready to ace your exams? Here's what's available for you.
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg flex items-center ${
                isDarkMode
                  ? "bg-red-900/20 border-red-500/50"
                  : "bg-red-50 border-red-500"
              } border-l-4`}
            >
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className={isDarkMode ? "text-red-400" : "text-red-700"}>
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="mb-6 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <SearchInput
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl border transition-colors duration-200 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
              whileFocus={{ scale: 1.01 }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-2 rounded-xl border transition-colors duration-200 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <option value="all">All Exams</option>
            <option value="available">Available</option>
            <option value="attempted">Attempted</option>
          </select>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredExams.map((exam) => (
            <motion.div
              key={exam.id}
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
                    {exam.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    {exam.is_aa_quiz ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs flex items-center whitespace-nowrap dark:bg-purple-900/30 dark:text-purple-300">
                        <Brain className="w-3 h-3 mr-1" />
                        Quiz
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center whitespace-nowrap dark:bg-blue-900/30 dark:text-blue-300">
                        <PencilRuler className="w-3 h-3 mr-1" />
                        Exam
                      </span>
                    )}
                  </div>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-300"
                  >
                    Published
                  </motion.span>
                </div>

                <p
                  className={`mb-6 line-clamp-2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
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
                    <BookOpen className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>{exam.question_count} Questions</span>
                  </div>

                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Users className="w-4 h-4 mr-3 flex-shrink-0" />
                    Group:
                    <span
                      className={`px-2 py-1 rounded-full text-xs ml-1 ${
                        isDarkMode
                          ? "bg-blue-900/30 text-blue-300"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {exam.group_name}
                    </span>
                  </div>

                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Book className="w-4 h-4 mr-3 flex-shrink-0" />
                    Module:
                    <span
                      className={`px-2 py-1 rounded-full text-xs ml-1 ${
                        isDarkMode
                          ? "bg-blue-900/30 text-blue-300"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {exam.module_name}
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

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <motion.button
                    onClick={() => validateAndStartExam(exam.id)}
                    disabled={exam.has_attempted}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full px-4 py-3 rounded-xl text-center font-medium transition-all duration-200 ${
                      exam.has_attempted
                        ? `${
                            isDarkMode
                              ? "bg-gray-800 text-gray-500"
                              : "bg-gray-100 text-gray-500"
                          } cursor-not-allowed`
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                    }`}
                  >
                    {exam.has_attempted
                      ? "Maximum Attempts Reached"
                      : "Start Exam"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredExams.length === 0 && (
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
                <BookOpen
                  className={`w-16 h-16 ${
                    isDarkMode ? "text-gray-600" : "text-gray-400"
                  } mb-4`}
                />
              </motion.div>
              <h3
                className={`text-xl font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                No Exams Found
              </h3>
              <p
                className={`mt-2 text-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {searchTerm
                  ? "No exams match your search criteria. Try adjusting your filters."
                  : "There are no published exams available for your group at the moment."}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
