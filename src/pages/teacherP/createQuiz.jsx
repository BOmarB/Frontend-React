import React, { useState, useEffect } from "react";
import {
  Brain,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Clock,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllGroups,
  getAllModules,
  createQuiz,
} from "../../services/userService";
import { useTheme } from "../../contexts/themeContext";
import { useNavigate } from "react-router-dom";

const CreateQuiz = () => {
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [groups, setGroups] = useState([]);
  const [modules, setModules] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 15,
    module_id: "",
    groups: [],
    is_aa_quiz: 1,
    max_attempts: 3,
    questions: [],
  });
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const questionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsResponse, modulesResponse] = await Promise.all([
          getAllGroups(),
          getAllModules(),
        ]);
        setGroups(groupsResponse.groups);
        setModules(modulesResponse.modules);
      } catch (error) {
        showNotification("Error fetching data: " + error.message, "error");
      }
    };
    fetchData();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: "",
          points: 1,
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
    }));
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.push({ text: "", isCorrect: false });
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
    showNotification("Question removed successfully", "success");
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options = newQuestions[
        questionIndex
      ].options.filter((_, i) => i !== optionIndex);
      setFormData({ ...formData, questions: newQuestions });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createQuiz(formData);
      if (response.success) {
        showNotification("Quiz created successfully!", "success");
        // Reset form or navigate away
      }
    } catch (error) {
      showNotification("Error creating quiz: " + error.message, "error");
    }
  };

  return (
    <div
      className={`min-h-screen py-8 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
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
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-10 ${
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
            className={`rounded-xl shadow-sm overflow-hidden ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-100"
            }`}
          >
            {/* Progress Steps */}
            <div
              className={`flex justify-between p-6 border-b ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              {[1, 2].map((step) => (
                <motion.div
                  key={step}
                  className={`flex items-center ${
                    currentStep === step
                      ? isDarkMode
                        ? "text-blue-400"
                        : "text-blue-600"
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
                          ? "bg-blue-900 border-2 border-blue-400"
                          : "bg-blue-100 border-2 border-blue-500"
                        : isDarkMode
                        ? "bg-gray-700"
                        : "bg-gray-100"
                    }`}
                    animate={{
                      scale: currentStep === step ? [1, 1.1, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {step}
                  </motion.div>
                  <span className="ml-3 font-medium">
                    {step === 1 ? "Quiz Info" : "Questions"}
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
                  <div className="space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Quiz Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-xl focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                            : "bg-white border-gray-200 focus:border-blue-500"
                        }`}
                        required
                        placeholder="Enter exam title"
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 rounded-xl focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                            : "bg-white border-gray-200 focus:border-blue-500"
                        }`}
                        rows="3"
                        required
                        placeholder="Describe the exam"
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        <Clock className="inline w-4 h-4 mr-1" />
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration_minutes: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 rounded-xl focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                            : "bg-white border-gray-200 focus:border-blue-500"
                        }`}
                        min="1"
                        required
                      />
                    </div>

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
                              checked={formData.groups.includes(group.id)}
                              onChange={() => {
                                const newGroups = formData.groups.includes(
                                  group.id
                                )
                                  ? formData.groups.filter(
                                      (id) => id !== group.id
                                    )
                                  : [...formData.groups, group.id];
                                setFormData({ ...formData, groups: newGroups });
                              }}
                              className={`w-4 h-4 rounded border-gray-300 ${
                                isDarkMode
                                  ? "text-blue-400 focus:ring-blue-400"
                                  : "text-blue-600 focus:ring-blue-500"
                              }`}
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
                      {formData.groups.length === 0 && (
                        <p className="text-sm text-red-500">
                          Please select at least one group
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Module
                      </label>
                      <select
                        value={formData.module_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            module_id: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 rounded-xl focus:outline-none ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                            : "bg-white border-gray-200 focus:border-blue-500"
                        }`}
                        required
                      >
                        <option value="">Select Module</option>
                        {modules.map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentStep(2)}
                      className={`w-full py-3 text-white rounded-xl transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-lg hover:shadow-blue-500/20"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg"
                      }`}
                    >
                      Next: Add Questions
                    </motion.button>
                  </div>
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
                  <motion.div variants={questionVariants} className="space-y-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addQuestion}
                      className={`w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <PlusCircle className="w-5 h-5 mr-2" /> Add Question
                    </motion.button>

                    <AnimatePresence>
                      {formData.questions.map((question, qIndex) => (
                        <motion.div
                          key={qIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`rounded-xl shadow-sm p-6 space-y-4 ${
                            isDarkMode ? "bg-gray-800" : "bg-white"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h3
                              className={`text-lg font-medium ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Question {qIndex + 1}
                            </h3>
                            <button
                              onClick={() => removeQuestion(qIndex)}
                              className={
                                isDarkMode
                                  ? "text-red-400 hover:text-red-300"
                                  : "text-red-500 hover:text-red-600"
                              }
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            {/* Question fields */}
                            <div>
                              <label
                                className={`block text-sm font-medium mb-1 ${
                                  isDarkMode ? "text-gray-200" : "text-gray-700"
                                }`}
                              >
                                Question Text
                              </label>
                              <textarea
                                value={question.question_text}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    qIndex,
                                    "question_text",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-4 py-2 rounded-xl focus:outline-none ${
                                  isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                                    : "bg-white border-gray-200 focus:border-blue-500"
                                }`}
                                rows="2"
                                required
                              />
                            </div>

                            <div>
                              <label
                                className={`block text-sm font-medium mb-1 ${
                                  isDarkMode ? "text-gray-200" : "text-gray-700"
                                }`}
                              >
                                Points
                              </label>
                              <input
                                type="number"
                                value={question.points}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    qIndex,
                                    "points",
                                    e.target.value
                                  )
                                }
                                className={`w-32 px-4 py-2 rounded-xl focus:outline-none ${
                                  isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                                    : "bg-white border-gray-200 focus:border-blue-500"
                                }`}
                                min="1"
                                required
                              />
                            </div>

                            <div className="space-y-3">
                              {question.options.map((option, oIndex) => (
                                <div
                                  key={oIndex}
                                  className="flex items-center space-x-4"
                                >
                                  <input
                                    type="checkbox"
                                    checked={option.isCorrect}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        qIndex,
                                        oIndex,
                                        "isCorrect",
                                        e.target.checked
                                      )
                                    }
                                    className={`w-4 h-4 rounded ${
                                      isDarkMode
                                        ? "text-blue-400 border-gray-600"
                                        : "text-blue-600 border-gray-300"
                                    }`}
                                  />
                                  <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        qIndex,
                                        oIndex,
                                        "text",
                                        e.target.value
                                      )
                                    }
                                    className={`flex-1 px-4 py-2 rounded-xl focus:outline-none ${
                                      isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                                        : "bg-white border-gray-200 focus:border-blue-500"
                                    }`}
                                    placeholder={`Option ${oIndex + 1}`}
                                    required
                                  />
                                  {question.options.length > 2 && (
                                    <button
                                      onClick={() =>
                                        removeOption(qIndex, oIndex)
                                      }
                                      className={
                                        isDarkMode
                                          ? "text-red-400 hover:text-red-300"
                                          : "text-red-500 hover:text-red-600"
                                      }
                                    >
                                      <MinusCircle className="w-5 h-5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            <button
                              onClick={() => addOption(qIndex)}
                              className={`flex items-center ${
                                isDarkMode
                                  ? "text-blue-400 hover:text-blue-300"
                                  : "text-blue-600 hover:text-blue-800"
                              }`}
                            >
                              <PlusCircle className="w-4 h-4 mr-1" /> Add Option
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

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
                      className={`flex-1 py-3 text-white rounded-xl transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-lg hover:shadow-blue-500/20"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg"
                      }`}
                      disabled={formData.questions.length === 0}
                    >
                      Create Quiz
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

export default CreateQuiz;
