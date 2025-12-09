// import React, { useState } from "react";
// import "../../styles/question.css";

// const QuestionForm = ({ onAddQuestion }) => {
//   const [question, setQuestion] = useState({
//     question_text: "",
//     question_type: "mcq",
//     points: 1,
//     options: [
//       { option_text: "", is_correct: false },
//       { option_text: "", is_correct: false },
//     ],
//   });

//   const handleQuestionChange = (e) => {
//     setQuestion({
//       ...question,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleOptionChange = (index, e) => {
//     const updatedOptions = question.options.map((option, i) => {
//       if (i === index) {
//         return {
//           ...option,
//           [e.target.name]:
//             e.target.name === "is_correct" ? e.target.checked : e.target.value,
//         };
//       }
//       return option;
//     });

//     setQuestion({
//       ...question,
//       options: updatedOptions,
//     });
//   };

//   const handleAddOption = () => {
//     setQuestion({
//       ...question,
//       options: [...question.options, { option_text: "", is_correct: false }],
//     });
//   };

//   const handleRemoveOption = (index) => {
//     setQuestion({
//       ...question,
//       options: question.options.filter((_, i) => i !== index),
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onAddQuestion(question);
//     setQuestion({
//       question_text: "",
//       question_type: "mcq",
//       points: 1,
//       options: [
//         { option_text: "", is_correct: false },
//         { option_text: "", is_correct: false },
//       ],
//     });
//   };

//   return (
//     <div className="question-form">
//       <h3>Add New Question</h3>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="question_text">Question Text</label>
//           <textarea
//             id="question_text"
//             name="question_text"
//             value={question.question_text}
//             onChange={handleQuestionChange}
//             required
//             placeholder="Enter your question"
//           />
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="question_type">Question Type</label>
//             <select
//               id="question_type"
//               name="question_type"
//               value={question.question_type}
//               onChange={handleQuestionChange}
//               required
//             >
//               <option value="mcq">Multiple Choice</option>
//               <option value="open">Open Ended</option>
//               <option value="short">Short Answer</option>
//             </select>
//           </div>

//           <div className="form-group">
//             <label htmlFor="points">Points</label>
//             <input
//               type="number"
//               id="points"
//               name="points"
//               value={question.points}
//               onChange={handleQuestionChange}
//               required
//               min="1"
//             />
//           </div>
//         </div>

//         {question.question_type === "mcq" && (
//           <div className="options-section">
//             <h4>Options</h4>
//             {question.options.map((option, index) => (
//               <div key={index} className="option-container">
//                 <input
//                   type="text"
//                   name="option_text"
//                   value={option.option_text}
//                   onChange={(e) => handleOptionChange(index, e)}
//                   placeholder={`Option ${index + 1}`}
//                   required
//                 />
//                 <label className="correct-answer-label">
//                   <input
//                     type="checkbox"
//                     name="is_correct"
//                     checked={option.is_correct}
//                     onChange={(e) => handleOptionChange(index, e)}
//                     className="correct-answer-checkbox"
//                   />
//                   Correct Answer
//                 </label>
//                 {index > 1 && (
//                   <button
//                     type="button"
//                     className="remove-button"
//                     onClick={() => handleRemoveOption(index)}
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//             <button
//               type="button"
//               className="add-option-button"
//               onClick={handleAddOption}
//             >
//               Add Option
//             </button>
//           </div>
//         )}

//         <button type="submit" className="add-question-button">
//           Add Question
//         </button>
//       </form>
//     </div>
//   );
// };

// export default QuestionForm;
