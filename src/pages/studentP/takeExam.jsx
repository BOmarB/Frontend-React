import React, { useState, useEffect, useCallback } from "react";

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Clock, AlertTriangle, Check, Flag, Menu } from "lucide-react";
import {
  createAttempt,
  getExamQuestions,
  submitExamApi,
  verifyExamAttempt,
} from "../../services/userService";
import { Highlight } from "prism-react-renderer";
import { useTheme } from "../../contexts/themeContext";
import ExamFullScreenHandler from "../../components/ExamFullScreenHandler ";

const LANGUAGE_RULES = {
  python: {
    indentSize: 4,
    indentChar: " ",
    openBrackets: ["{", "[", "("],
    closeBrackets: ["}", "]", ")"],
    blockStarters: [
      "if",
      "for",
      "while",
      "def",
      "class",
      "with",
      "try",
      "except",
      "finally",
      "elif",
      "else:",
    ],
    newlineAfter: [":"],
    maxLineLength: 80,
    operatorLineBreak: true,
  },
  javascript: {
    indentSize: 2,
    indentChar: " ",
    openBrackets: ["{", "[", "("],
    closeBrackets: ["}", "]", ")"],
    blockStarters: [
      "if",
      "for",
      "while",
      "function",
      "class",
      "try",
      "catch",
      "finally",
      "else",
    ],
    newlineAfter: ["{"],
    maxLineLength: 80,
    operatorLineBreak: true,
  },
};

// Available programming languages
const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "php", label: "PHP" },
];

const formatCode = (code, language) => {
  const rules = LANGUAGE_RULES[language];
  if (!rules) return code;

  const lines = code.split("\n");
  let formattedLines = [];
  let indentLevel = 0;
  let bracketStack = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // Handle closing brackets
    while (rules.closeBrackets.includes(line[0]) && bracketStack.length > 0) {
      indentLevel = Math.max(0, indentLevel - 1);
      bracketStack.pop();
    }

    // Add current indentation
    let formattedLine =
      rules.indentChar.repeat(rules.indentSize * indentLevel) + line;

    // Handle line length limits
    if (formattedLine.length > rules.maxLineLength) {
      // Split long lines at appropriate points
      formattedLine = splitLongLine(formattedLine, rules);
    }

    formattedLines.push(formattedLine);

    // Track brackets and adjust indent level
    for (let char of line) {
      if (rules.openBrackets.includes(char)) {
        bracketStack.push(char);
        indentLevel++;
      } else if (rules.closeBrackets.includes(char)) {
        bracketStack.pop();
      }
    }

    // Handle block starters
    if (
      rules.blockStarters.some((starter) => line.includes(starter)) ||
      rules.newlineAfter.some((char) => line.endsWith(char))
    ) {
      indentLevel++;
    }
  }

  return formattedLines.join("\n");
};

// Split long lines function
const splitLongLine = (line, rules) => {
  const indent = line.match(/^\s*/)[0];
  const content = line.trim();

  // Split on operators if enabled
  if (rules.operatorLineBreak) {
    const operators = ["+", "-", "*", "/", "&&", "||", "="];
    let parts = [];
    let currentPart = "";

    const tokens = content.split(/(\s*[+\-*/=&|]+\s*)/);

    for (let token of tokens) {
      if (currentPart.length + token.length > rules.maxLineLength) {
        parts.push(currentPart.trim());
        currentPart =
          indent + rules.indentChar.repeat(rules.indentSize) + token;
      } else {
        currentPart += token;
      }
    }

    if (currentPart) {
      parts.push(currentPart.trim());
    }

    return parts.join("\n");
  }

  return line;
};

// Enhanced CodeEditor component

