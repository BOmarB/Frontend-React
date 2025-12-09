import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  MinusCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import {
  getAllGroups,
  getAllModules,
  createExam,
  createQuestion,
} from "../../services/userService";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/themeContext";
import { Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const ExamCreator = () => {
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [examData, setExamData] = useState({
    title: "",
    description: "",
    teacher_id: JSON.parse(localStorage.getItem("user"))?.id || "",
    duration_minutes: 60,
    groups: [],
    module_id: "",
    questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    points: 1,
    type: "mcq",
    image: null,
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });
  const [groups, setGroups] = useState([]);
  const [modules, setModules] = useState([]);
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  const questionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await Promise.all([loadGroups(), loadModules()]);
      } catch (error) {
        setError("Failed to load initial data");
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleGroupChange = (groupId) => {
    setExamData((prev) => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter((id) => id !== groupId)
        : [...prev.groups, groupId],
    }));
  };

  // const renderGroupSelect = () => (
  //   <div className="space-y-2">
  //     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
  //       Select Groups
  //     </label>
  //     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 border rounded-xl bg-white dark:bg-gray-800 dark:border-gray-700">
  //       {groups.map((group) => (
  //         <div key={group.id} className="flex items-center space-x-2">
  //           <input
  //             type="checkbox"
  //             id={`group-${group.id}`}
  //             checked={examData.groups.includes(group.id)}
  //             onChange={() => handleGroupChange(group.id)}
  //             className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
  //           />
  //           <label
  //             htmlFor={`group-${group.id}`}
  //             className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white cursor-pointer"
  //           >
  //             {group.name}
  //           </label>
  //         </div>
  //       ))}
  //     </div>
  //     {examData.groups.length === 0 && (
  //       <p className="text-sm text-red-500 dark:text-red-400">
  //         Please select at least one group
  //       </p>
  //     )}
  //   </div>
  // );

  const loadGroups = async () => {
    try {
      const response = await getAllGroups();
      if (response.success) {
        setGroups(response.groups);
      } else {
        throw new Error(response.message || "Failed to load groups");
      }
    } catch (error) {
      console.error("Error loading groups:", error);
      throw error;
    }
  };
  // const renderModuleSelect = () => (
  //   <div>
  //     <label className="block text-sm font-medium text-gray-700 mb-1">
  //       Select Module
  //     </label>
  //     <select
  //       name="module_id"
  //       value={examData.module_id}
  //       onChange={handleExamInfoChange}
  //       className="w-full px-3 py-2 border rounded-lg"
  //       required
  //     >
  //       <option value="">Select a module</option>
  //       {modules.map((module) => (
  //         <option key={module.id} value={module.id}>
  //           {module.name}
  //         </option>
  //       ))}
  //     </select>
  //   </div>
  // );

  const loadModules = async () => {
    try {
      const response = await getAllModules();
      if (response.success) {
        setModules(response.modules);
      } else {
        throw new Error(response.message || "Failed to load modules");
      }
    } catch (error) {
      console.error("Error loading modules:", error);
      throw error;
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  const handleExamInfoChange = (e) => {
    setExamData({ ...examData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({ ...currentQuestion, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        // 5MB limit
        showNotification("Image size should be less than 5MB", "error");
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        showNotification(
          "Please upload an image file (JPEG, PNG, or GIF)",
          "error"
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentQuestion({ ...currentQuestion, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleCorrectAnswerChange = (index) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = {
      ...newOptions[index],
      isCorrect: !newOptions[index].isCorrect,
    };
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { text: "", isCorrect: false }],
    });
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion({ ...currentQuestion, options: newOptions });
    }
  };

  const validateQuestion = () => {
    if (!currentQuestion.text.trim()) {
      showNotification("Question text is required", "error");
      return false;
    }
    if (currentQuestion.type === "mcq") {
      if (!currentQuestion.options.some((opt) => opt.isCorrect)) {
        showNotification("Please mark at least one correct answer", "error");
        return false;
      }
      if (currentQuestion.options.some((opt) => !opt.text.trim())) {
        showNotification("All options must have text", "error");
        return false;
      }
    }
    return true;
  };

  const addQuestion = () => {
    if (validateQuestion()) {
      setExamData({
        ...examData,
        questions: [...examData.questions, currentQuestion],
      });
      setCurrentQuestion({
        text: "",
        points: 1,
        type: "mcq",
        image: null,
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      });
      showNotification("Question added successfully", "success");
    }
  };

  const removeQuestion = (index) => {
    const newQuestions = examData.questions.filter((_, i) => i !== index);
    setExamData({ ...examData, questions: newQuestions });
    showNotification("Question removed", "success");
  };

  const validateExam = () => {
    if (!examData.title.trim()) {
      showNotification("Exam title is required", "error");
      return false;
    }
    if (!examData.description.trim()) {
      showNotification("Exam description is required", "error");
      return false;
    }
    if (examData.questions.length === 0) {
      showNotification("Add at least one question", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateExam()) return;

    try {
      setLoading(true);
      // Create exam using the service function
      const examResult = await createExam({
        title: examData.title,
        description: examData.description,
        teacher_id: examData.teacher_id,
        duration_minutes: examData.duration_minutes,
        groups: examData.groups,
        module_id: examData.module_id,
      });

      if (examResult.success && examResult.exam_id) {
        // Create questions using the service function
        for (const question of examData.questions) {
          await createQuestion({
            exam_id: examResult.exam_id,
            question_text: question.text,
            question_type: question.type,
            points: question.points,
            image: question.image,
            options: question.options,
          });
        }

        showNotification(
          "Exam created successfully for all selected groups!",
          "success"
        );

        // Reset form
        setExamData({
          title: "",
          description: "",
          teacher_id: JSON.parse(localStorage.getItem("user"))?.id || "",
          duration_minutes: 60,
          groups: [],
          module_id: "",
          questions: [],
        });
        setCurrentStep(1);
      } else {
        setError(examResult.message || "Failed to load exam");
      }
    } catch (error) {
      setError(error.message || "Error loading exam");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <Transition
          appear
          show={true}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
        >
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </Transition>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Transition
        appear
        show={true}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
      >
        <div
          className={`min-h-screen ${
            isDarkMode ? "bg-gray-900" : "bg-gray-50"
          } flex flex-col items-center justify-center p-4`}
        >
          <div className="max-w-md text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2
              className={`text-xl font-bold mb-2 ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Oops! Something went wrong
            </h2>
            <p
              className={`${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              } mb-6`}
            >
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Transition>
    );
  }

  return (
    <div
      className={`min-h-screen py-8 ${
        isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className={`mb-4 flex items-center self-start ${
            isDarkMode
              ? "text-gray-300 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ArrowLeft className=" w-5 h-5 mr-3" />
          Back to Dashboard
        </motion.button>
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            } rounded-xl shadow-sm border overflow-hidden`}
          >
            {/* Progress Steps */}
            <div
              className={`flex justify-between p-6 ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              } border-b`}
            >
              {[1, 2].map((step) => (
                <motion.div
                  key={step}
                  className={`flex items-center ${
                    currentStep === step
                      ? "text-blue-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep === step
                        ? isDarkMode
                          ? "bg-blue-900 border-blue-400"
                          : "bg-blue-100 border-blue-500"
                        : isDarkMode
                        ? "bg-gray-800"
                        : "bg-gray-100"
                    } border-2`}
                    animate={{
                      scale: currentStep === step ? [1, 1.1, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {step}
                  </motion.div>
                  <span className="ml-3 font-medium">
                    {step === 1 ? "Exam Info" : "Questions"}
                  </span>
                </motion.div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {currentStep === 1 ? (
                <motion.div
                  key="step1"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-6 space-y-6"
                >
                  <motion.div className="space-y-4" variants={questionVariants}>
                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          } mb-1`}
                        >
                          Exam Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={examData.title}
                          onChange={handleExamInfoChange}
                          className={`w-full px-4 py-2 rounded-xl border ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                              : "bg-white border-gray-200 focus:border-blue-500"
                          } focus:outline-none`}
                          placeholder="Enter exam title"
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          } mb-1`}
                        >
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={examData.description}
                          onChange={handleExamInfoChange}
                          rows="3"
                          className={`w-full px-4 py-2 rounded-xl border ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                              : "bg-white border-gray-200 focus:border-blue-500"
                          } focus:outline-none`}
                          placeholder="Describe the exam"
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          } mb-1`}
                        >
                          <Clock className="inline w-4 h-4 mr-1" />
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          name="duration_minutes"
                          value={examData.duration_minutes}
                          onChange={handleExamInfoChange}
                          className={`w-full px-4 py-2 rounded-xl border ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                              : "bg-white border-gray-200 focus:border-blue-500"
                          } focus:outline-none`}
                          min="1"
                        />
                      </div>

                      {/* Group Select */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-medium ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          Select Groups
                        </label>
                        <div
                          className={`grid grid-cols-1 md:grid-cols-2 gap-2 p-4 border rounded-xl ${
                            isDarkMode
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          {groups.map((group) => (
                            <div
                              key={group.id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={`group-${group.id}`}
                                checked={examData.groups.includes(group.id)}
                                onChange={() => handleGroupChange(group.id)}
                                className={`w-4 h-4 rounded border ${
                                  isDarkMode
                                    ? "border-gray-600 text-blue-400"
                                    : "border-gray-300 text-blue-600"
                                } focus:ring-blue-500`}
                              />
                              <label
                                htmlFor={`group-${group.id}`}
                                className={`text-sm cursor-pointer ${
                                  isDarkMode
                                    ? "text-gray-300 hover:text-white"
                                    : "text-gray-700 hover:text-gray-900"
                                }`}
                              >
                                {group.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        {examData.groups.length === 0 && (
                          <p className="text-sm text-red-500">
                            Please select at least one group
                          </p>
                        )}
                      </div>

                      {/* Module Select */}
                      <div>
                        <label
                          className={`block text-sm font-medium ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          } mb-1`}
                        >
                          Select Module
                        </label>
                        <select
                          name="module_id"
                          value={examData.module_id}
                          onChange={handleExamInfoChange}
                          className={`w-full px-4 py-2 rounded-xl border ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-200"
                          } focus:outline-none focus:border-blue-500`}
                          required
                        >
                          <option value="">Select a module</option>
                          {modules.map((module) => (
                            <option key={module.id} value={module.id}>
                              {module.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentStep(2)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                      Next: Add Questions
                    </motion.button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-6 space-y-6"
                >
                  <motion.div
                    className={`p-6 rounded-xl space-y-4 ${
                      isDarkMode ? "bg-gray-800" : "bg-gray-50"
                    }`}
                    variants={questionVariants}
                  >
                    {/* Question form fields */}
                    <div className="space-y-4">
                      {/* Question Type */}
                      <div>
                        <label
                          className={`block text-sm font-medium ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          } mb-1`}
                        >
                          Question Type
                        </label>
                        <select
                          name="type"
                          value={currentQuestion.type}
                          onChange={handleQuestionChange}
                          className={`w-full px-4 py-2 rounded-xl border ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-200"
                          } focus:outline-none focus:border-blue-500`}
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="open">Open Question</option>
                          <option value="code">Code Question</option>
                        </select>
                      </div>

                      {/* Question Points */}
                      <div>
                        <label
                          className={`block text-sm font-medium ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          } mb-1`}
                        >
                          Question Points
                        </label>
                        <input
                          type="number"
                          name="points"
                          value={currentQuestion.points}
                          onChange={handleQuestionChange}
                          min="1"
                          className={`w-full px-4 py-2 rounded-xl border ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-200"
                          } focus:outline-none focus:border-blue-500`}
                        />
                      </div>

                      {/* Question Text */}
                      <div>
                        <label
                          className={`block text-sm font-medium ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          } mb-1`}
                        >
                          Question Text
                        </label>
                        <textarea
                          name="text"
                          value={currentQuestion.text}
                          onChange={handleQuestionChange}
                          className={`w-full px-4 py-2 rounded-xl border ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-200"
                          } focus:outline-none focus:border-blue-500`}
                          placeholder="Enter your question"
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label
                          className={`block text-sm font-medium ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          } mb-1`}
                        >
                          Question Image (optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className={`w-full ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        />
                        {currentQuestion.image && (
                          <img
                            src={currentQuestion.image}
                            alt="Question"
                            className="mt-2 max-h-40 object-contain"
                          />
                        )}
                      </div>

                      {/* MCQ Options */}
                      {currentQuestion.type === "mcq" && (
                        <div>
                          <label
                            className={`block text-sm font-medium ${
                              isDarkMode ? "text-gray-200" : "text-gray-700"
                            } mb-1`}
                          >
                            Options (check all correct answers)
                          </label>
                          <div className="max-h-60 overflow-y-auto">
                            {currentQuestion.options.map((option, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 mb-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={option.isCorrect}
                                  onChange={() =>
                                    handleCorrectAnswerChange(index)
                                  }
                                  className={`w-4 h-4 ${
                                    isDarkMode
                                      ? "text-blue-400 border-gray-600"
                                      : "text-blue-600 border-gray-300"
                                  }`}
                                />
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) =>
                                    handleOptionChange(index, e.target.value)
                                  }
                                  className={`flex-1 px-4 py-2 rounded-xl border ${
                                    isDarkMode
                                      ? "bg-gray-700 border-gray-600 text-white"
                                      : "bg-white border-gray-200"
                                  } focus:outline-none focus:border-blue-500`}
                                  placeholder={`Option ${index + 1}`}
                                />
                                {currentQuestion.options.length > 2 && (
                                  <button
                                    onClick={() => removeOption(index)}
                                    className={`${
                                      isDarkMode
                                        ? "text-red-400 hover:text-red-300"
                                        : "text-red-500 hover:text-red-600"
                                    }`}
                                  >
                                    <MinusCircle className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={addOption}
                            className={`flex items-center gap-1 mt-2 ${
                              isDarkMode
                                ? "text-blue-400 hover:text-blue-300"
                                : "text-blue-600 hover:text-blue-700"
                            }`}
                          >
                            <PlusCircle className="w-5 h-5" />
                            Add Option
                          </button>
                        </div>
                      )}

                      <button
                        onClick={addQuestion}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Add Question
                      </button>
                    </div>
                  </motion.div>

                  <div className="space-y-4">
                    <h3
                      className={`font-medium ${
                        isDarkMode ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      Added Questions ({examData.questions.length})
                    </h3>
                    <AnimatePresence>
                      {examData.questions.map((question, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 ${
                            isDarkMode ? "bg-gray-800" : "bg-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4
                              className={`font-medium ${
                                isDarkMode ? "text-gray-200" : "text-gray-900"
                              }`}
                            >
                              Question {index + 1}
                            </h4>
                            <button
                              onClick={() => removeQuestion(index)}
                              className={`${
                                isDarkMode
                                  ? "text-red-400 hover:text-red-300"
                                  : "text-red-500 hover:text-red-600"
                              }`}
                            >
                              <MinusCircle className="w-5 h-5" />
                            </button>
                          </div>
                          <p
                            className={
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }
                          >
                            {question.text}
                          </p>
                          <ul className="mt-2 space-y-1">
                            {question.options.map((option, optIndex) => (
                              <li
                                key={optIndex}
                                className={
                                  option.isCorrect
                                    ? isDarkMode
                                      ? "text-green-400 font-medium"
                                      : "text-green-600 font-medium"
                                    : isDarkMode
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }
                              >
                                {option.text} {option.isCorrect && "✓"}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentStep(1)}
                      className={`flex-1 py-3 rounded-xl transition-colors duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                      disabled={examData.questions.length === 0}
                    >
                      Create Exam
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamCreator;
