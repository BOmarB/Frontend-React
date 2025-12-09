import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Clock,
  Save,
  Edit,
  Trash,
  PlusCircle,
  XCircle,
  Check,
} from "lucide-react";
import { useTheme } from "../../contexts/themeContext";
import { Transition } from "@headlessui/react";
import {
  editExam,
  examUpdate,
  createQuestion,
} from "../../services/userService";
import { motion, AnimatePresence } from "framer-motion";

const ExamEditor = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const { isDarkMode } = useTheme();
  const [examData, setExamData] = useState({
    id: "",
    title: "",
    description: "",
    duration_minutes: 60,
    questions: [],
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    id: null,
    text: "",
    points: 1,
    type: "mcq",
    image: null,
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Fetch exam data on component mount or when examId changes
  useEffect(() => {
    const loadExam = async () => {
      try {
        setLoading(true);
        const response = await editExam(examId, user.id);

        if (response.success) {
          setExamData({
            ...response.exam,
            questions: JSON.parse(response.exam.questions), // Parse questions immediately
          });
        } else {
          setError(response.message || "Failed to load exam");
        }
      } catch (err) {
        setError(err.message || "Error loading exam");
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId, user.id]);

  // Handle changes in exam info fields
  const handleExamInfoChange = (e) => {
    const { name, value } = e.target;
    setExamData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Show a notification and hide it after 5 seconds
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  // Handle form submission to update exam
  const handleSubmit = async () => {
    try {
      // Validate that the questions are properly formatted
      const questionsToSave = examData.questions.map((q) => {
        // Make a safe copy of the question
        const safeQuestion = { ...q };

        // Ensure MCQ questions have options
        if (
          safeQuestion.type === "mcq" &&
          (!safeQuestion.options || !Array.isArray(safeQuestion.options))
        ) {
          safeQuestion.options = [
            { text: "Option 1", isCorrect: true },
            { text: "Option 2", isCorrect: false },
          ];
        }

        // Remove options for non-MCQ questions to save space
        if (safeQuestion.type !== "mcq") {
          safeQuestion.options = [];
        }

        return safeQuestion;
      });

      // Log the data being sent for debugging
      console.log("Sending exam update with data:", {
        id: examId,
        teacher_id: user.id,
        title: examData.title,
        description: examData.description,
        duration_minutes: examData.duration_minutes,
        questions: questionsToSave, // Send the actual questions array, not stringify
      });

      const response = await examUpdate({
        id: examId,
        teacher_id: user.id,
        title: examData.title,
        description: examData.description,
        duration_minutes: examData.duration_minutes,
        questions: questionsToSave, // Send the actual questions array, not stringify
      });

      if (response.success) {
        showNotification("Exam updated successfully", "success");
        setTimeout(() => navigate("/teacher"), 2000);
      } else {
        showNotification(response.message || "Failed to update exam", "error");
      }
    } catch (err) {
      console.error("Error updating exam:", err);
      showNotification(err.message || "Error updating exam", "error");
    }
  };

  // Question editing functions
  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);

    // Create a safe copy of the question with proper defaults
    let questionToEdit = { ...examData.questions[index] };

    // Ensure options exist for MCQ type
    if (
      questionToEdit.type === "mcq" &&
      (!questionToEdit.options || !Array.isArray(questionToEdit.options))
    ) {
      questionToEdit.options = [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ];
    }

    setCurrentQuestion(questionToEdit);
    setShowQuestionModal(true);
    setIsAddingQuestion(false);
  };

  const handleAddQuestion = () => {
    setCurrentQuestion({
      id: null,
      text: "",
      points: 1,
      type: "mcq",
      image: null,
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
    setShowQuestionModal(true);
    setIsAddingQuestion(true);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = [...examData.questions];
    newQuestions.splice(index, 1);
    setExamData({
      ...examData,
      questions: newQuestions,
    });
    showNotification("Question removed", "success");
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;

    // When switching question types, ensure options are properly handled
    if (name === "type") {
      if (
        value === "mcq" &&
        (!currentQuestion.options || !currentQuestion.options.length)
      ) {
        // If switching to MCQ and no options exist, add default options
        setCurrentQuestion({
          ...currentQuestion,
          [name]: value,
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        });
        return;
      }
    }

    setCurrentQuestion({
      ...currentQuestion,
      [name]: value,
    });
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
    } else {
      showNotification("Question must have at least 2 options", "error");
    }
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

  const saveQuestion = () => {
    // Validate question
    if (!currentQuestion.text.trim()) {
      showNotification("Question text is required", "error");
      return;
    }

    if (currentQuestion.type === "mcq") {
      if (!currentQuestion.options.some((opt) => opt.isCorrect)) {
        showNotification("Please mark at least one correct answer", "error");
        return;
      }
      if (currentQuestion.options.some((opt) => !opt.text.trim())) {
        showNotification("All options must have text", "error");
        return;
      }
    }

    // Update or add question to exam data
    const newQuestions = [...examData.questions];

    if (isAddingQuestion) {
      newQuestions.push(currentQuestion);
    } else {
      newQuestions[editingQuestionIndex] = currentQuestion;
    }

    setExamData({
      ...examData,
      questions: newQuestions,
    });

    // Close modal
    setShowQuestionModal(false);
    showNotification(
      isAddingQuestion
        ? "Question added successfully"
        : "Question updated successfully",
      "success"
    );
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
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } py-8`}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Notification Banner */}
        {notification.message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              notification.type === "success"
                ? isDarkMode
                  ? "bg-green-900/30 text-green-400 border border-green-800"
                  : "bg-green-100 text-green-800"
                : isDarkMode
                ? "bg-red-900/30 text-red-400 border border-red-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Exam Editor Form */}
        <div
          className={`${
            isDarkMode ? "bg-gray-900 border border-gray-800" : "bg-white"
          } rounded-xl shadow-lg overflow-hidden`}
        >
          <div className="p-6 space-y-6">
            {/* Exam Title */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Exam Title
              </label>
              <input
                type="text"
                name="title"
                value={examData.title}
                onChange={handleExamInfoChange}
                className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-800 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } border`}
                placeholder="Enter exam title"
              />
            </div>

            {/* Exam Description */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Description
              </label>
              <textarea
                name="description"
                value={examData.description}
                onChange={handleExamInfoChange}
                rows="3"
                className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-800 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } border`}
                placeholder="Describe the exam"
              />
            </div>

            {/* Exam Duration */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
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
                className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-800 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } border`}
                min="1"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/teacher")}
                className={`flex-1 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/50
                  ${
                    isDarkMode
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <Save className="inline w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>

          {/* Exam Questions Section */}
          <div
            className={`border-t ${
              isDarkMode ? "border-gray-800" : "border-gray-200"
            } p-6`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={`font-medium ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Exam Questions ({examData.questions.length})
              </h3>
              <button
                onClick={handleAddQuestion}
                className={`flex items-center px-3 py-1 rounded-lg ${
                  isDarkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Question
              </button>
            </div>
            <div className="space-y-4">
              {examData.questions.map((question, index) => (
                <div
                  key={index}
                  className={`${
                    isDarkMode ? "bg-gray-800" : "bg-gray-50"
                  } p-4 rounded-lg
                    ${isDarkMode ? "border border-gray-700" : ""}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4
                      className={`font-medium ${
                        isDarkMode ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      Question {index + 1} ({question.type || "unknown"})
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditQuestion(index)}
                        className={`p-1 rounded ${
                          isDarkMode
                            ? "text-blue-400 hover:bg-gray-700"
                            : "text-blue-600 hover:bg-gray-200"
                        }`}
                        title="Edit question"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveQuestion(index)}
                        className={`p-1 rounded ${
                          isDarkMode
                            ? "text-red-400 hover:bg-gray-700"
                            : "text-red-600 hover:bg-gray-200"
                        }`}
                        title="Remove question"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                    {question.text}
                  </p>
                  {question.image && (
                    <div className="mt-2">
                      <img
                        src={question.image}
                        alt="Question"
                        className="max-h-40 object-contain rounded"
                      />
                    </div>
                  )}
                  <div className="mt-2">
                    <span
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Points: {question.points}
                    </span>
                  </div>
                  {question.type === "mcq" &&
                  question.options &&
                  Array.isArray(question.options) &&
                  question.options.length > 0 ? (
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
                          {option.text} {option.isCorrect ? "✓" : "❌"}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
              {examData.questions.length === 0 && (
                <div
                  className={`p-4 text-center rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-gray-400"
                      : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}
                >
                  No questions added yet. Click "Add Question" to create a
                  question.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Edit Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowQuestionModal(false)}
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative z-10 max-w-2xl w-full mx-4 p-6 rounded-xl shadow-xl ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {isAddingQuestion ? "Add New Question" : "Edit Question"}
                </h3>
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className={`p-1 rounded-full ${
                    isDarkMode
                      ? "text-gray-400 hover:bg-gray-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Question Text
                  </label>
                  <textarea
                    name="text"
                    value={currentQuestion.text}
                    onChange={handleQuestionChange}
                    rows="3"
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50
                      ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-gray-100"
                          : "bg-white border-gray-300 text-gray-900"
                      } border`}
                    placeholder="Enter your question"
                  />
                </div>

                {/* Question Image */}
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Question Image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={`w-full ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  />
                  {currentQuestion.image && (
                    <div className="mt-2">
                      <img
                        src={currentQuestion.image}
                        alt="Question"
                        className="max-h-40 object-contain rounded"
                      />
                      <button
                        onClick={() =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            image: null,
                          })
                        }
                        className={`mt-1 text-sm ${
                          isDarkMode ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>

                {/* Question Points */}
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Points
                  </label>
                  <input
                    type="number"
                    name="points"
                    value={currentQuestion.points}
                    onChange={handleQuestionChange}
                    min="1"
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50
                      ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-gray-100"
                          : "bg-white border-gray-300 text-gray-900"
                      } border`}
                  />
                </div>

                {/* Question Type */}
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Question Type
                  </label>
                  <select
                    name="type"
                    value={currentQuestion.type}
                    onChange={handleQuestionChange}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50
                      ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-gray-100"
                          : "bg-white border-gray-300 text-gray-900"
                      } border`}
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="open">Open Question</option>
                    <option value="code">Code</option>
                  </select>
                </div>

                {/* Question Options (for MCQ) */}
                {currentQuestion.type === "mcq" && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label
                        className={`block text-sm font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Options
                      </label>
                      <button
                        onClick={addOption}
                        className={`text-sm px-2 py-1 rounded ${
                          isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={option.isCorrect}
                            onChange={() => handleCorrectAnswerChange(index)}
                            className={`w-4 h-4 ${
                              isDarkMode ? "accent-blue-400" : "accent-blue-600"
                            }`}
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value)
                            }
                            placeholder={`Option ${index + 1}`}
                            className={`flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50
                              ${
                                isDarkMode
                                  ? "bg-gray-700 border-gray-600 text-gray-100"
                                  : "bg-white border-gray-300 text-gray-900"
                              } border`}
                          />
                          <button
                            onClick={() => removeOption(index)}
                            disabled={currentQuestion.options.length <= 2}
                            className={`p-1 rounded ${
                              currentQuestion.options.length <= 2
                                ? isDarkMode
                                  ? "text-gray-500"
                                  : "text-gray-400"
                                : isDarkMode
                                ? "text-red-400 hover:bg-gray-700"
                                : "text-red-600 hover:bg-gray-200"
                            }`}
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowQuestionModal(false)}
                    className={`px-4 py-2 rounded-lg ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4 inline mr-1" />
                    {isAddingQuestion ? "Add Question" : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamEditor;
