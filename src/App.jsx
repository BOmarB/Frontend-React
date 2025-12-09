import { AuthProvider } from "./contexts/authContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/adminP/adminDashboard";
import StudentDashboard from "./pages/studentP/studentDashboard";
import LoginForm from "./components/LoginForm";
import Navigation from "./layout/navigation";
// import RegistrationForm from "./components/RegistrationForm";
import { PrivateRoute } from "./components/privateRoute";
import RegistrationForm from "./components/RegistrationForm";
import Error from "./pages/error";
import FrontPage from "./pages/frontPage";
import MangeUsers from "./pages/adminP/mangeUsers";
import TeatcherDashboard from "./pages/teacherP/teacherDashboard";
import LearnMore from "./pages/leanMore";
import ExamEditor from "./pages/teacherP/editExam";
import TakeExam from "./pages/studentP/takeExam";
import ExamResult from "./pages/studentP/examResult";
import CreateEditExam from "./pages/teacherP/createExam";
import ExamAttempts from "./pages/teacherP/examAttempts";
import ExamCorrection from "./pages/teacherP/examCorrection";
import RegisterStudent from "./components/registerStudent";
import ManagePermissions from "./pages/teacherP/studentPermission";
import DinoGame from "./pages/dinoGame";
import ProfilePage from "./pages/profilePage";
import CreateQuiz from "./pages/teacherP/createQuiz";
import GradeManagement from "./pages/teacherP/gradingPage";
import StudentGrades from "./pages/studentP/studentGrades";
import AttemptResults from "./components/attemptResult";
import { ThemeProvider } from "./contexts/themeContext";
import EditUser from "./components/EditUser";
import NotificationsPage from "./pages/notificationPage";
import { NotificationProvider } from "./contexts/notificationContext";
import ChatbaseWidget from "./components/ai";

const queryClient = new QueryClient();

function App() {
  // Utility function for creating admin routes
  const createRoute = (path, Component, role) => (
    <Route
      path={path}
      element={
        <PrivateRoute allowedRoles={[role]}>
          {typeof Component === "function" ? <Component /> : Component}
        </PrivateRoute>
      }
    />
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <ChatbaseWidget />
              <Routes>
                <Route path="/" element={<Navigation />}>
                  <Route index element={<FrontPage />} />
                  <Route path="login" element={<LoginForm />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="register" element={<RegisterStudent />} />
                  <Route path="waiting-approval" element={<DinoGame />} />
                  {/* Admin Routes */}
                  {/* admin */}
                  {/* admin */}
                  {createRoute("admin", AdminDashboard, "admin")}
                  {/* admin/add-user */}
                  {createRoute("admin/add-user", RegistrationForm, "admin")}
                  {createRoute("admin/profile", ProfilePage, "admin")}
                  {/* admin/manage-users */}
                  {createRoute("admin/manage-users", MangeUsers, "admin")}
                  {createRoute("admin/users/:userId/edit", EditUser, "admin")}
                  {/* Teacher Routes */}
                  {/* teacher */}
                  {createRoute("teacher", TeatcherDashboard, "teacher")}{" "}
                  {createRoute("teacher/profile", ProfilePage, "teacher")}
                  {/* teacher/create-exam */}
                  {createRoute(
                    "teacher/create-exam",
                    CreateEditExam,
                    "teacher"
                  )}
                  {/* teacher/my-exams */}
                  {createRoute("teacher/my-exams", RegistrationForm, "teacher")}
                  {/* ExamEditor */}
                  {createRoute("exam/:examId/edit", ExamEditor, "teacher")}
                  {/* teacher/grade-exams */}
                  {createRoute(
                    "teacher/grade-exams",
                    RegistrationForm,
                    "teacher"
                  )}
                  {/* ExamAttempts */}
                  {createRoute(
                    "/exam/:examId/attempts",
                    ExamAttempts,
                    "teacher"
                  )}
                  {/* ExamAttempts */}
                  {createRoute(
                    "/exam/:examId/correct/:attemptId",
                    ExamCorrection,
                    "teacher"
                  )}{" "}
                  {createRoute(
                    "teacher/manage-permission",
                    ManagePermissions,
                    "teacher"
                  )}
                  {createRoute("teacher/grades", GradeManagement, "teacher")}
                  {/* teacher/create-quiz */}
                  {createRoute("teacher/create-quiz", CreateQuiz, "teacher")}
                  {/* Student Routes */}
                  {/* student */}
                  {createRoute("student", StudentDashboard, "student")}{" "}
                  {createRoute("student/profile", ProfilePage, "student")}
                  {/* student/available-exams */}
                  {createRoute("student/available-exams", DinoGame, "student")}
                  {/* take-exam */}
                  {createRoute(
                    "student/take-exam/:examId/:attemptId",
                    TakeExam,
                    "student"
                  )}
                  {/* exam-result */}
                  {createRoute("exam-result/:examId", ExamResult, "student")}
                  {/* student/my-grades */}
                  {createRoute("student/grades", StudentGrades, "student")}
                  {createRoute(
                    "/attempt/:attemptId/results",
                    AttemptResults,
                    "student"
                  )}
                  {/* Fallback route */}
                  <Route path="*" element={<Error />} />
                  <Route path="learn-more" element={<LearnMore />} />
                </Route>
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
