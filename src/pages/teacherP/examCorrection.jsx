import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  XSquare,
  CheckSquare,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min";
import ofpptLogo from "../../imgs/ofppt.png";
import { Highlight } from "prism-react-renderer";
import { useTheme } from "../../contexts/themeContext";
import {
  getExamDetails,
  updateAttempt,
  updateAttemptScore,
} from "../../services/userService";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "php", label: "PHP" },
];

const CodeViewer = ({ code, language }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`border rounded-lg overflow-hidden ${
        isDarkMode ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gray-50 border-gray-200"
        } border-b px-4 py-2 flex justify-between items-center`}
      >
        <span
          className={`text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          } select-none`}
        >
          Language:{" "}
          {LANGUAGES.find((lang) => lang.value === language)?.label || language}
        </span>
      </div>
      <Highlight code={code || ""} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} p-4 min-h-[200px] overflow-auto ${
              isDarkMode ? "bg-gray-900" : ""
            }`}
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

const ExamCorrection = () => {
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const { examId, attemptId } = useParams();
  const navigate = useNavigate();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState({});
  const [gradingStartTime, setGradingStartTime] = useState(null);
  const [timeSpentGrading, setTimeSpentGrading] = useState(0);
  const mediaRecorderRef = useRef(null);
  const totalScore = answers.reduce(
    (acc, curr) => Number(acc) + Number(curr.points_earned || 0),
    0
  );
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchAttemptDetails();
  }, [examId, attemptId]);

  const renderStudentAnswer = (answer) => {
    if (answer.question_type === "code") {
      return (
        <div className="space-y-4">
          <h4
            className={`font-semibold ${
              isDarkMode ? "text-gray-200" : "text-gray-900"
            } mb-3`}
          >
            Student's Code Answer
          </h4>
          <CodeViewer
            code={answer.answer_text}
            language={answer.language || "javascript"}
          />
        </div>
      );
    }
    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-br from-blue-950 to-indigo-950 border-blue-800"
            : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
        } p-4 rounded-lg border`}
      >
        <h4
          className={`font-semibold ${
            isDarkMode ? "text-gray-200" : "text-gray-900"
          } mb-3`}
        >
          Student's Answer
        </h4>
        <p className={isDarkMode ? "text-gray-300" : "text-gray-800"}>
          {answer.answer_text}
        </p>

        {answer.selected_options && answer.optionDetails && (
          <div className="mt-4">
            <h5
              className={`font-semibold ${
                isDarkMode ? "text-gray-200" : "text-gray-900"
              } mb-2`}
            >
              Selected Options:
            </h5>
            <div
              className={`mb-3 text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Score:{" "}
              {calculateProportionalScore(
                answer.optionDetails,
                answer.max_points
              ).toFixed(2)}{" "}
              / {answer.max_points}
            </div>
            <ul className="space-y-2">
              {answer.optionDetails?.map((option, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center p-4 rounded-lg ${
                    option.is_selected
                      ? option.is_correct
                        ? isDarkMode
                          ? "bg-green-900 border-green-700"
                          : "bg-green-50 border-green-200"
                        : isDarkMode
                        ? "bg-red-900 border-red-700"
                        : "bg-red-50 border-red-200"
                      : isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  } border`}
                >
                  <div className="mr-3">
                    {option.is_selected ? (
                      option.is_correct ? (
                        <CheckSquare
                          className={`w-5 h-5 ${
                            isDarkMode ? "text-green-400" : "text-green-600"
                          }`}
                        />
                      ) : (
                        <XSquare
                          className={`w-5 h-5 ${
                            isDarkMode ? "text-red-400" : "text-red-600"
                          }`}
                        />
                      )
                    ) : (
                      <div
                        className={`w-5 h-5 border-2 rounded-sm ${
                          isDarkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={
                      option.is_selected
                        ? option.is_correct
                          ? isDarkMode
                            ? "text-green-400"
                            : "text-green-700"
                          : isDarkMode
                          ? "text-red-400"
                          : "text-red-700"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }
                  >
                    {option.option_text}
                  </span>
                </motion.div>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const fetchAttemptDetails = async () => {
    try {
      const response = await getExamDetails(attemptId);

      if (response.success) {
        const processedAnswers = response.answers.map((answer) => {
          if (answer.optionDetails) {
            const calculatedScore = calculateProportionalScore(
              answer.optionDetails,
              answer.max_points
            );
            return {
              ...answer,
              points_earned: calculatedScore,
            };
          }
          return answer;
        });
        setExam(response.exam);
        setAnswers(processedAnswers);
      }
    } catch (error) {
      console.error("Error fetching attempt details:", error);
    } finally {
      setLoading(false);
    }
  };

  const sanitizeText = (text) => {
    if (!text) return "";

    // Convert code blocks to formatted text
    text = text.replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```/g, "").trim();
      return `<div style="font-family: monospace; background-color: #f5f5f5; padding: 8px; border-radius: 4px; white-space: pre-wrap; font-size: 10px; margin: 4px 0;">${code}</div>`;
    });

    // Handle basic text
    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Convert newlines to <br> tags
    text = text.replace(/\n/g, "<br>");

    return text;
  };

  const generatePDF = () => {
    setGeneratingPDF(true);

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    document.body.appendChild(tempContainer);

    const pdfContent = document.createElement("div");
    pdfContent.style.width = "190mm";
    pdfContent.style.margin = "0";
    pdfContent.style.padding = "0";
    pdfContent.style.lineHeight = "1.2";
    pdfContent.style.fontSize = "10px";
    pdfContent.style.pageBreakInside = "avoid";
    pdfContent.style.pageBreakAfter = "auto";

    const currentDate = new Date().toLocaleDateString("fr-FR");
    const totalQuestions = answers.length;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 5px 10px; margin: 0; position: relative; line-height: 1.2;">
        <!-- Header and student info container - keep together -->
        <div style="page-break-inside: avoid;">
          <!-- Header section -->
          <div style="text-align: center; margin-bottom: 4px; display: flex; justify-content: center;">
            <img src="${ofpptLogo}" alt="OFPPT Logo" style="height: 100px; width: auto; object-fit: contain;"/>
          </div>
          
          <div style="text-align: center; margin-bottom: 4px;">
            <h1 style="color: #333; margin: 0 0 2px 0; font-size: 14px;">${
              exam?.title
            }</h1>
          </div>
    
          <!-- Student info table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
            <tr>
              <td style="padding: 3px 6px; border: 1px solid #ddd; width: 50%; font-size: 11px;"><strong>Nom et prénom:</strong> ${
                exam?.student_name || ""
              }</td>
              <td style="padding: 3px 6px; border: 1px solid #ddd; width: 50%; font-size: 11px;"><strong>CIN:</strong> ${
                exam?.student_id || ""
              }</td>
            </tr>
            <tr>
              <td style="padding: 3px 6px; border: 1px solid #ddd; font-size: 11px;"><strong>Date:</strong> ${currentDate}</td>
              <td style="padding: 3px 6px; border: 1px solid #ddd; font-size: 11px;"><strong>Note finale:</strong> ${totalScore}/${maxScore} </td>
            </tr>
            <tr>
              <td style="padding: 3px 6px; border: 1px solid #ddd; font-size: 11px;" colspan="2"><strong>Group:</strong> ${
                exam?.group_name
              } </td>
            </tr>
          </table>
        </div>
    
        <!-- Questions section -->
        <div style="margin-top: 0;" class="questions-section">
          ${answers
            .map(
              (answer, index) => `
            <div style="margin-bottom: ${
              index === answers.length - 1 ? "6px" : "4px"
            }; border: 1px solid #ddd; padding: 6px; background-color: white;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <h3 style="color: #333; margin: 0; font-size: 12px;">Question ${
                  index + 1
                } sur ${totalQuestions}</h3>
                <div style="font-size: 11px; background-color: #f0f7ff; padding: 2px 6px; border-radius: 4px;">
                  <strong>Points:</strong> ${answer.points_earned || 0}/${
                answer.max_points || 0
              }
                </div>
              </div>
              
              <div style="margin-bottom: 4px;">
                <div style="font-size: 11px; font-weight: bold; margin-bottom: 2px;">Question:</div>
                <div style="padding: 4px 6px; background-color: #f5f5f5; border-radius: 4px; font-size: 11px;">
                  ${sanitizeText(answer.question_text || "")}
                </div>
                ${
                  answer.image_data
                    ? `<div style="margin-top: 4px; text-align: center;">
                        <img src="${answer.image_data}" style="max-width: 100%; max-height: 120px; object-fit: contain; border-radius: 4px;" />
                       </div>`
                    : ""
                }
              </div>
  
              ${
                answer.answer_text
                  ? `
                <div style="margin-bottom: 4px;">
                  <div style="font-size: 11px; font-weight: bold; margin-bottom: 2px;">Réponse:</div>
                  <div style="padding: 4px 6px; background-color: #f0f7ff; border-radius: 4px; font-size: 11px; white-space: pre-wrap;">
                    ${sanitizeText(answer.answer_text)}
                  </div>
                </div>
              `
                  : ""
              }
  
              ${
                answer.optionDetails && answer.optionDetails.length > 0
                  ? `
                <div>
                  <div style="font-size: 11px; font-weight: bold; margin-bottom: 2px;">Options:</div>
                  ${answer.optionDetails
                    .map(
                      (option) => `
                    <div style="padding: 2px 6px; margin-bottom: 2px; border-radius: 4px; font-size: 10px;
                         background-color: ${
                           option.is_selected
                             ? option.is_correct
                               ? "#e6ffe6"
                               : "#ffe6e6"
                             : "#f5f5f5"
                         }">
                      ${option.is_selected ? "✓" : "○"} ${sanitizeText(
                        option.option_text || ""
                      )}
                    </div>
                  `
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid #ddd; padding-top: 3px; margin-top: 4px; text-align: center; page-break-after: avoid;">
          <p style="color: #666; font-size: 8px; margin: 0;">
            Document généré le ${currentDate} | Total des questions: ${totalQuestions} | Fin du document
          </p>
        </div>
      </div>
    `;

    pdfContent.innerHTML = htmlContent;
    tempContainer.appendChild(pdfContent);

    const opt = {
      margin: [5, 5, 5, 5],
      filename: `releve_notes_${
        exam?.student_name?.replace(/\s+/g, "_") || "exam"
      }_${exam?.title?.replace(/\s+/g, "_") || "exam"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        scrollY: 0,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        logging: false,
        removeContainer: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
        putOnlyUsedFonts: true,
        precision: 16,
        hotfixes: ["px_scaling", "px_scaling_hd"],
        pagesplit: true,
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        before: ".page-break",
        avoid: ["tr", "td", "img", "table", "p"],
        allowTags: ["DIV"],
      },
      enableLinks: false,
      onBeforeRender: (element) => {
        Array.from(element.querySelectorAll("*")).forEach((el) => {
          if (el.children.length === 0 && el.textContent === "") {
            el.style.display = "none";
          }
        });

        const firstQuestion = element.querySelector(
          ".questions-section > div:first-child"
        );
        if (firstQuestion) {
          firstQuestion.style.pageBreakBefore = "avoid";
        }
      },
      onAfterRender: (element) => {
        // Remove any blank pages that might be created
        const lastElements = element.querySelectorAll("div:empty");
        lastElements.forEach((el) => el.remove());
      },
    };

    return new Promise((resolve, reject) => {
      html2pdf()
        .set(opt)
        .from(pdfContent)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          // Check for and remove any extra blank pages
          const totalPages = pdf.internal.getNumberOfPages();
          if (totalPages > 1) {
            // Check if the last page is blank (hacky but effective for most cases)
            const lastPageText =
              pdf.internal.getPageInfo(totalPages).pageContent;
            if (!lastPageText || lastPageText.length < 10) {
              pdf.deletePage(totalPages);
            }
          }

          pdf.setProperties({
            title: exam?.title || "Relevé de Notes",
            subject: "Exam Results",
            creator: "OFPPT",
            author: "OFPPT",
          });
          pdf.save(opt.filename);
          resolve();
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
          reject(error);
        })
        .finally(() => {
          if (tempContainer && tempContainer.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer);
          }
          setGeneratingPDF(false);
        });
    });
  };
  const handleSubmitGrading = async () => {
    setSubmitting(true);

    try {
      // First update all scores sequentially
      for (const answer of answers) {
        console.log(answer.points_earned, answer.id);
        await updateAttemptScore(answer.id, answer.points_earned || 0);
      }

      // Wait for scores to be updated before updating attempt
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the attempt
      const response = await updateAttempt(attemptId);

      if (response.success) {
        // Submission succeeded
        setSubmitting(false);
        // Generate and download PDF after successful submission
        await generatePDF();
      }
    } catch (error) {
      console.error("Error submitting grades:", error);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    answers.forEach((answer) => {
      if (answer.optionDetails) {
        const calculatedScore = calculateProportionalScore(
          answer.optionDetails,
          answer.max_points
        );

        if (calculatedScore !== answer.points_earned) {
          handleScoreUpdate(
            answer.id,
            calculatedScore,
            answer.max_points,
            answer.optionDetails
          );
        }
      }
    });
  }, [JSON.stringify(answers.map((a) => a.optionDetails))]);

  // Initialize grading timer
  useEffect(() => {
    setGradingStartTime(new Date());
    const timer = setInterval(() => {
      setTimeSpentGrading((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT") return;

      switch (e.key) {
        case "ArrowRight":
          setActiveQuestionIndex((prev) =>
            Math.min(prev + 1, answers.length - 1)
          );
          break;
        case "ArrowLeft":
          setActiveQuestionIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Tab":
          e.preventDefault();
          setActiveQuestionIndex((prev) => (prev + 1) % answers.length);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [answers.length]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (answers.length > 0) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [answers]);

  const handleAutoSave = async () => {
    try {
      // Simulate auto-save
      setAutoSaveStatus("Saving...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAutoSaveStatus("All changes saved");
      setTimeout(() => setAutoSaveStatus(""), 3000);
    } catch (error) {
      setAutoSaveStatus("Error saving changes");
    }
  };
  // Voice notes functionality
  const startRecording = async (questionId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setVoiceNotes((prev) => ({
          ...prev,
          [questionId]: url,
        }));
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const roundToQuarter = (num) => {
    return Math.round(num * 4) / 4;
  };

  const handleScoreUpdate = async (
    answerId,
    score,
    maxPoints,
    optionDetails
  ) => {
    let validScore = 0;

    if (optionDetails) {
      validScore = calculateProportionalScore(optionDetails, maxPoints);
    } else {
      // Ensure score is a valid number by explicitly converting to float
      validScore = roundToQuarter(parseFloat(score) || 0);
    }

    // Ensure it's a valid number within range
    validScore = Math.min(Math.max(0, validScore), maxPoints);

    // Format to 2 decimal places to avoid precision issues
    validScore = parseFloat(validScore.toFixed(2));

    // Update local state
    setAnswers(
      answers.map((a) =>
        a.id === answerId ? { ...a, points_earned: validScore } : a
      )
    );

    // Send to backend immediately as a number (not string)
    try {
      // Make the API call directly here
      await updateAttemptScore(answerId, validScore);

      // Update the total score in UI
      const updatedTotalScore = answers.reduce((acc, curr) => {
        // Use the updated score for the current answer, otherwise use existing scores
        const points =
          curr.id === answerId ? validScore : Number(curr.points_earned || 0);
        return acc + points;
      }, 0);

      // Force a recalculation of the total score
      setTimeSpentGrading((prev) => prev + 0.01); // Just to trigger a re-render
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };
  const calculateProportionalScore = (options, maxPoints) => {
    if (!options || options.length === 0) return 0;

    const selectedOptions = options.filter((opt) => opt.is_selected);
    if (selectedOptions.length === 0) return 0;

    const correctSelections = selectedOptions.filter(
      (opt) => opt.is_correct
    ).length;
    const incorrectSelections = selectedOptions.filter(
      (opt) => !opt.is_correct
    ).length;

    const netCorrect = Math.max(0, correctSelections - incorrectSelections);
    const totalPossibleCorrect = options.filter((opt) => opt.is_correct).length;

    if (totalPossibleCorrect === 0) return 0;
    const proportion = netCorrect / totalPossibleCorrect;

    return roundToQuarter(proportion * maxPoints);
  };

  if (loading) {
    return (
      <motion.div
        className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  const maxScore = answers.reduce(
    (acc, curr) => Number(acc) + curr.max_points,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      } py-8`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <ArrowLeft className="w-5 h-5 mr-3" />
          Back to Attempts
        </motion.button>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`mb-8 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-8`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h1
                className={`text-4xl font-bold ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                } tracking-tight`}
              >
                {exam?.title}
              </h1>
              <p
                className={`mt-2 text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Grading {exam?.student_name}'s exam
              </p>

              {autoSaveStatus && (
                <div className="mt-2 text-sm text-blue-400">
                  {autoSaveStatus}
                </div>
              )}
            </div>

            <div
              className={`${
                isDarkMode
                  ? "bg-gradient-to-br from-blue-800 to-indigo-800"
                  : "bg-gradient-to-br from-blue-600 to-indigo-600"
              } text-white rounded-xl p-6 shadow-lg`}
            >
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {totalScore.toFixed(2)} / {maxScore}
                </div>
                <div className="mt-1 font-medium">Total Score</div>
                <div className="mt-2 text-sm opacity-90">
                  {((totalScore / maxScore) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {answers.map((answer, index) => (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5 },
                },
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              key={answer.id}
              className={`${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              } rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border p-6`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Question {index + 1}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      isRecording ? stopRecording() : startRecording(answer.id)
                    }
                    className={`p-2 rounded-full transition-colors ${
                      isRecording
                        ? isDarkMode
                          ? "bg-red-900 text-red-300"
                          : "bg-red-100 text-red-600"
                        : isDarkMode
                        ? "bg-blue-900 text-blue-300"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {isRecording ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </button>
                  {voiceNotes[answer.id] && (
                    <audio
                      controls
                      src={voiceNotes[answer.id]}
                      className={`h-8 ${isDarkMode ? "filter invert" : ""}`}
                    />
                  )}
                </div>

                <div
                  className={`flex items-center gap-3 ${
                    isDarkMode
                      ? "bg-gradient-to-br from-blue-900 to-indigo-900"
                      : "bg-gradient-to-br from-blue-50 to-indigo-50"
                  } p-3 rounded-lg`}
                >
                  <input
                    type="number"
                    value={Number(answer.points_earned)?.toFixed(2) || "0.00"}
                    onChange={(e) =>
                      handleScoreUpdate(
                        answer.id,
                        parseFloat(e.target.value),
                        answer.max_points,
                        answer.optionDetails
                      )
                    }
                    className={`w-20 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-medium ${
                      isDarkMode
                        ? "bg-gray-700 border-blue-700 text-gray-100"
                        : "border-blue-200 text-gray-900"
                    } border`}
                    min="0"
                    max={answer.max_points}
                    step="0.25"
                  />
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    / {answer.max_points} points
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className={`${
                    isDarkMode
                      ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600"
                      : "bg-gradient-to-br from-stone-50 to-white border-stone-100"
                  } p-4 rounded-lg border`}
                >
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-800"}>
                    {answer.question_text}
                  </p>
                  {answer.image_data && (
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={answer.image_data}
                      alt="Question"
                      className="mt-4 max-h-56 object-contain rounded-lg"
                    />
                  )}
                </div>

                {renderStudentAnswer(answer)}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-6 right-6 left-6 md:left-auto"
        >
          <button
            onClick={handleSubmitGrading}
            disabled={submitting || generatingPDF}
            className={`w-full md:w-auto px-6 py-3 ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            } text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {submitting ? (
              <>
                <motion.div
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Soumission...</span>
              </>
            ) : generatingPDF ? (
              <>
                <motion.div
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Génération du PDF...</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-5 h-5" />
                <span>Soumettre la notation</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ExamCorrection;
