import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Shield,
  Smartphone,
  PieChart,
  CheckCircle,
  Users,
  FileText,
  Bell,
  Zap,
  Book,
  Calendar,
  ListChecks,
  Database,
  UserCog,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/themeContext";

const LearnMore = () => {
  const { isDarkMode } = useTheme();

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Comprehensive Exam Management",
      description:
        "Create, schedule, and manage multiple exams with flexible question types, time limits, and rules customization.",
      color: isDarkMode ? "bg-purple-900" : "bg-purple-100",
      iconColor: isDarkMode ? "text-purple-300" : "text-purple-600",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Automatic Grading System",
      description:
        "Instant grading of multiple-choice questions with detailed score reports and performance analysis for students and teachers.",
      color: isDarkMode ? "bg-blue-900" : "bg-blue-100",
      iconColor: isDarkMode ? "text-blue-300" : "text-blue-600",
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Performance Analytics",
      description:
        "Visual dashboards showing student progress, exam statistics, and performance trends to help identify improvement areas.",
      color: isDarkMode ? "bg-green-900" : "bg-green-100",
      iconColor: isDarkMode ? "text-green-300" : "text-green-600",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Responsive Design",
      description:
        "Take exams on any device with our mobile-friendly interface, ensuring a consistent experience across desktops, tablets, and phones.",
      color: isDarkMode ? "bg-yellow-900" : "bg-yellow-100",
      iconColor: isDarkMode ? "text-yellow-300" : "text-yellow-600",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Timed Examination",
      description:
        "Configure exam durations with automatic submission when time expires, countdown timers, and flexible scheduling options.",
      color: isDarkMode ? "bg-red-900" : "bg-red-100",
      iconColor: isDarkMode ? "text-red-300" : "text-red-600",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Testing Environment",
      description:
        "Role-based access control, secure authentication, and data protection to maintain the integrity of your examination process.",
      color: isDarkMode ? "bg-indigo-900" : "bg-indigo-100",
      iconColor: isDarkMode ? "text-indigo-300" : "text-indigo-600",
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: "Module Management",
      description:
        "Organize courses into modules with associated exams, materials, and assignments for structured learning experiences.",
      color: isDarkMode ? "bg-pink-900" : "bg-pink-100",
      iconColor: isDarkMode ? "text-pink-300" : "text-pink-600",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User & Group Management",
      description:
        "Easily manage students, teachers, and administrators with customizable groups and permissions for streamlined access control.",
      color: isDarkMode ? "bg-orange-900" : "bg-orange-100",
      iconColor: isDarkMode ? "text-orange-300" : "text-orange-600",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Notification System",
      description:
        "Keep everyone informed with real-time notifications for exam schedules, results, and important announcements.",
      color: isDarkMode ? "bg-teal-900" : "bg-teal-100",
      iconColor: isDarkMode ? "text-teal-300" : "text-teal-600",
    },
    {
      icon: <ListChecks className="w-6 h-6" />,
      title: "Question Bank Repository",
      description:
        "Build and maintain a comprehensive question bank for easy reuse and assembly of exams with categorization and search functionality.",
      color: isDarkMode ? "bg-cyan-900" : "bg-cyan-100",
      iconColor: isDarkMode ? "text-cyan-300" : "text-cyan-600",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Exam Scheduling",
      description:
        "Set flexible exam schedules with specific date and time windows, allowing students to take exams when it's most convenient.",
      color: isDarkMode ? "bg-amber-900" : "bg-amber-100",
      iconColor: isDarkMode ? "text-amber-300" : "text-amber-600",
    },
    {
      icon: <UserCog className="w-6 h-6" />,
      title: "User Profile Management",
      description:
        "Students and teachers can manage their profiles, track progress, and customize their experience with personal dashboards.",
      color: isDarkMode ? "bg-emerald-900" : "bg-emerald-100",
      iconColor: isDarkMode ? "text-emerald-300" : "text-emerald-600",
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-blue-950"
          : "bg-gradient-to-br from-gray-50 to-blue-50"
      } py-12`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1
            className={`text-4xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Examly: Modern Online Examination Platform
          </h1>
          <p
            className={`text-xl ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } max-w-3xl mx-auto`}
          >
            Discover our powerful features designed to streamline your
            examination process and enhance the learning experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg overflow-hidden`}
            >
              <div className="p-6">
                <div
                  className={`${feature.color} ${feature.iconColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  {feature.icon}
                </div>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  } mb-2`}
                >
                  {feature.title}
                </h3>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <h2
            className={`text-2xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Ready to Experience Examly?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              className={`${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } 
                px-6 py-3 rounded-lg text-white font-medium transition-colors text-decoration-none`}
              to="/register"
            >
              Sign Up Now
            </Link>
            <Link
              className={`${
                isDarkMode
                  ? "bg-gray-800 text-blue-300 border-blue-400 hover:bg-gray-700"
                  : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
              } 
                px-6 py-3 rounded-lg border transition-colors text-decoration-none`}
              to="/login"
            >
              Login to Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LearnMore;
