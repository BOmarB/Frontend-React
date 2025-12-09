import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Book,
  Calendar,
  Clock,
  Search,
  TrendingUp,
  Award,
  BarChart2,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/authContext";
import { useTheme } from "../../contexts/themeContext";
import {
  getAllGroups,
  getAllModules,
  getStudentExam,
} from "../../services/userService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StudentGrades = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [modules, setModules] = useState([]);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [exam, setExam] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchStudentExam = async () => {
      try {
        const respone = await getStudentExam(user.id);

        if (respone.success) {
          setExam(respone.exams);

          // Prepare chart data when exams are loaded
          const sortedExams = [...respone.exams].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );

          const formattedData = sortedExams.map((exam) => ({
            date: new Date(exam.created_at).toLocaleDateString(),
            score: Number(exam.score),
            module: exam.module_name,
            title: exam.title,
          }));

          setChartData(formattedData);
        } else {
          setError(respone.message || "Failed to fetch exams");
        }
      } catch (error) {
        setError("Failed to fetch exams please try later");
        console.error("error fetching exams :", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchStudentModules = async () => {
      try {
        const data = await getAllModules();
        console.log(data.modules);
        if (data.success) {
          setModules(data.modules);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
        setLoading(false);
      }
    };
    fetchStudentModules();
    fetchStudentExam();
  }, []);

  useEffect(() => {
    // Update chart data when filter changes
    if (exam.length > 0) {
      const filteredData = exam
        .filter((exam) => {
          const matchesSearch = exam.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesModule =
            selectedModule === "all" || exam.module_name === selectedModule;
          return matchesSearch && matchesModule;
        })
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((exam) => ({
          date: new Date(exam.created_at).toLocaleDateString(),
          score: Number(exam.score),
          module: exam.module_name,
          title: exam.title,
        }));

      setChartData(filteredData);
    }
  }, [searchTerm, selectedModule, exam]);

  const calculateOverallPerformance = () => {
    if (exam.length === 0) return 0;
    const totalScore = exam.reduce(
      (sum, exam) => sum + (Number(exam.score) / 20) * 100,
      0
    );
    return (totalScore / exam.length).toFixed(1);
  };

  const filteredexam = exam.filter((exam) => {
    const matchesSearch = exam.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesModule =
      selectedModule === "all" || exam.module_name === selectedModule;
    return matchesSearch && matchesModule;
  });

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
            ? "border-gray-700 border-t-blue-500"
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
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Performance Summary */}
        <div
          className={`${
            isDarkMode ? "bg-gray-900" : "bg-white"
          } rounded-xl p-6 mb-6 border ${
            isDarkMode ? "border-gray-800" : "border-gray-200/80"
          }`}
        >
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? "text-gray-100" : "text-gray-900"
            } mb-4`}
          >
            My Grades
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className={`${
                isDarkMode ? "bg-gray-800/50" : "bg-blue-50"
              } rounded-lg p-4 border ${
                isDarkMode ? "border-gray-800" : "border-blue-100"
              }`}
            >
              <div className="flex items-center gap-2 text-blue-500">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-semibold">Overall Performance</h3>
              </div>
              <p className={`text-2xl font-bold text-blue-500 mt-2`}>
                {calculateOverallPerformance()}%
              </p>
            </div>

            <div
              className={`${
                isDarkMode ? "bg-gray-800/50" : "bg-green-50"
              } rounded-lg p-4 border ${
                isDarkMode ? "border-gray-800" : "border-green-100"
              }`}
            >
              <div className="flex items-center gap-2 text-green-500">
                <Award className="w-5 h-5" />
                <h3 className="font-semibold">Highest Score</h3>
              </div>
              <p className={`text-2xl font-bold text-green-500 mt-2`}>
                {exam.length > 0 ? Math.max(...exam.map((a) => a.score)) : 0}
              </p>
            </div>

            <div
              className={`${
                isDarkMode ? "bg-gray-800/50" : "bg-purple-50"
              } rounded-lg p-4 border ${
                isDarkMode ? "border-gray-800" : "border-purple-100"
              }`}
            >
              <div className="flex items-center gap-2 text-purple-500">
                <BarChart2 className="w-5 h-5" />
                <h3 className="font-semibold">Total Exams</h3>
              </div>
              <p className={`text-2xl font-bold text-purple-500 mt-2`}>
                {exam.length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-800 text-gray-100 placeholder-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              />
            </div>

            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className={`px-4 py-2 rounded-xl border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-800 text-gray-100"
                  : "bg-white border-gray-200 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
            >
              <option value="all">All Modules</option>
              {modules.map((module) => (
                <option
                  key={module.id}
                  value={module.name}
                  className={isDarkMode ? "bg-gray-800" : "bg-white"}
                >
                  {module.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Performance Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            isDarkMode ? "bg-gray-900" : "bg-white"
          } rounded-xl p-6 mb-6 border ${
            isDarkMode ? "border-gray-800" : "border-gray-200/80"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <LineChartIcon
              className={`w-5 h-5 ${
                isDarkMode ? "text-blue-400" : "text-blue-500"
              }`}
            />
            <h2
              className={`text-xl font-semibold ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Performance Over Time
            </h2>
          </div>

          {chartData.length > 0 ? (
            <div className="w-full h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: isDarkMode ? "#9ca3af" : "#4b5563" }}
                    style={{ fontSize: "0.75rem" }}
                  />
                  <YAxis
                    domain={[0, 20]}
                    tick={{ fill: isDarkMode ? "#9ca3af" : "#4b5563" }}
                    style={{ fontSize: "0.75rem" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                      color: isDarkMode ? "#f3f4f6" : "#111827",
                    }}
                    labelStyle={{
                      color: isDarkMode ? "#f3f4f6" : "#111827",
                      fontWeight: "bold",
                    }}
                    formatter={(value, name) => [`${value}/20`, "Score"]}
                    labelFormatter={(label) => {
                      const exam = chartData.find((e) => e.date === label);
                      return exam ? `${exam.title} (${exam.module})` : label;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: isDarkMode ? "#f3f4f6" : "#111827" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Score"
                    stroke={isDarkMode ? "#3b82f6" : "#2563eb"}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              className={`flex justify-center items-center h-64 text-gray-500`}
            >
              No exam data available to display.
            </div>
          )}
        </motion.div>

        {/* Exam List */}
        <div className="space-y-4">
          {filteredexam.map((exam) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${
                isDarkMode ? "bg-gray-900" : "bg-white"
              } rounded-xl p-6 border ${
                isDarkMode ? "border-gray-800" : "border-gray-200/80"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3
                    className={`font-semibold text-xl ${
                      isDarkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {exam.title}
                  </h3>
                  <p className="text-gray-500">{exam.module_name}</p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-2xl font-bold ${
                      exam.score >= 20
                        ? "text-green-500"
                        : exam.score >= 14
                        ? "text-blue-500"
                        : exam.score >= 10
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {exam.score}
                  </div>
                  <div className="text-sm text-gray-500">out of 20</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <Book className="w-4 h-4 mr-2" />
                  Module:{" "}
                  <span
                    className={`${
                      isDarkMode
                        ? "bg-gray-800 text-blue-400"
                        : "bg-blue-50 text-blue-600"
                    } rounded-full px-2 py-1 text-xs ml-1`}
                  >
                    {exam.module_name}
                  </span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  Duration: {exam.duration_minutes} minutes
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date: {new Date(exam.created_at).toLocaleDateString()}
                </div>
              </div>

              {exam.feedback && (
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-800 text-blue-400 border border-gray-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <p className="font-semibold">Feedback:</p>
                  <p>{exam.feedback}</p>
                </div>
              )}
            </motion.div>
          ))}

          {filteredexam.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No exams found matching your search criteria.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentGrades;
