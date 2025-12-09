import React from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/notificationContext";

export const NotificationButton = () => {
  const navigate = useNavigate();
  // Get unreadCount from the context instead of props
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700/70
      text-gray-600 dark:text-gray-300 transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
      hover:scale-105 active:scale-95"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 justify-center items-center text-white text-xs">
            {unreadCount}
          </span>
        </span>
      )}
    </button>
  );
};
