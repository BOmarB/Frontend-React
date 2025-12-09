import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import { getExamDetails } from "../services/userService";

const AttemptResults = () => {
  const { attemptId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await getExamDetails(attemptId);

        if (response.success) {
          setResults(response);
        } else {
          setError(response.error || "Failed to load results");
        }
      } catch (err) {
        setError("Error loading results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  const totalScore = results.answers.reduce(
    (sum, answer) => sum + (answer.points_earned || 0),
    0
  );
  const maxScore = results.answers.reduce(
    (sum, answer) => sum + answer.max_points,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{results.exam.title}</h1>
        <div className="text-lg mb-6">
          Score: {totalScore}/{maxScore} (
          {((totalScore / maxScore) * 100).toFixed(1)}%)
        </div>
      </div>

      {results.answers.map((answer, index) => (
        <div key={answer.id} className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Question {index + 1}</h2>
            <span className="text-sm">
              {answer.points_earned}/{answer.max_points} points
            </span>
          </div>

          <div className="mb-4">
            <p>{answer.question_text}</p>
            {answer.image_data && (
              <img
                src={answer.image_data}
                alt="Question"
                className="mt-4 max-w-full h-auto rounded"
              />
            )}
          </div>

          {answer.optionDetails ? (
            <div className="space-y-2">
              {answer.optionDetails.map((option) => (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg border ${
                    option.is_selected ? "bg-blue-50" : ""
                  }`}
                >
                  {option.option_text}
                  {option.is_selected && (
                    <span className="ml-2 text-blue-600">(Selected)</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 border rounded-lg">
              <p className="font-semibold">Your Answer:</p>
              <p>{answer.answer_text || "No answer provided"}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AttemptResults;
