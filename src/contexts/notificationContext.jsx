import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import {
  getUserNotifications,
  createNotification as apiCreateNotification,
  deleteNotification as apiDeleteNotification,
  markNotificationAsRead as apiMarkNotificationAsRead,
  updateNotification as apiUpdateNotification,
  publishNotification as apiPublishNotification,
  unpublishNotification as apiUnpublishNotification,
} from "../services/userService";
import { useAuth } from "./authContext";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedNotifications = await getUserNotifications("received");
      setNotifications(fetchedNotifications);
      const unread = fetchedNotifications.filter(
        (notif) => !notif.is_read
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch and regular polling
  useEffect(() => {
    fetchNotifications();

    // Set up polling interval for background updates
    const interval = setInterval(fetchNotifications, 30000); // every minute

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Enhanced service wrapper functions that update state after API calls
  const createNotification = async (notificationData) => {
    const response = await apiCreateNotification(notificationData);
    fetchNotifications(); // Refresh notifications after creating one
    return response;
  };

  const updateNotification = async (notificationId, notificationData) => {
    const response = await apiUpdateNotification(
      notificationId,
      notificationData
    );
    fetchNotifications();
    return response;
  };

  const deleteNotification = async (notificationId) => {
    const response = await apiDeleteNotification(notificationId);
    fetchNotifications();
    return response;
  };

  const markNotificationAsRead = async (notificationId) => {
    const response = await apiMarkNotificationAsRead(notificationId);

    // Optimistic update - don't wait for the fetch
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    return response;
  };

  const publishNotification = async (notificationId) => {
    const response = await apiPublishNotification(notificationId);
    fetchNotifications();
    return response;
  };

  const unpublishNotification = async (notificationId) => {
    const response = await apiUnpublishNotification(notificationId);
    fetchNotifications();
    return response;
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    markNotificationAsRead,
    publishNotification,
    unpublishNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
