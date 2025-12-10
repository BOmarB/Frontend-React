import axios from "axios";
// 192.168.0.180
const API_URL = process.env.REACT_APP_API_URL;
const api = axios.create({
  baseURL: API_URL,
});
console.log()
// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        if (newToken) {
          localStorage.setItem("access_token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const loginUser = async (credentials) => {
  try {
    const { data } = await api.post("/login", credentials);
    if (data.user && data.tokens) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("access_token", data.tokens.access_token);
      localStorage.setItem("refresh_token", data.tokens.refresh_token);
    }
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const refreshToken = async () => {
  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) return null;

  try {
    const { data } = await api.post("/refresh-token", { refresh_token });
    return data.access_token || null;
  } catch (error) {
    return null;
  }
};

// User management endpoints
export const addUser = async (user) => {
  const { data } = await api.post("/add-user", user);
  return data;
};

export const getUsers = async () => {
  const { data } = await api.get("/users");
  return data;
};

export const updatePermissions = async (permissionData) => {
  const { data } = await api.put("/users/permissions", permissionData);
  return data;
};

// Profile endpoints
export const getProfile = async (userId) => {
  const { data } = await api.get(`/profile/${userId}`);
  return data;
};

export const updateProfile = async (userId, profileData) => {
  const { data } = await api.put(`/profile/${userId}`, profileData);
  return data;
};

// Module endpoints
export const getAllModules = async () => {
  const { data } = await api.get("/get-modules");
  return data;
};

export const createModule = async (module) => {
  const { data } = await api.post("/create-module", module);
  return data;
};

// Quiz endpoints
export const createQuiz = async (quizData) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const { data } = await api.post("/create-quiz", {
    ...quizData,
    teacher_id: user.id,
  });
  if (!data.success) {
    throw new Error(data.message || "Failed to create quiz");
  }
  return data;
};

// Exam endpoints
export const createExam = async (examData) => {
  const { data } = await api.post("/create-exam", examData);
  if (!data.success) {
    throw new Error(data.message || "Failed to create exam");
  }
  return data;
};

export const getExamsByTeacher = async (teacherId) => {
  const { data } = await api.get(`/teacher-exams/${teacherId}`);
  return data;
};

export const getStudentExams = async (groupId) => {
  const { data } = await api.get(`/student-exams/${groupId}`);
  return data;
};
export const getStudentExamsById = async (userId) => {
  const { data } = await api.get(`/student-exams/${userId}`);
  return data;
};
export const validateStartExam = async (validateData) => {
  const { data } = await api.post(`/validate-exam-access`, validateData);
  return data;
};
export const startExam = async (startExamData) => {
  const { data } = await api.post("/start-exam", startExamData);
  return data;
};
export const submitExamApi = async (submitExamData) => {
  const { data } = await api.post("/submit-exam", submitExamData);
  return data;
};
export const createAttempt = async (createAttemptData) => {
  const { data } = await api.post("/create-attempt", createAttemptData);
  return data;
};
export const verifyExamAttempt = async (attemptId) => {
  try {
    if (!attemptId) {
      console.error("No attempt ID provided to verifyExamAttempt");
      return { valid: false, status: null };
    }

    const { data } = await api.post("/v-attempt", { attemptId });

    // Make sure we have valid data structure
    if (!data || typeof data !== "object") {
      console.error("Invalid response from verifyExamAttempt");
      return { valid: false, status: null };
    }

    return data;
  } catch (error) {
    console.error("Error in verifyExamAttempt:", error);
    // Return a sensible default to avoid undefined errors
    return { valid: false, status: null };
  }
};
// export const verifyAttemptStatus = async (vAttemptStatusData) => {
//   const { data } = await api.post("/v-attempt-status", vAttemptStatusData);
//   return data;
// };

export const editExam = async (examId, userId) => {
  const { data } = await api.get(`/exam/${examId}`, {
    params: { teacher_id: userId },
  });
  return data;
};

export const examUpdate = async (examData) => {
  const { data } = await api.post("/update-exam", examData);
  return data;
};

export const deleteExam = async (examId) => {
  const { data } = await api.delete(`/delete-exam/${examId}`);
  return data;
};
export const getStudentExam = async (userId) => {
  const { data } = await api.get(`/student-exams-grade/${userId}`);
  return data;
};

export const toggleExamStatus = async (examId, currentStatus) => {
  const newStatus = currentStatus === "published" ? "draft" : "published";
  const { data } = await api.post(`/toggle-exam-status/${examId}`, {
    status: newStatus,
  });
  return data;
};

// Question endpoints
export const createQuestion = async (questionData) => {
  const { data } = await api.post("/create-question", questionData);
  if (!data.success) {
    throw new Error(data.message || "Failed to create question");
  }
  return data;
};

export const getExamQuestions = async (examId) => {
  const { data } = await api.get(`/exam-questions/${examId}`);
  return data;
};

// Group endpoints
export const getAllGroups = async () => {
  const { data } = await api.get("/groups");
  return data;
};

export const createGroup = async (group) => {
  const { data } = await api.post("/groups", group);
  return data;
};

// Attempt endpoints
export const getAttemptDetails = async () => {
  const { data } = await api.get("/attempt-details3");
  return data;
};

export const updateAttemptScore = async (attemptId, score) => {
  const { data } = await api.put(`/update-score/${attemptId}`, { score });
  return data;
};
export const updateAttempt = async (attemptId) => {
  const { data } = await api.get(`/update-attempt/${attemptId}`);
  return data;
};
export const fetchAttemptsResults = async (attemptId) => {
  const { data } = await api.post(`/attempt-details2/${attemptId}`);
  return data;
};

export const getExamAttempts = async (examId) => {
  try {
    const { data } = await api.get(`/exam-attempts/${examId}`);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const getExamDetails = async (attemptId) => {
  try {
    const { data } = await api.get(`/attempt-details2/${attemptId}`);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserById = async (userId) => {
  const { data } = await api.get(`/users2/${userId}`);
  return data;
};

export const updateUser = async (userId, userData) => {
  const { data } = await api.put(`/users3/${userId}`, userData);
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await api.delete(`/users/${userId}`);
  return data;
};

export const createNotification = async (notificationData) => {
  const { data } = await api.post("/create-notification", notificationData);
  return data;
};

export const updateNotification = async (notificationId, notificationData) => {
  const { data } = await api.put(
    `/update-notification/${notificationId}`,
    notificationData
  );
  return data;
};

export const deleteNotification = async (notificationId) => {
  const { data } = await api.delete(`/delete-notification/${notificationId}`);
  return data;
};

export const getUserNotifications = async (type = "received") => {
  const { data } = await api.get(`/user-notifications/${type}`);
  return data;
};

export const markNotificationAsRead = async (notificationId) => {
  const { data } = await api.post(`/mark-notification-read/${notificationId}`);
  return data;
};

export const publishNotification = async (notificationId) => {
  const { data } = await api.put(`/notifications/${notificationId}/publish`);
  return data;
};

export const unpublishNotification = async (notificationId) => {
  const { data } = await api.put(`/notifications/${notificationId}/unpublish`);
  return data;
};
