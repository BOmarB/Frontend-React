// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";

// const ExamResult = () => {
//   const { attemptId } = useParams();
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchResult();
//   }, [attemptId]);

//   const fetchResult = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost/onlineexam/backend/api/routes/api.php/exam-result/${attemptId}`,
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       const data = await response.json();
//       if (data.success) {
//         setResult(data.result);
//       }
//     } catch (error) {
//       console.error("Error fetching result:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         Loading...
//       </div>
//     );
//   }

//   if (!result) {
//     return <div className="text-center py-8">Result not found</div>;
//   }

//   const scorePercentage = (result.score / 20) * 100;

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-3xl mx-auto px-4">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h1 className="text-2xl font-bold mb-6">{result.exam_title}</h1>

//           <div className="mb-8">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-lg">Your Score</span>
//               <span className="text-2xl font-bold">
//                 {result.score.toFixed(2)}/20 ({scorePercentage.toFixed(1)}%)
//               </span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5">
//               <div
//                 className={`h-2.5 rounded-full ${
//                   scorePercentage >= 70
//                     ? "bg-green-600"
//                     : scorePercentage >= 50
//                     ? "bg-yellow-500"
//                     : "bg-red-600"
//                 }`}
//                 style={{ width: `${scorePercentage}%` }}
//               ></div>
//             </div>
//           </div>

//           <div className="space-y-6">
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div className="bg-gray-50 p-3 rounded">
//                 <span className="block text-gray-500">Time Taken</span>
//                 <span className="font-medium">{result.time_spent} minutes</span>
//               </div>
//               <div className="bg-gray-50 p-3 rounded">
//                 <span className="block text-gray-500">Questions</span>
//                 <span className="font-medium">{result.total_questions}</span>
//               </div>
//               <div className="bg-gray-50 p-3 rounded">
//                 <span className="block text-gray-500">Correct Answers</span>
//                 <span className="font-medium">{result.correct_answers}</span>
//               </div>
//               <div className="bg-gray-50 p-3 rounded">
//                 <span className="block text-gray-500">Partial Correct</span>
//                 <span className="font-medium">{result.partial_correct}</span>
//               </div>
//             </div>
//           </div>

//           <div className="mt-8">
//             <a
//               href="/student-dashboard"
//               className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Back to Dashboard
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExamResult;