const CodeEditor = React.memo(({ value, onChange, language, question }) => {
  const [cursorPosition, setCursorPosition] = useState(0);
  const { isDarkMode } = useTheme();
  const textareaRef = React.useRef(null);

  const handleFormat = useCallback(() => {
    const formattedCode = formatCode(value || "", language);
    onChange(formattedCode);
  }, [value, language, onChange]);

  const handleKeyDown = useCallback(
    (e) => {
      const rules = LANGUAGE_RULES[language];
      if (!rules) return;

      const textarea = e.target;
      const { value, selectionStart, selectionEnd } = textarea;

      // Prevent arrow key event propagation to stop question navigation
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        // Don't call preventDefault as we want normal cursor movement in the editor
        e.stopPropagation(); // Stop the event from bubbling up
      }

      // Format code shortcut
      if (e.shiftKey && e.altKey && e.key === "F") {
        e.preventDefault();
        handleFormat();
        return;
      }

      // For Backspace and Delete, let the default behavior work
      if (e.key === "Backspace" || e.key === "Delete") {
        // Don't call preventDefault() here to allow normal deletion
        return;
      }

      // Handle Enter key
      if (e.key === "Enter") {
        e.preventDefault();

        const lines = value.split("\n");
        const currentLineIndex =
          value.slice(0, selectionStart).split("\n").length - 1;
        const currentLine = lines[currentLineIndex];

        let indentLevel =
          currentLine.match(/^\s*/)[0].length / rules.indentSize;

        // Increase indent if line ends with block starter
        if (
          rules.blockStarters.some((starter) =>
            currentLine.trim().endsWith(starter)
          ) ||
          rules.newlineAfter.some((char) => currentLine.trim().endsWith(char))
        ) {
          indentLevel++;
        }

        const indent = rules.indentChar.repeat(rules.indentSize * indentLevel);
        const newValue =
          value.slice(0, selectionStart) +
          "\n" +
          indent +
          value.slice(selectionStart);
        onChange(newValue);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + 1 + indent.length;
        }, 0);
      }

      // Handle Tab key
      else if (e.key === "Tab") {
        e.preventDefault();
        const indent = rules.indentChar.repeat(rules.indentSize);
        const newValue =
          value.slice(0, selectionStart) + indent + value.slice(selectionStart);
        onChange(newValue);

        // Set cursor position after indent
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + indent.length;
        }, 0);
      }

      // Auto-closing brackets
      // Define bracketPairs before using it
      const bracketPairs = {
        "{": "}",
        "[": "]",
        "(": ")",
        '"': '"',
        "'": "'",
      };

      if (Object.keys(bracketPairs).includes(e.key)) {
        e.preventDefault();
        const closingBracket = bracketPairs[e.key];

        // If text is selected, wrap it in brackets
        if (selectionStart !== selectionEnd) {
          const selectedText = value.slice(selectionStart, selectionEnd);
          const newValue =
            value.slice(0, selectionStart) +
            e.key +
            selectedText +
            closingBracket +
            value.slice(selectionEnd);
          onChange(newValue);

          // Position cursor after the closing bracket
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionEnd + 2; // +2 for both brackets
          }, 0);
        } else {
          // No selection, just insert brackets and position cursor between them
          const newValue =
            value.slice(0, selectionStart) +
            e.key +
            closingBracket +
            value.slice(selectionStart);
          onChange(newValue);

          // Set cursor position between brackets
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd =
              selectionStart + 1;
          }, 0);
        }
      }
    },
    [language, value, onChange, handleFormat]
  );

  return (
    <div
      className={`relative border rounded-lg overflow-hidden ${
        isDarkMode ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div
        className={`sticky top-0 z-10 border-b px-4 py-2 flex justify-between items-center ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <span
          className={`text-sm select-none ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Press Shift + Alt + F to format code
        </span>
        <button
          onClick={handleFormat}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Format Code
        </button>
      </div>
      <Highlight code={value || ""} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <div className="relative">
            <pre
              className={`${className} p-4 min-h-[200px] overflow-auto bg-gray-900 `}
              style={style}
            >
              <textarea
                ref={textareaRef}
                value={value || ""}
                onChange={(e) => {
                  onChange(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className={`absolute inset-0 w-full h-full p-4 font-mono text-transparent bg-transparent resize-none outline-none ${
                  isDarkMode ? "caret-gray-300" : "caret-gray-900"
                }`}
                spellCheck="false"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                key={`editor-${question.id}`}
              />
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          </div>
        )}
      </Highlight>
    </div>
  );
});

export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [attemptCreated, setAttemptCreated] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem(`exam_${examId}_answers`);
    return saved ? JSON.parse(saved) : {};
  });
  const [flaggedQuestions, setFlaggedQuestions] = useState(() => {
    const storedFlags = sessionStorage.getItem(`exam_${examId}_flags`);
    return storedFlags ? JSON.parse(storedFlags) : [];
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const storedTime = sessionStorage.getItem(`exam_${examId}_time_left`);
    return storedTime ? parseInt(storedTime) : null;
  });
  const [selectedLanguages, setSelectedLanguages] = useState(() => {
    const langs = sessionStorage.getItem(`exam_${examId}_languages`);
    return langs ? JSON.parse(langs) : {};
  });

  // Set up navigation prevention with a simpler approach to avoid throttling
  useEffect(() => {
    const currentPath = location.pathname;

    // Handle navigation attempts
    const handleBeforeUnload = (e) => {
      // Show confirmation dialog
      e.preventDefault();
      e.returnValue =
        "Are you sure you want to leave? Your exam progress may be lost.";
      return e.returnValue;
    };

    // Add event listener for beforeunload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Add a single history entry to prevent back navigation
    window.history.pushState({ exam: true }, "", currentPath);

    // Handle back button
    const handlePopState = (e) => {
      if (!e.state?.exam) {
        // If user tries to go back, push again to stay on exam
        window.history.pushState({ exam: true }, "", currentPath);
      }
    };

    window.addEventListener("popstate", handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location.pathname]);

  useEffect(() => {
    const verifyAndCleanup = async () => {
      try {
        // When loading the exam page, always clear completion status to ensure UI works properly
        localStorage.removeItem(`exam_${examId}_completed`);

        const storedAttemptId = sessionStorage.getItem(
          `exam_${examId}_attempt`
        );
        let currentAttemptId = storedAttemptId;

        if (storedAttemptId) {
          try {
            const verifyResponse = await verifyExamAttempt(storedAttemptId);

            if (!verifyResponse.valid) {
              // Attempt is invalid - clean up and create a new one
              console.log("Invalid attempt - creating new");
              sessionStorage.removeItem(`exam_${examId}_attempt`);
              currentAttemptId = await createExamAttempt();
            } else if (verifyResponse.status === "completed") {
              // This particular attempt is already completed
              console.log("This attempt was already completed");

              // Instead of automatically creating a new attempt, redirect to the student dashboard
              sessionStorage.removeItem(`exam_${examId}_attempt`);
              // Remove all exam-related session storage items
              clearExamStorage();
              navigate("/student");
              return;
            } else if (verifyResponse.status === "in_progress") {
              // Valid in-progress attempt - continue with it
              console.log("Valid in-progress attempt - continuing");
              setAttemptId(storedAttemptId);
              setAttemptCreated(true);
            }
          } catch (error) {
            console.error("Error verifying attempt:", error);
            // On error, clear and create new
            sessionStorage.removeItem(`exam_${examId}_attempt`);
            currentAttemptId = await createExamAttempt();
          }
        } else {
          // No stored attempt - create a new one
          console.log("No stored attempt - creating new");
          currentAttemptId = await createExamAttempt();
        }

        // Only fetch questions if we have a valid attempt
        if (currentAttemptId) {
          await fetchQuestions();
        } else {
          setError(
            "Could not create or verify exam attempt. Please try again."
          );
        }
      } catch (err) {
        console.error("Error in exam initialization:", err);
        setError("Error initializing exam. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyAndCleanup();
  }, [examId, navigate]);
  // Load flagged questions from session storage
  useEffect(() => {
    const storedFlags = sessionStorage.getItem(`exam_${examId}_flags`);
    if (storedFlags) {
      setFlaggedQuestions(JSON.parse(storedFlags));
    }
  }, [examId]);

  // Save indicator timer
  useEffect(() => {
    let timer;
    if (saveIndicator) {
      timer = setTimeout(() => setSaveIndicator(""), 2000);
    }
    return () => clearTimeout(timer);
  }, [saveIndicator]);

  // Add this to prevent unnecessary re-renders

  const handleAnswerChange = useCallback(
    (questionId, answer, type, language = null) => {
      setAnswers((prev) => {
        const newAnswers = {
          ...prev,
          [questionId]: {
            answer_text: type === "mcq" ? null : answer,
            selected_options: type === "mcq" ? answer : null,
            language: type === "code" ? language : null,
          },
        };

        // Sync immediately with sessionStorage
        sessionStorage.setItem(
          `exam_${examId}_answers`,
          JSON.stringify(newAnswers)
        );
        return newAnswers;
      });

      if (language) {
        setSelectedLanguages((prev) => {
          const newLangs = { ...prev, [questionId]: language };
          sessionStorage.setItem(
            `exam_${examId}_languages`,
            JSON.stringify(newLangs)
          );
          return newLangs;
        });
      }
    },
    [examId]
  );
  const handleLanguageChange = (questionId, event) => {
    const language = event.target.value;
    setSelectedLanguages((prev) => ({
      ...prev,
      [questionId]: language,
    }));

    // Update answer with new language
    if (answers[questionId]) {
      handleAnswerChange(
        questionId,
        answers[questionId].answer_text,
        "code",
        language
      );
    }
  };

  const renderQuestionInput = (question) => {
    switch (question.question_type) {
      case "mcq":
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  isDarkMode
                    ? "hover:bg-gray-700 border-gray-700"
                    : "hover:bg-gray-50 border-gray-200"
                }`}
              >
                <input
                  type="checkbox"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={answers[question.id]?.selected_options?.includes(
                    option.id
                  )}
                  onChange={() => handleMCQAnswer(question.id, option.id)}
                  className={`mr-3 ${isDarkMode ? "accent-black" : ""}`}
                />
                <span
                  className={`focus:text-gray-900 ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {option.text}
                </span>
              </label>
            ))}
          </div>
        );

      case "code":
        const currentLanguage = selectedLanguages[question.id] || "javascript";
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label
                className={`text-sm font-medium  ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Select Language:
              </label>
              <select
                value={currentLanguage}
                onChange={(e) => handleLanguageChange(question.id, e)}
                className={`w-48 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <CodeEditor
              value={answers[question.id]?.answer_text || ""}
              onChange={(value) => {
                // Use direct update without debouncing
                handleAnswerChange(question.id, value, "code", currentLanguage);
              }}
              language={currentLanguage}
              question={question}
              key={`editor-${question.id}`} // Simplified key
            />
          </div>
        );

      default:
        return (
          <textarea
            value={answers[question.id]?.answer_text || ""}
            onChange={(e) => handleTextAnswer(question.id, e.target.value)}
            onKeyDown={(e) => {
              // Prevent arrow key event propagation to stop question navigation
              if (
                ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  e.key
                )
              ) {
                e.stopPropagation();
              }
            }}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isDarkMode
                ? "bg-gray-700 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
            rows={question.question_type === "open" ? 6 : 2}
            placeholder="Type your answer here..."
          />
        );
    }
  };

  const toggleFlagQuestion = (questionId) => {
    const newFlagged = flaggedQuestions.includes(questionId)
      ? flaggedQuestions.filter((id) => id !== questionId)
      : [...flaggedQuestions, questionId];

    setFlaggedQuestions(newFlagged);
    sessionStorage.setItem(`exam_${examId}_flags`, JSON.stringify(newFlagged));
  };

  const getQuestionStatus = (questionId) => {
    const isAnswered =
      !!answers[questionId]?.answer_text ||
      answers[questionId]?.selected_options?.length > 0;
    const isFlagged = flaggedQuestions.includes(questionId);
    return { isAnswered, isFlagged };
  };

  // Navigation sidebar component
  const QuestionNavigator = () => {
    const { isDarkMode } = useTheme();

    return (
      <div
        className={`fixed right-0 top-0 h-full shadow-lg transition-transform duration-300 transform 
        ${showSidebar ? "translate-x-0" : "translate-x-full"} w-64 z-20 p-4
        ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3
            className={`font-semibold ${
              isDarkMode ? "text-gray-200" : "text-gray-900"
            }`}
          >
            Questions
          </h3>
          <button
            onClick={() => setShowSidebar(false)}
            className={`p-2 rounded hover:bg-opacity-80 ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {questions.map((_, index) => {
            const status = getQuestionStatus(questions[index].id);
            return (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setShowSidebar(false);
                }}
                className={`p-2 rounded ${
                  status.isAnswered
                    ? isDarkMode
                      ? "bg-green-900 text-green-200"
                      : "bg-green-100 text-green-800"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-800"
                } ${status.isFlagged ? "ring-2 ring-yellow-400" : ""}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const storedAttemptId = sessionStorage.getItem(`exam_${examId}_attempt`);
    if (storedAttemptId) {
      setAttemptId(storedAttemptId);
      setAttemptCreated(true);
    }

    const initializeExam = async () => {
      if (!storedAttemptId) {
        await createExamAttempt();
      }
      await fetchQuestions();
    };

    initializeExam();
  }, [examId]);

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitExam = useCallback(async () => {
    // Set a flag to indicate submission is in progress
    let isSubmitting = true;

    // Prevent multiple submissions
    if (window.examSubmitting) {
      console.log(
        "Submission already in progress, preventing duplicate submission"
      );
      return;
    }
    window.examSubmitting = true;

    try {
      console.log("Starting exam submission process");

      // Make sure we have a valid attempt ID
      const effectiveAttemptId =
        attemptId || sessionStorage.getItem(`exam_${examId}_attempt`);

      if (!effectiveAttemptId) {
        console.error("No valid attempt ID found");
        setError(
          "No valid attempt ID found. Please refresh the page and try again."
        );
        setTimeout(() => {
          clearExamStorage();
          navigate("/student");
        }, 3000);
        return;
      }

      // Only include questions that have answers
      const formattedAnswers = Object.entries(answers)
        .filter(([_, answerData]) => {
          // Check if the answer has any content
          return (
            (answerData?.answer_text && answerData.answer_text.trim() !== "") ||
            (answerData?.selected_options &&
              answerData.selected_options.length > 0)
          );
        })
        .map(([questionId, answerData]) => ({
          attempt_id: effectiveAttemptId,
          question_id: parseInt(questionId),
          answer_text: answerData?.answer_text || null,
          selected_options: answerData?.selected_options
            ? JSON.stringify(answerData.selected_options)
            : null,
        }));

      // Add a message for user about unanswered questions
      const answeredCount = formattedAnswers.length;
      const totalQuestions = questions.length;

      if (answeredCount < totalQuestions) {
        console.log(
          `User answered ${answeredCount}/${totalQuestions} questions`
        );
        const shouldContinue = window.confirm(
          `You've only answered ${answeredCount} out of ${totalQuestions} questions. Are you sure you want to submit?`
        );

        if (!shouldContinue) {
          window.examSubmitting = false;
          return;
        }
      }

      console.log(
        `Submitting attempt: ${effectiveAttemptId} with ${formattedAnswers.length} answers`
      );
      const response = await submitExamApi({
        attempt_id: effectiveAttemptId,
        answers: formattedAnswers,
      });

      console.log("Submission response:", response);

      if (response.success) {
        // Mark the exam as completed using our helper function
        markExamAsComplete();
        console.log("Exam marked as completed");

        // Clear timer flag on legitimate submit
        sessionStorage.removeItem(`exam_${examId}_timer`);
        // Clear all exam-related session storage
        clearExamStorage();

        // Clear security-related localStorage items
        localStorage.removeItem("examAccepted");
        localStorage.removeItem("examViolations");
        localStorage.removeItem("examShowWarning");
        localStorage.removeItem("examBrowserFocused");

        console.log("Navigating to student dashboard");
        navigate("/student");
      } else {
        console.error(`Submission failed: ${response.message}`);
        setError(`Failed to submit exam: ${response.message}`);
        // Still navigate away even if submission failed
        setTimeout(() => {
          clearExamStorage();
          navigate("/student");
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      setError(
        "Error submitting exam. You will be redirected to the dashboard."
      );
      // Always navigate regardless of errors
      setTimeout(() => {
        clearExamStorage();
        navigate("/student");
      }, 3000);
    } finally {
      // Reset the submitting flag
      window.examSubmitting = false;
    }
  }, [attemptId, answers, questions, navigate, examId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip arrow navigation if focused on an input or textarea
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.classList.contains("CodeMirror-code");

      // Only handle arrow keys for navigation when not in an input
      if (!isInputFocused) {
        // Arrow key navigation
        if (e.key === "ArrowRight") {
          goToNextQuestion();
        } else if (e.key === "ArrowLeft") {
          goToPreviousQuestion();
        }
      }

      // Quick flag toggle (Alt + F)
      if (e.altKey && e.key === "f") {
        toggleFlagQuestion(questions[currentQuestionIndex].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestionIndex, questions]);

  // function to clear exam storage
  const clearExamStorage = () => {
    // Clear all exam-related data from session storage
    sessionStorage.removeItem(`exam_${examId}_attempt`);
    sessionStorage.removeItem(`exam_${examId}_answers`);
    sessionStorage.removeItem(`exam_${examId}_flags`);
    sessionStorage.removeItem(`exam_${examId}_languages`);
    sessionStorage.removeItem(`exam_${examId}_time_left`);
    sessionStorage.removeItem(`exam_${examId}_end_time`);

    // Clear transition flags
    sessionStorage.removeItem(`exam_transition_${examId}`);

    // Cleanup any additional transition flags that might be specific to attempts
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (
        key.startsWith(`exam_transition_${examId}_`) ||
        key.startsWith(`exam_${examId}_`)
      ) {
        sessionStorage.removeItem(key);
      }
    });

    // Clean local storage items
    localStorage.removeItem(`exam_${examId}_completed`);
  };

  useEffect(() => {
    if (!attemptCreated || !questions.length) return;

    const timerKey = `exam_${examId}_timer`;
    let intervalId;

    // Calculate initial time left
    const currentTime = Math.floor(Date.now() / 1000);
    let storedEndTime = parseInt(
      sessionStorage.getItem(`exam_${examId}_end_time`)
    );

    // If no stored end time or the end time is in the past, reinitialize it
    if (!storedEndTime || currentTime >= storedEndTime) {
      const duration = questions[0]?.duration_minutes * 60 || 3600;
      storedEndTime = currentTime + duration;
      sessionStorage.setItem(
        `exam_${examId}_end_time`,
        storedEndTime.toString()
      );
    }

    const initialTimeLeft = Math.max(0, storedEndTime - currentTime);

    if (initialTimeLeft <= 0) {
      console.log("Timer expired - submitting exam");
      submitExam();
      return;
    }

    console.log(`Timer initialized: ${initialTimeLeft} seconds remaining`);
    setTimeLeft(initialTimeLeft);

    intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        sessionStorage.setItem(`exam_${examId}_time_left`, newTime.toString());

        if (newTime === 0) {
          console.log("Timer reached zero - submitting exam");
          submitExam();
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
      sessionStorage.removeItem(timerKey);
    };
  }, [attemptCreated, questions.length, examId, submitExam]);

  const createExamAttempt = async () => {
    try {
      // Clear the exam completion status when starting a new attempt
      localStorage.removeItem(`exam_${examId}_completed`);

      // First check session storage
      const existingAttemptId = sessionStorage.getItem(
        `exam_${examId}_attempt`
      );

      if (existingAttemptId) {
        // Verify this attempt is still valid with a backend check
        try {
          const verifyResponse = await verifyExamAttempt(existingAttemptId);

          if (verifyResponse.valid && verifyResponse.status === "in_progress") {
            console.log("Using existing attempt:", existingAttemptId);
            setAttemptId(existingAttemptId);
            setAttemptCreated(true);
            return existingAttemptId;
          } else if (
            verifyResponse.valid &&
            verifyResponse.status === "completed"
          ) {
            // Don't automatically create a new attempt if previous was completed
            console.log(
              "Previous attempt was completed, redirecting to dashboard"
            );
            sessionStorage.removeItem(`exam_${examId}_attempt`);
            // Clear all exam related data
            clearExamStorage();
            // Redirect to dashboard
            navigate("/student");
            return null;
          } else {
            // Invalid attempt, clean up and create new
            console.log("Invalid attempt, cleaning up");
            sessionStorage.removeItem(`exam_${examId}_attempt`);
          }
        } catch (error) {
          console.error("Error verifying attempt:", error);
          sessionStorage.removeItem(`exam_${examId}_attempt`);
        }
      }

      // Check if we're actually coming from the start exam flow
      const isExplicitlyStarted = sessionStorage.getItem(
        `exam_transition_${examId}`
      );

      if (!isExplicitlyStarted) {
        console.log("No explicit start command, redirecting to dashboard");
        navigate("/student");
        return null;
      }

      // Create a new attempt
      console.log("Creating new attempt");

      // Validate user ID before creating attempt
      if (!user || !user.id) {
        console.error("User data is missing or invalid");
        setError("User data is missing. Please log in again.");
        navigate("/login");
        return null;
      }

      // Validate exam ID before creating attempt
      if (!examId) {
        console.error("Exam ID is missing");
        setError("Exam ID is missing. Please try again.");
        navigate("/student");
        return null;
      }

      const response = await createAttempt({
        exam_id: examId,
        student_id: user.id,
      });

      if (response.success && response.attempt_id) {
        console.log("New attempt created:", response.attempt_id);
        setAttemptId(response.attempt_id);
        sessionStorage.setItem(`exam_${examId}_attempt`, response.attempt_id);
        setAttemptCreated(true);
        // Clear the transition flag
        sessionStorage.removeItem(`exam_transition_${examId}`);
        return response.attempt_id;
      } else {
        const errorMsg = response.message || "Failed to create exam attempt";
        console.error(errorMsg);
        setError(errorMsg);
        setTimeout(() => navigate("/student"), 3000); // Navigate back after showing error
        return null;
      }
    } catch (error) {
      console.error("Error creating exam attempt:", error);
      setError("Error creating exam attempt. Please try again.");
      setTimeout(() => navigate("/student"), 3000); // Navigate back after showing error
      return null;
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await getExamQuestions(examId);
      if (
        response.success &&
        response.questions &&
        response.questions.length > 0
      ) {
        setQuestions(response.questions);
        console.log(`Loaded ${response.questions.length} questions`);

        // Initialize time only if not already set
        const storedTime = sessionStorage.getItem(`exam_${examId}_time_left`);
        const storedEndTime = sessionStorage.getItem(`exam_${examId}_end_time`);

        if (!storedTime && !storedEndTime) {
          // Set a new end time based on the exam duration
          const duration = response.questions[0]?.duration_minutes * 60 || 3600;
          const endTime = Math.floor(Date.now() / 1000) + duration;
          console.log(
            `Setting new exam end time: ${new Date(
              endTime * 1000
            ).toLocaleTimeString()}`
          );

          sessionStorage.setItem(`exam_${examId}_end_time`, endTime.toString());
          setTimeLeft(duration);
        }
        return true;
      } else {
        const errorMsg = "No questions found for this exam";
        console.error(errorMsg);
        setError(errorMsg);
        return false;
      }
    } catch (error) {
      console.error("Error loading exam questions:", error);
      setError("Error loading exam questions. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };
  // Add this useEffect to prevent state reset
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      sessionStorage.setItem(`exam_${examId}_answers`, JSON.stringify(answers));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [answers, examId]);

  // handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Force save any unsaved changes
      sessionStorage.setItem(`exam_${examId}_answers`, JSON.stringify(answers));
      sessionStorage.setItem(
        `exam_${examId}_flags`,
        JSON.stringify(flaggedQuestions)
      );
      sessionStorage.setItem(
        `exam_${examId}_languages`,
        JSON.stringify(selectedLanguages)
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [answers, flaggedQuestions, selectedLanguages, examId]);

  const handleMCQAnswer = (questionId, optionId) => {
    const currentAnswers = answers[questionId]?.selected_options || [];
    let newSelectedOptions;

    if (currentAnswers.includes(optionId)) {
      newSelectedOptions = currentAnswers.filter((id) => id !== optionId);
    } else {
      newSelectedOptions = [...currentAnswers, optionId];
    }

    handleAnswerChange(questionId, newSelectedOptions, "mcq");
  };

  const handleTextAnswer = (questionId, text) => {
    handleAnswerChange(questionId, text, "text");
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Add a function to ensure exam is properly marked as complete
  const markExamAsComplete = useCallback(() => {
    try {
      // Set a flag in localStorage to indicate this exam was completed
      localStorage.setItem(`exam_${examId}_completed`, "true");

      // Store completion status with timestamp to handle future attempts
      const completionInfo = {
        examId: examId,
        attemptId:
          attemptId || sessionStorage.getItem(`exam_${examId}_attempt`),
        completedAt: new Date().toISOString(),
      };

      // Store in localStorage for persistence
      const completedExams = JSON.parse(
        localStorage.getItem("completed_exams") || "[]"
      );
      completedExams.push(completionInfo);
      localStorage.setItem("completed_exams", JSON.stringify(completedExams));

      console.log(`Exam ${examId} marked as complete`);
    } catch (e) {
      console.error("Error marking exam as complete:", e);
    }
  }, [examId, attemptId]);

  // Add handling for page unload during navigation to ensure completion status is saved
  useEffect(() => {
    const handlePageHide = () => {
      // If we're attempting to submit, make sure completion status is recorded
      if (window.examSubmitting) {
        markExamAsComplete();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
    };
  }, [markExamAsComplete]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <ExamFullScreenHandler
      examId={examId}
      onAccept={(shouldSubmit) => {
        if (shouldSubmit) {
          submitExam();
        }
      }}
    >
      <div
        className={`min-h-screen pb-8 ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 shadow-sm z-10 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } mr-2`}
                  />
                  <span
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
                {saveIndicator && (
                  <span className="text-sm text-green-600">
                    {saveIndicator}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className={`p-2 rounded-full ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <Menu
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-4 pt-6">
          {questions && questions.length > 0 ? (
            questions.map((question, index) => (
              <div
                key={question.id}
                className={`rounded-lg shadow-sm p-6 mb-6 ${
                  currentQuestionIndex === index ? "block" : "hidden"
                } ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <h2
                      className={`text-xl font-semibold ${
                        isDarkMode ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      Question {index + 1} of {questions.length}
                    </h2>
                    <button
                      onClick={() => toggleFlagQuestion(question.id)}
                      className={`p-2 rounded-full ${
                        isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      } ${
                        flaggedQuestions.includes(question.id)
                          ? "text-yellow-500"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      <Flag className="w-5 h-5" />
                    </button>
                    <p
                      className={`pt-3 text-sm select-none ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Press Alt + F to flag a question
                    </p>
                  </div>
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {question.points}{" "}
                    {question.points === 1 ? "point" : "points"}
                  </span>
                </div>

                <div className="mb-6">
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-800"}>
                    {question.question_text}
                  </p>
                  {question.image_data && (
                    <img
                      src={question.image_data}
                      alt="Question"
                      className="mt-4 max-w-full h-auto rounded-lg"
                    />
                  )}
                </div>

                {renderQuestionInput(question)}

                <p
                  className={`pt-4 text-sm select-none ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Press The Arrow keys to navigate {"<- ->"}
                </p>
              </div>
            ))
          ) : (
            <div className={isDarkMode ? "text-gray-300" : "text-gray-800"}>
              Loading questions...
            </div>
          )}
          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${
                isDarkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              }`}
            >
              Previous
            </button>

            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>

            <button
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${
                isDarkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              }`}
            >
              Next
            </button>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={submitExam}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium"
            >
              Submit Exam
            </button>
          </div>
        </div>
        <QuestionNavigator />
      </div>
    </ExamFullScreenHandler>
  );
}
