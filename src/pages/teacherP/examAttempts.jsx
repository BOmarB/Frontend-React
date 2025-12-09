import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "react-query";
import {
  Check,
  Clock,
  Users,
  AlertCircle,
  Filter,
  Download,
  ChevronDown,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "../../contexts/themeContext";
import { getExamAttempts } from "../../services/userService";

const ExamAttempts = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { isDarkMode } = useTheme();

  const { data, isLoading, error } = useQuery(
    ["attempts", examId],
    () => getExamAttempts(examId),
    {
      refetchInterval: 30000,
      staleTime: 10000,
      select: (data) => {
        if (data.success) {
          return {
            attempts: data.attempts,
            questions: data.questions,
          };
        }
        return { attempts: [], questions: [] };
      },
    }
  );

  const attempts = data?.attempts || [];
  const questions = data?.questions || [];

  const filteredAttempts = attempts
    .filter((attempt) => {
      const nameMatch = attempt.student_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const statusMatch =
        filterStatus === "all"
          ? true
          : filterStatus === "pending"
          ? attempt.score === null
          : attempt.score !== null;
      return nameMatch && statusMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.end_time);
      const dateB = new Date(b.end_time);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const exportCSV = () => {
    if (!data) return;

    const questionHeaders = data.questions.map((q) => `Question ${q.number}`);
    const headers = [
      "Nom Prenom",
      "Group",
      ...questionHeaders,
      "Total Score",
      "Emargement",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredAttempts.map((attempt) => {
        const row = [
          `"${attempt.student_name}"`,
          `"${attempt.group_name}"`,
          ...data.questions.map((q) => attempt.question_scores[q.number]),
          attempt.score || "N/A",
          "",
        ];
        return row.join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam-attempts-${examId}.csv`;
    a.click();
  };

  const stats = {
    total: filteredAttempts.length,
    pending: filteredAttempts.filter((a) => a.score === null).length,
    corrected: filteredAttempts.filter((a) => a.score !== null).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${
            isDarkMode ? "border-blue-400" : "border-blue-500"
          }`}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <AlertCircle className="mr-2" />
        <span>Error loading attempts. Please try again later.</span>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
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
        <ArrowLeft className="w-5 h-5 mr-3" />
        Back to Dashboard
      </motion.button>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-6 sm:py-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2
            className={`text-2xl sm:text-3xl font-bold ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Exam Attempts
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportCSV}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 w-full sm:w-auto justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </motion.button>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 rounded-lg shadow ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="text-center p-3">
            <div className="text-2xl font-bold text-blue-500">
              {stats.total}
            </div>
            <div
              className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Total Attempts
            </div>
          </div>
          <div className="text-center p-3 border-t sm:border-t-0 sm:border-l border-gray-200">
            <div className="text-2xl font-bold text-yellow-500">
              {stats.pending}
            </div>
            <div
              className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Pending
            </div>
          </div>
          <div className="text-center p-3 border-t sm:border-t-0 sm:border-l border-gray-200">
            <div className="text-2xl font-bold text-green-500">
              {stats.corrected}
            </div>
            <div
              className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Corrected
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by student name..."
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border flex items-center ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300"
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown
                className={`w-4 h-4 ml-2 transform transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
            <select
              className={`px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300"
              }`}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg shadow ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "corrected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg flex-1 sm:flex-none ${
                    filterStatus === status
                      ? "bg-blue-500 text-white"
                      : isDarkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {filteredAttempts.map((attempt, index) => (
          <motion.div
            key={attempt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl shadow-lg mb-4 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-2 w-full sm:w-auto">
                  <h3
                    className={`text-lg sm:text-xl font-semibold ${
                      isDarkMode ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    {attempt.student_name}
                  </h3>
                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">{attempt.group_name}</span>
                  </div>
                  <div
                    className={`flex items-center ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {new Date(attempt.end_time).toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm ${
                      attempt.status === "completed"
                        ? isDarkMode
                          ? "bg-green-900 text-green-100"
                          : "bg-green-100 text-green-800"
                        : isDarkMode
                        ? "bg-yellow-900 text-yellow-100"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {attempt.score !== null
                      ? `Score: ${attempt.score}`
                      : "Pending"}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    navigate(`/exam/${examId}/correct/${attempt.id}`)
                  }
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 w-full sm:w-auto justify-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {attempt.score !== null ? "Review" : "Correct"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredAttempts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center mt-8 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          No attempts found
        </motion.div>
      )}
    </div>
  );
};

export default ExamAttempts;
