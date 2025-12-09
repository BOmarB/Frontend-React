import React, { useState, useEffect } from "react";
import { loginUser } from "../services/userService";
import { useAuth } from "../contexts/authContext";
import { useTheme } from "../contexts/themeContext";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Only apply mouse effects on larger screens
      if (window.innerWidth > 768) {
        const { clientX, clientY } = e;
        const x = (clientX - window.innerWidth / 2) / 20;
        const y = (clientY - window.innerHeight / 2) / 20;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password });
      if (response.user) {
        if (response.user.status === "Permissioned") {
          login(response.user);
          navigate(`/${response.user.role}`);
        } else {
          localStorage.removeItem("user");
          navigate("/waiting-approval");
        }
      } else {
        console.log(response , "ss :" , response.message);
        setError(response.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred during login");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className={`relative flex items-center justify-center min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8 ${
        isDarkMode ? "bg-gray-900" : "bg-slate-50"
      }`}
    >
      {/* Animated background elements - hidden on mobile */}
      <div className="absolute inset-0 w-full h-full hidden md:block">
        <div
          className={`absolute w-72 md:w-96 h-72 md:h-96 rounded-full blur-3xl ${
            isDarkMode ? "bg-blue-500/10" : "bg-indigo-500/30"
          }`}
          style={{
            transform: `translate(${mousePosition.x * 2}px, ${
              mousePosition.y * 2
            }px)`,
            top: "20%",
            left: "15%",
            transition: "transform 0.2s ease-out",
          }}
        />
        <div
          className={`absolute w-72 md:w-96 h-72 md:h-96 rounded-full blur-3xl ${
            isDarkMode ? "bg-purple-500/10" : "bg-pink-500/20"
          }`}
          style={{
            transform: `translate(${mousePosition.x * -2}px, ${
              mousePosition.y * -2
            }px)`,
            bottom: "20%",
            right: "15%",
            transition: "transform 0.2s ease-out",
          }}
        />
      </div>

      {/* Floating shapes - hidden on mobile */}
      <div className="absolute inset-0 w-full h-full hidden md:block">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-12 md:w-16 h-12 md:h-16 backdrop-blur-sm ${
              isDarkMode
                ? "bg-white/5"
                : i % 2 === 0
                ? "bg-indigo-100/60"
                : "bg-pink-100/60"
            } rounded-lg`}
            style={{
              transform: `translate(${mousePosition.x * (i + 1) * 0.3}px, ${
                mousePosition.y * (i + 1) * 0.3
              }px) rotate(${45 + i * 15}deg)`,
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
              transition: "transform 0.2s ease-out",
            }}
          />
        ))}
      </div>

      {/* Main form container */}
      <div
        className={`relative w-full max-w-[320px] sm:max-w-[380px] md:max-w-md px-4 sm:px-6 md:px-8 py-8 md:py-12 rounded-xl md:rounded-2xl shadow-lg ${
          isDarkMode
            ? "bg-gray-800/50 backdrop-blur-xl backdrop-saturate-150"
            : "bg-white/90 backdrop-blur-xl backdrop-saturate-150 shadow-xl"
        }`}
        style={{
          transform:
            window.innerWidth > 768
              ? `translate(${mousePosition.x * 0.5}px, ${
                  mousePosition.y * 0.5
                }px) perspective(1000px) rotateX(${
                  mousePosition.y * 0.05
                }deg) rotateY(${-mousePosition.x * 0.05}deg)`
              : "none",
          transition: "transform 0.2s ease-out",
        }}
      >
        <div className="space-y-4 md:space-y-6">
          <div>
            <h2
              className={`text-xl md:text-2xl font-bold tracking-tight ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome back
            </h2>
            <p
              className={`mt-2 text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Please sign in to your account
            </p>
          </div>

          {error && (
            <div
              className={`mt-4 md:mt-8 p-2 rounded-lg flex items-center gap-2 md:gap-3 ${
                isDarkMode
                  ? "bg-red-900/20 text-red-400"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <AlertCircle className="h-4 md:h-5 w-4 md:w-5 flex-shrink-0" />
              <p className="mt-3 text-xs md:text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail
                      className={`h-4 w-4 md:h-5 md:w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`block w-full pl-10 pr-3 py-2 md:py-2.5 text-sm md:text-base rounded-lg md:rounded-xl border transition-colors duration-200
                    focus:outline-none focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className={`h-4 w-4 md:h-5 md:w-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`block w-full pl-10 pr-12 py-2 md:py-2.5 text-sm md:text-base rounded-lg md:rounded-xl border transition-colors duration-200
                    focus:outline-none focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff
                        className={`h-4 w-4 md:h-5 md:w-5 ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        } hover:text-gray-600 transition-colors duration-200`}
                      />
                    ) : (
                      <Eye
                        className={`h-4 w-4 md:h-5 md:w-5 ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        } hover:text-gray-600 transition-colors duration-200`}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex items-center justify-center w-full px-4 py-2 md:py-2.5 text-sm font-medium
                text-white bg-indigo-600 rounded-lg md:rounded-xl hover:bg-indigo-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign in
              </button>
            </div>
          </form>

          <div
            className={`text-xs md:text-sm text-center ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Register as a Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
