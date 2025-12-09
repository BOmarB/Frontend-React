import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useTheme } from "../contexts/themeContext";
// import {
//   verifyAttemptStatus,
//   verifyExamAttempt,
// } from "../services/userService";
import { useNavigate } from "react-router-dom";

const ExamSecurityHandler = ({ examId, onAccept, onViolation, children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showWarning, setShowWarning] = useState(() => {
    const saved = localStorage.getItem("examShowWarning");
    return saved ? JSON.parse(saved) : false;
  });
  const [accepted, setAccepted] = useState(() => {
    const saved = localStorage.getItem("examAccepted");
    return saved ? JSON.parse(saved) : false;
  });
  const [examCompleted, setExamCompleted] = useState(() => {
    // Check if the specific exam is completed
    const saved = localStorage.getItem(`exam_${examId}_completed`);
    return saved ? JSON.parse(saved) : false;
  });
  const [violations, setViolations] = useState(() => {
    const saved = localStorage.getItem("examViolations");
    return saved ? JSON.parse(saved) : 0;
  });
  const [browserFocused, setBrowserFocused] = useState(() => {
    const saved = localStorage.getItem("examBrowserFocused");
    return saved ? JSON.parse(saved) : true;
  });
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Reset completion state if there's an active attempt
  useEffect(() => {
    const attemptId = sessionStorage.getItem(`exam_${examId}_attempt`);
    if (attemptId && examCompleted) {
      // If we have an attempt ID but the exam is marked as completed,
      // reset the completed state
      setExamCompleted(false);
      localStorage.removeItem(`exam_${examId}_completed`);
    }
  }, [examId, examCompleted]);

  // Save state changes to localStorage
  useEffect(() => {
    localStorage.setItem("examAccepted", JSON.stringify(accepted));
  }, [accepted]);

  useEffect(() => {
    localStorage.setItem("examViolations", JSON.stringify(violations));
  }, [violations]);

  useEffect(() => {
    localStorage.setItem("examShowWarning", JSON.stringify(showWarning));
  }, [showWarning]);

  useEffect(() => {
    localStorage.setItem("examBrowserFocused", JSON.stringify(browserFocused));
  }, [browserFocused]);

  useEffect(() => {
    localStorage.setItem(
      `exam_${examId}_completed`,
      JSON.stringify(examCompleted)
    );
  }, [examCompleted, examId]);

  // If exam is already completed, don't show fullscreen handler
  useEffect(() => {
    const checkExamStatus = () => {
      // Check if attempt ID exists but is no longer in sessionStorage
      const attemptId = sessionStorage.getItem(`exam_${examId}_attempt`);

      // If the attempt ID was cleared but we're still on the exam page,
      // it likely means the exam was submitted
      if (!attemptId && localStorage.getItem("examAccepted")) {
        setExamCompleted(true);
        localStorage.setItem(`exam_${examId}_completed`, "true");
        navigate("/student");
      }
    };

    checkExamStatus();
  }, [examId, navigate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (accepted && !examCompleted && document.hidden) {
        setViolations((prev) => {
          const newValue = prev + 1;
          localStorage.setItem("examViolations", JSON.stringify(newValue));
          return newValue;
        });
        setBrowserFocused(false);
        onViolation?.({
          type: "tab_switch",
          timestamp: new Date().toISOString(),
        });
      }
      setBrowserFocused(!document.hidden);
    };

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && accepted && !examCompleted) {
        setViolations((prev) => {
          const newValue = prev + 1;
          localStorage.setItem("examViolations", JSON.stringify(newValue));
          return newValue;
        });
        setShowWarning(true);
        onViolation?.({
          type: "fullscreen_exit",
          timestamp: new Date().toISOString(),
        });
      }
      setIsFullScreen(!!document.fullscreenElement);
    };

    const handleKeyPress = (e) => {
      if (
        (!examCompleted &&
          e.ctrlKey &&
          (e.key === "c" || e.key === "v" || e.key === "p")) ||
        e.key === "PrintScreen" ||
        e.key === "F11" ||
        e.key === "Escape"
      ) {
        e.preventDefault();
        onViolation?.({
          type: "keyboard_shortcut",
          key: e.key,
          timestamp: new Date().toISOString(),
        });
      }
    };

    const handleBlur = () => {
      if (accepted && !examCompleted) {
        setViolations((prev) => {
          const newValue = prev + 1;
          localStorage.setItem("examViolations", JSON.stringify(newValue));
          return newValue;
        });
        setBrowserFocused(false);
        onViolation?.({
          type: "window_blur",
          timestamp: new Date().toISOString(),
        });
      }
    };

    const handleContextMenu = (e) => {
      if (!examCompleted) {
        e.preventDefault();
        onViolation?.({
          type: "right_click",
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Add beforeunload handler to save state
    const handleBeforeUnload = () => {
      localStorage.setItem("examAccepted", JSON.stringify(accepted));
      localStorage.setItem("examViolations", JSON.stringify(violations));
      localStorage.setItem("examShowWarning", JSON.stringify(showWarning));
      localStorage.setItem(
        "examBrowserFocused",
        JSON.stringify(browserFocused)
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("keydown", handleKeyPress);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    accepted,
    examCompleted,
    onViolation,
    violations,
    browserFocused,
    showWarning,
  ]);

  const enterFullScreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setAccepted(true);
      setBrowserFocused(true);
      setShowWarning(false);
      onAccept();
    } catch (err) {
      console.error("Error enabling full-screen:", err);
    }
  };

  const handleSubmitExam = () => {
    // Mark exam as completed and clear localStorage
    setExamCompleted(true);
    localStorage.setItem(`exam_${examId}_completed`, "true");
    localStorage.removeItem("examAccepted");
    localStorage.removeItem("examViolations");
    localStorage.removeItem("examShowWarning");
    localStorage.removeItem("examBrowserFocused");
    onAccept(true);
  };

  // If exam is completed, don't show security UI
  if (examCompleted) {
    return children;
  }

  if (!accepted) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div
          className={`rounded-lg shadow-xl max-w-md w-full p-6 ${
            isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}
        >
          {/* Previous content remains the same */}
          <div className="flex items-center space-x-3 mb-6">
            <ShieldAlert
              className={`h-6 w-6 ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <h2
              className={`text-xl font-semibold ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Exam Security Requirements
            </h2>
          </div>

          <div
            className={`space-y-4 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } mb-6`}
          >
            <p>Before starting the exam, please note:</p>
            <ul className="list-none space-y-3">
              {[
                "The exam must be taken in full-screen mode",
                "Switching tabs or applications is not allowed",
                "Right-clicking and some keyboard shortcuts are disabled",
                // "All actions are monitored and logged",
                "Multiple violations may result in a submission",

                "Close all other applications and browser tabs",
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span
                    className={`mr-2 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    •
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={enterFullScreen}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all
              ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } focus:ring-2 focus:ring-offset-2 ${
              isDarkMode
                ? "focus:ring-blue-500 focus:ring-offset-gray-800"
                : "focus:ring-blue-500 focus:ring-offset-white"
            }`}
          >
            Accept and Enter Full Screen
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {(!browserFocused || showWarning) && !examCompleted && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-lg shadow-xl max-w-md w-full p-6 ${
              isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h2
              className={`text-xl font-semibold text-center mb-4 ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Security Warning!
            </h2>
            <p
              className={`mb-6 text-center ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {!browserFocused
                ? "You have switched away from the exam window. This violation has been recorded."
                : "You attempted to exit full-screen mode. This violation has been recorded."}
            </p>
            <div
              className={`p-4 rounded-lg mb-6 ${
                isDarkMode
                  ? "bg-gray-700/50 border border-gray-600"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <p
                className={`text-center font-medium ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Violation count: {violations}/5
                {violations === 4 && (
                  <span className="block mt-1 text-red-500">
                    Next violation will submit your exam automatically
                  </span>
                )}
                {violations >= 5 && (
                  <span className="block mt-1 text-red-500">
                    Exam submission due to multiple violations
                  </span>
                )}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowWarning(false);
                  setBrowserFocused(true);
                  if (violations >= 5) {
                    handleSubmitExam();
                  } else {
                    enterFullScreen();
                  }
                }}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all
                  ${
                    violations >= 4
                      ? isDarkMode
                        ? "bg-red-600 hover:bg-red-500"
                        : "bg-red-600 hover:bg-red-700"
                      : isDarkMode
                      ? "bg-blue-600 hover:bg-blue-500"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white focus:ring-2 focus:ring-offset-2 ${
                  isDarkMode
                    ? "focus:ring-offset-gray-800"
                    : "focus:ring-offset-white"
                } ${
                  violations >= 5 ? "focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              >
                {violations >= 5 ? "Submit Exam" : "Continue Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExamSecurityHandler;
