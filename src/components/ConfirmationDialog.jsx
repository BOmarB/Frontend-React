export const ConfirmationDialog = ({
  isOpen,
  onCancel,
  onConfirm,
  isDarkMode,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-lg ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } w-96`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDarkMode ? "text-gray-200" : "text-gray-900"
          }`}
        >
          Confirm Submission
        </h3>
        <p className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          Are you sure you want to submit your exam? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Submitting..." : "Confirm Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};
