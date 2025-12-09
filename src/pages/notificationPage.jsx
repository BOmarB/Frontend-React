import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Users,
  Bell,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle,
  Plus,
  ArrowDown,
  Search,
  Filter,
  LineChart as LineChartIcon,
  Book,
} from "lucide-react";
import {
  getAllGroups,
  getUserNotifications,
  getUsers,
} from "../services/userService";
import { useTheme } from "../contexts/themeContext";
import { useAuth } from "../contexts/authContext";
import { useNotifications } from "../contexts/notificationContext";

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("received");
  const [notification, setNotification] = useState(null);
  const [editingNotification, setEditingNotification] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    userIds: [],
    groupIds: [],
    image_data: null,
  });
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const {
    createNotification,
    deleteNotification,
    markNotificationAsRead,
    updateNotification,
    publishNotification,
    unpublishNotification,
    refreshNotifications,
  } = useNotifications();
  useEffect(() => {
    loadData();
  }, [selectedTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const groupsResponse = await getAllGroups();
      const usersResponse = await getUsers();

      if (groupsResponse.success) {
        setGroups(groupsResponse.groups);
      }

      setUsers(usersResponse);

      const notificationsResponse = await getUserNotifications(selectedTab);
      if (notificationsResponse) {
        setNotifications(notificationsResponse);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setNotification({
        message: "Error loading notifications",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        // 5MB limit
        setNotification({
          message: "Image size should be less than 5MB",
          type: "error",
        });
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setNotification({
          message: "Please upload an image file (JPEG, PNG, or GIF)",
          type: "error",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNotificationForm((prev) => ({
          ...prev,
          image_data: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setNotificationForm((prev) => ({
      ...prev,
      image_data: null,
    }));
  };

  const handleRecipientsChange = (type, id) => {
    setNotificationForm((prev) => {
      const currentIds = prev[type];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((existingId) => existingId !== id)
        : [...currentIds, id];
      return { ...prev, [type]: newIds };
    });
  };

  const handleCreateNotification = async () => {
    try {
      if (!notificationForm.title || !notificationForm.message) {
        setNotification({
          message: "Title and message are required",
          type: "error",
        });
        return;
      }

      if (
        notificationForm.userIds.length === 0 &&
        notificationForm.groupIds.length === 0
      ) {
        setNotification({
          message: "Please select at least one recipient",
          type: "error",
        });
        return;
      }

      const response = await createNotification(notificationForm);
      if (response.success) {
        setNotification({
          message: "Notification created successfully!",
          type: "success",
        });

        // Reset form and refresh notifications
        setNotificationForm({
          title: "",
          message: "",
          userIds: [],
          groupIds: [],
          image_data: null,
        });

        // Close the create form
        setShowCreateForm(false);

        // Fetch updated notifications
        setSelectedTab("sent");
        await loadData();
      }
    } catch (error) {
      console.error("Failed to create notification", error);
      setNotification({
        message: "Error creating notification",
        type: "error",
      });
    }
  };

  const handleUpdateNotification = async () => {
    try {
      if (!notificationForm.title || !notificationForm.message) {
        setNotification({
          message: "Title and message are required",
          type: "error",
        });
        return;
      }

      const response = await updateNotification(
        editingNotification.notification_id,
        {
          ...notificationForm,
          status: editingNotification.status,
        }
      );

      if (response.success) {
        setNotification({
          message: "Notification updated successfully!",
          type: "success",
        });

        // Reset form and refresh notifications
        setNotificationForm({
          title: "",
          message: "",
          userIds: [],
          groupIds: [],
          image_data: null,
        });
        setEditingNotification(null);
        setShowCreateForm(false);
        await loadData();
      } else {
        const pError = notifications.map((n) => n.status === "published");
        if (pError) {
          setNotification({
            message: "Cannot update published notification",
            type: "error",
          });
        }
      }
    } catch (error) {
      console.error("Failed to update notification", error);
      setNotification({
        message: "Error updating notification",
        type: "error",
      });
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await deleteNotification(notificationId);
      console.log(response);
      if (response.success) {
        setNotification({
          message: "Notification deleted successfully!",
          type: "success",
        });
        setNotifications(notifications.filter((n) => n.id !== notificationId));
        await loadData();
      } else {
        const pError = notifications.map((n) => n.status === "published");
        if (pError) {
          setNotification({
            message: "Cannot delete published notification",
            type: "error",
          });
        }
      }
    } catch (error) {
      console.error("Failed to delete notification", error);

      setNotification({
        message: "Error deleting notification",
        type: "error",
      });
    }
  };

  const handlePublishNotification = async (notificationId) => {
    try {
      const response = await publishNotification(notificationId);

      if (response.success) {
        setNotification({
          message: "Notification published successfully!",
          type: "success",
        });

        // await loadData();
        setNotifications(
          notifications.map((n) =>
            n.notification_id === notificationId
              ? { ...n, status: "published" }
              : n
          )
        );
      }
    } catch (error) {
      console.error("Failed to publish notification", error);
      setNotification({
        message: "Error publishing notification",
        type: "error",
      });
    }
  };

  const handleUnpublishNotification = async (notificationId) => {
    try {
      const response = await unpublishNotification(notificationId);

      if (response.success) {
        setNotification({
          message: "Notification unpublished successfully!",
          type: "success",
        });

        // await loadData();

        setNotifications(
          notifications.map((n) =>
            n.notification_id === notificationId ? { ...n, status: "draft" } : n
          )
        );
      }
    } catch (error) {
      console.error("Failed to unpublish notification", error);
      setNotification({
        message: "Error unpublishing notification",
        type: "error",
      });
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await markNotificationAsRead(notificationId);
      if (response.success) {
        setNotification({
          message: "Notification marked as read!",
          type: "success",
        });
        setNotifications(
          notifications.map((n) =>
            n.notification_id === notificationId ? { ...n, is_read: true } : n
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      setNotification({
        message: "Error updating notification status",
        type: "error",
      });
    }
  };

  const LoadingSpinner = () => (
    <motion.div
      className="flex justify-center items-center h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(
    (notif) =>
      notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`min-h-screen p-4 sm:p-6 md:p-8 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <h1
            className={`text-3xl font-bold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Notifications
          </h1>
          <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            {selectedTab === "received"
              ? "View and manage your notifications"
              : "Create and manage notifications for users"}
          </p>
        </div>

        {/* Stats Cards (for received notifications) */}
        {/* {selectedTab === "received" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl p-4 border ${
                isDarkMode ? "border-gray-700" : "border-gray-200/80"
              }`}
            >
              <div className="flex items-center mb-2">
                <Bell
                  className={`w-5 h-5 mr-2 ${
                    isDarkMode ? "text-blue-400" : "text-blue-500"
                  }`}
                />
                <h3 className="font-semibold">All Notifications</h3>
              </div>
              <p className="text-3xl font-bold">{notifications.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl p-4 border ${
                isDarkMode ? "border-gray-700" : "border-gray-200/80"
              }`}
            >
              <div className="flex items-center mb-2">
                <CheckCircle
                  className={`w-5 h-5 mr-2 ${
                    isDarkMode ? "text-green-400" : "text-green-500"
                  }`}
                />
                <h3 className="font-semibold">Read</h3>
              </div>
              <p className="text-3xl font-bold">
                {notifications.filter((n) => n.is_read).length}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl p-4 border ${
                isDarkMode ? "border-gray-700" : "border-gray-200/80"
              }`}
            >
              <div className="flex items-center mb-2">
                <Bell
                  className={`w-5 h-5 mr-2 ${
                    isDarkMode ? "text-yellow-400" : "text-yellow-500"
                  }`}
                />
                <h3 className="font-semibold">Unread</h3>
              </div>
              <p className="text-3xl font-bold">
                {notifications.filter((n) => !n.is_read).length}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl p-4 border ${
                isDarkMode ? "border-gray-700" : "border-gray-200/80"
              }`}
            >
              <div className="flex items-center mb-2">
                <Calendar
                  className={`w-5 h-5 mr-2 ${
                    isDarkMode ? "text-purple-400" : "text-purple-500"
                  }`}
                />
                <h3 className="font-semibold">Recent</h3>
              </div>
              <p className="text-3xl font-bold">
                {
                  notifications.filter((n) => {
                    const date = new Date(n.created_at);
                    const now = new Date();
                    const daysDiff = Math.floor(
                      (now - date) / (1000 * 60 * 60 * 24)
                    );
                    return daysDiff < 7;
                  }).length
                }
              </p>
            </motion.div>
          </div>
        )} */}

        {/* Tabs and Search Section */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab("received")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === "received"
                  ? "bg-blue-600 text-white"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Received</span>
            </button>

            {user?.role !== "student" && (
              <button
                onClick={() => setSelectedTab("sent")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === "sent"
                    ? "bg-blue-600 text-white"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Sent</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className={`relative flex-grow md:w-64`}>
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              />
            </div>

            {user?.role !== "student" && (
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setEditingNotification(null);
                  if (!showCreateForm) {
                    setNotificationForm({
                      title: "",
                      message: "",
                      userIds: [],
                      groupIds: [],
                      image_data: null,
                    });
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
                  showCreateForm
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {showCreateForm ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>New</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Create Notification Form */}
        {user?.role !== "student" && showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 rounded-xl shadow-sm ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            } border ${
              isDarkMode ? "border-gray-800" : "border-gray-200/80"
            } p-6`}
          >
            <div className="flex items-center gap-2 mb-6">
              <Send
                className={`w-5 h-5 ${
                  isDarkMode ? "text-blue-400" : "text-blue-500"
                }`}
              />
              <h2
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {editingNotification
                  ? `Edit Notification ${
                      editingNotification.status === "published"
                        ? "(Published)"
                        : "(Draft)"
                    }`
                  : "Create New Notification"}
              </h2>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label
                    htmlFor="title"
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Notification Title"
                    value={notificationForm.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Notification Message"
                    value={notificationForm.message}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Image (Optional)
                </label>

                {notificationForm.image_data ? (
                  <div className="relative">
                    <img
                      src={notificationForm.image_data}
                      alt="Preview"
                      className="max-h-64 rounded-lg object-contain bg-gray-100 dark:bg-gray-700 p-2 w-full"
                    />
                    <button
                      onClick={handleImageRemove}
                      className={`absolute top-2 right-2 p-1 rounded-full ${
                        isDarkMode ? "bg-gray-800" : "bg-white"
                      } text-red-500 hover:text-red-600 shadow-sm`}
                      aria-label="Remove image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      isDarkMode
                        ? "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                    }`}
                    onClick={() =>
                      document.getElementById("image-upload").click()
                    }
                  >
                    <p
                      className={`${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Click to upload an image
                    </p>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Recipients - Users
                  </label>
                  <div
                    className={`p-4 rounded-xl max-h-48 overflow-y-auto scrollbar-thin ${
                      isDarkMode
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {users.length > 0 ? (
                      users.map((user) => (
                        <div key={user.id} className="mb-2 flex items-center">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={notificationForm.userIds.includes(user.id)}
                            onChange={() =>
                              handleRecipientsChange("userIds", user.id)
                            }
                            className={`mr-2 rounded ${
                              isDarkMode ? "bg-gray-700 border-gray-600" : ""
                            }`}
                          />
                          <label
                            htmlFor={`user-${user.id}`}
                            className={
                              isDarkMode ? "text-gray-200" : "text-gray-700"
                            }
                          >
                            {user.full_name || user.username}
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-2 text-gray-500">
                        No users available
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Recipients - Groups
                  </label>
                  <div
                    className={`p-4 rounded-xl max-h-48 overflow-y-auto scrollbar-thin ${
                      isDarkMode
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {groups.length > 0 ? (
                      groups.map((group) => (
                        <div key={group.id} className="mb-2 flex items-center">
                          <input
                            type="checkbox"
                            id={`group-${group.id}`}
                            checked={notificationForm.groupIds.includes(
                              group.id
                            )}
                            onChange={() =>
                              handleRecipientsChange("groupIds", group.id)
                            }
                            className={`mr-2 rounded ${
                              isDarkMode ? "bg-gray-700 border-gray-600" : ""
                            }`}
                          />
                          <label
                            htmlFor={`group-${group.id}`}
                            className={
                              isDarkMode ? "text-gray-200" : "text-gray-700"
                            }
                          >
                            {group.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-2 text-gray-500">
                        No groups available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-end mt-6">
                {editingNotification ? (
                  <>
                    <button
                      onClick={handleUpdateNotification}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                      <Edit2 className="w-4 h-4" /> Update
                    </button>
                    <button
                      onClick={() => {
                        setEditingNotification(null);
                        setShowCreateForm(false);
                        setNotificationForm({
                          title: "",
                          message: "",
                          userIds: [],
                          groupIds: [],
                          image_data: null,
                        });
                      }}
                      className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCreateNotification}
                      className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                      <Send className="w-4 h-4" /> Send
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNotificationForm({
                          title: "",
                          message: "",
                          userIds: [],
                          groupIds: [],
                          image_data: null,
                        });
                      }}
                      className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl ${
            isDarkMode ? "bg-gray-900" : "bg-white"
          } border ${isDarkMode ? "border-gray-800" : "border-gray-200/80"}`}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bell
                className={`w-5 h-5 ${
                  isDarkMode ? "text-blue-400" : "text-blue-500"
                }`}
              />
              <h2
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {selectedTab === "sent"
                  ? "Sent Notifications"
                  : "Your Notifications"}
              </h2>
            </div>

            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div
                  className={`text-center py-10 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-25" />
                  <p className="text-lg">No notifications found</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">
                      Try adjusting your search term
                    </p>
                  )}
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <motion.div
                    key={notif.id || notif.notification_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-6 border ${
                      isDarkMode
                        ? notif.is_read
                          ? "bg-gray-800 border-gray-700"
                          : "bg-gray-800 border-blue-500"
                        : notif.is_read
                        ? "bg-white border-gray-200"
                        : "bg-white border-blue-500"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3
                          className={`font-semibold text-lg ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {notif.title}
                        </h3>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {selectedTab === "received"
                            ? `From: ${notif.sender_name || "System"}`
                            : `Status: ${
                                notif.status === "published"
                                  ? "Published"
                                  : "Draft"
                              }`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedTab === "received" ? (
                          !notif.is_read && (
                            <button
                              onClick={() =>
                                handleMarkAsRead(notif.notification_id)
                              }
                              className={`p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors`}
                              title="Mark as read"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingNotification(notif);
                                setNotificationForm({
                                  title: notif.title,
                                  message: notif.message,
                                  userIds: notif.recipient_user_ids || [],
                                  groupIds: notif.recipient_group_ids || [],
                                  image_data: notif.image_data,
                                });
                                setShowCreateForm(true);
                              }}
                              className={`p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors`}
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>

                            {notif.status === "draft" ? (
                              <button
                                onClick={() =>
                                  handlePublishNotification(
                                    notif.notification_id
                                  )
                                }
                                className={`p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors`}
                                title="Publish"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleUnpublishNotification(
                                    notif.notification_id
                                  )
                                }
                                className={`p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-500/10 transition-colors`}
                                title="Unpublish"
                              >
                                <ArrowDown className="w-5 h-5" />
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handleDeleteNotification(notif.notification_id)
                              }
                              className={`p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors`}
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p
                        className={`${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {notif.message}
                      </p>
                    </div>

                    {/* Image display section */}
                    {notif.image_data && (
                      <div className="mb-4">
                        <img
                          src={notif.image_data}
                          alt="Notification Image"
                          className="max-h-64 w-full object-contain rounded-lg bg-gray-100 dark:bg-gray-700 p-2"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      {selectedTab === "sent" && (
                        <div
                          className={`flex items-center ${
                            isDarkMode ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Recipients:{" "}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ml-2 ${
                              isDarkMode
                                ? "bg-blue-900 text-blue-300"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {notif.recipient_count || 0}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex items-center ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          Time:{" "}
                          {new Date(notif.created_at).toLocaleTimeString()}
                        </span>
                      </div>

                      <div
                        className={`flex items-center ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Date:{" "}
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
                notification.type === "success"
                  ? isDarkMode
                    ? "bg-green-900 border-l-4 border-green-500 text-green-100"
                    : "bg-green-50 border-l-4 border-green-500 text-green-700"
                  : isDarkMode
                  ? "bg-red-900 border-l-4 border-red-500 text-red-100"
                  : "bg-red-50 border-l-4 border-red-500 text-red-700"
              }`}
              onAnimationComplete={() => {
                setTimeout(() => setNotification(null), 3000);
              }}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NotificationManagement;
