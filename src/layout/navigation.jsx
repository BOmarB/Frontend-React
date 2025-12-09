import React, {
  useState,
  useCallback,
  memo,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import {
  Link,
  Outlet,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import {
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Home,
  Users,
  User,
  Book,
  Award,
} from "lucide-react";
import { useTheme } from "../contexts/themeContext";
import exam from "../exam.png";
import { NotificationButton } from "../components/NotificationButton";
import { getUserNotifications } from "../services/userService";
import { useNotifications } from "../contexts/notificationContext";

const NAV_LINKS = {
  admin: [
    { to: "/admin", text: "Dashboard", icon: Home },
    { to: "/admin/manage-users", text: "Manage Users", icon: Users },
    // { to: "/admin/profile", text: "Profile", icon: User },
  ],
  teacher: [
    { to: "/teacher", text: "Dashboard", icon: Home },
    {
      to: "/teacher/manage-permission",
      text: "Manage Permission",
      icon: Users,
    },
    // { to: "/teacher/profile", text: "Profile", icon: User },
    { to: "/teacher/grades", text: "Grades", icon: Award },
  ],
  student: [
    { to: "/student", text: "Dashboard", icon: Home },
    // { to: "/student/available-exams", text: "Mini-Game", icon: Book },
    // { to: "/student/profile", text: "Profile", icon: User },
    { to: "/student/grades", text: "Grades", icon: Award },
  ],
};
const isExamRoute = (pathname) => {
  return pathname.includes("/take-exam/");
};

const NavLink = memo(
  ({ to, className, onClick, children, icon: Icon, isActive, disabled }) => {
    const baseClasses =
      "relative flex items-center gap-3 rounded-xl transition-all duration-200 no-underline";
    const activeClasses = isActive
      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50";
    const disabledClasses = disabled ? "pointer-events-none opacity-50" : "";

    if (disabled) {
      return (
        <span
          className={`${baseClasses} ${activeClasses} ${className} ${disabledClasses}`}
        >
          {Icon && (
            <Icon
              className={`w-5 h-5 ${
                isActive ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
              }`}
            />
          )}
          <span>{children}</span>
        </span>
      );
    }
    return (
      <Link
        to={to}
        className={`${baseClasses} ${activeClasses} ${className}`}
        onClick={onClick}
        role="menuitem"
        aria-current={isActive ? "page" : undefined}
      >
        {Icon && (
          <Icon
            className={`w-5 h-5 ${
              isActive ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
            }`}
          />
        )}
        <span>{children}</span>
      </Link>
    );
  }
);

const ThemeToggle = memo(({ isDarkMode, toggleDarkMode, className = "" }) => (
  <button
    onClick={toggleDarkMode}
    className={`relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700/70
    text-gray-600 dark:text-gray-300 transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
    hover:scale-105 active:scale-95 ${className}`}
    aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
  >
    <div className="relative w-5 h-5 overflow-hidden">
      <div
        className={`transform transition-all duration-500 ${
          isDarkMode ? "rotate-360" : "rotate-0"
        }`}
      >
        {isDarkMode ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </div>
    </div>
  </button>
));

const Logo = memo(({ role, disabled, className = "" }) => {
  if (disabled) {
    return (
      <div
        className={`group flex items-center gap-2 sm:gap-3 opacity-50 ${className}`}
      >
        <div className="relative rounded-xl p-1.5">
          <img
            src={exam}
            alt=""
            aria-hidden="true"
            className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
            loading="eager"
          />
        </div>
        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Examly
        </span>
      </div>
    );
  }
  return (
    <Link
      to={`/${role || ""}`}
      className={`group flex items-center gap-2 sm:gap-3 no-underline focus:outline-none ${className}`}
      aria-label="Examly Home"
    >
      <div
        className="relative rounded-xl p-1.5 transition-all duration-200 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20
      group-hover:scale-105 group-active:scale-95"
      >
        <img
          src={exam}
          alt=""
          aria-hidden="true"
          className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
          loading="eager"
        />
      </div>
      <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Examly
      </span>
    </Link>
  );
});

const MobileNav = memo(
  ({ isOpen, links, onClose, onLogout, user, location, disabled }) => {
    const navRef = useRef(null);
    const { isDarkMode } = useTheme();

    // Close when clicked outside
    useEffect(() => {
      if (!isOpen) return;

      const handleOutsideClick = (e) => {
        if (navRef.current && !navRef.current.contains(e.target)) {
          onClose();
        }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }, [isOpen, onClose]);

    if (disabled) return null;

    return (
      <div
        ref={navRef}
        className={`absolute top-full left-0 right-0 p-4 
        ${isDarkMode ? "bg-gray-900/95" : "bg-white/95"}
        border-b ${isDarkMode ? "border-gray-800" : "border-gray-200/80"}
        backdrop-blur-xl backdrop-saturate-150
        shadow-lg ${isDarkMode ? "shadow-gray-950/20" : "shadow-gray-200/70"}
        transition-all duration-300 origin-top
        ${
          isOpen
            ? "opacity-100 scale-y-100"
            : "opacity-0 scale-y-0 pointer-events-none"
        }`}
      >
        <div className="space-y-1 max-h-[70vh] overflow-y-auto">
          {links.map(({ to, text, icon }) => (
            <NavLink
              key={to}
              to={to}
              className="w-full px-4 py-3"
              icon={icon}
              isActive={location.pathname === to}
              onClick={onClose}
              disabled={disabled}
            >
              {text}
            </NavLink>
          ))}
          {user && !disabled && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl 
              text-red-500 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20 
              transition-all duration-200
              text-left font-medium
              focus:outline-none focus:ring-2 
              focus:ring-red-500/50 dark:focus:ring-red-400/50`}
              role="menuitem"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    );
  }
);

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [examStartLocation, setExamStartLocation] = useState(null);
  const historyStateRef = useRef(0);
  const historyBlock = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Check if current route is an exam route
  const isInExam = isExamRoute(location.pathname);

  // Add immediate dark mode effect
  useLayoutEffect(() => {
    // Get stored theme or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Apply dark mode immediately before first render
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    // This runs immediately on component mount
    const currentPath = window.location.pathname;
    if (isExamRoute(currentPath)) {
      // Immediately prevent navigation even before React fully initializes
      for (let i = 0; i < 10; i++) {
        window.history.pushState(
          { id: `initial-prevent-${i}` },
          "",
          currentPath
        );
      }

      // Set up an immediate handler for any back button attempt
      const immediateBlocker = (e) => {
        window.history.pushState({ id: "immediate-block" }, "", currentPath);
      };

      window.addEventListener("popstate", immediateBlocker);

      // Run this code immediately and also after a tiny delay to ensure it works
      setTimeout(() => {
        for (let i = 0; i < 5; i++) {
          window.history.pushState(
            { id: `delayed-prevent-${i}` },
            "",
            currentPath
          );
        }
      }, 50);

      return () => {
        window.removeEventListener("popstate", immediateBlocker);
      };
    }
  }, []); // Empty dependency array - this only runs once on mount

  useEffect(() => {
    const isExamPage = isExamRoute(window.location.pathname);
    if (isExamPage) {
      // Set up initial protection immediately
      const preventInitialBack = (e) => {
        e.preventDefault();
        window.history.pushState(null, "", window.location.pathname);
      };

      window.history.pushState(null, "", window.location.pathname);
      window.addEventListener("popstate", preventInitialBack);

      return () => {
        window.removeEventListener("popstate", preventInitialBack);
      };
    }
  }, []); // Empty dependency array ensures this runs once on mount

  useLayoutEffect(() => {
    if (isInExam) {
      // Store the original URL before entering exam
      const originalUrl = location.pathname;

      // Block initial back navigation
      const blockNavigation = () => {
        window.history.pushState({ exam: true }, "", originalUrl);
      };

      // Replace current history and push multiple states
      window.history.replaceState({ exam: true }, "", originalUrl);
      for (let i = 0; i < 5; i++) {
        window.history.pushState({ exam: true }, "", originalUrl);
      }

      // Create interval to constantly reinforce history state
      historyBlock.current = setInterval(() => {
        if (window.location.pathname !== originalUrl) {
          window.history.replaceState({ exam: true }, "", originalUrl);
        }
        window.history.pushState({ exam: true }, "", originalUrl);
      }, 100);

      // Handle popstate events
      const handlePopState = (event) => {
        if (!event.state?.exam) {
          window.history.pushState({ exam: true }, "", originalUrl);
        }
        if (window.location.pathname !== originalUrl) {
          window.history.replaceState({ exam: true }, "", originalUrl);
        }
      };

      window.addEventListener("popstate", handlePopState);

      // Block keyboard navigation
      const handleKeyDown = (e) => {
        // Only block navigation shortcuts when not in editable fields
        if (!e.target.matches("input, textarea, [contenteditable='true']")) {
          if (e.key === "Backspace" || (e.altKey && e.key === "ArrowLeft")) {
            e.preventDefault();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      // Cleanup function
      return () => {
        clearInterval(historyBlock.current);
        window.removeEventListener("popstate", handlePopState);
        document.removeEventListener("keydown", handleKeyDown);
        if (!isInExam) {
          // Cleanup history states when leaving exam
          window.history.go(-5);
        }
      };
    }
  }, [isInExam, location.pathname]);

  // Additional protection for beforeunload
  useEffect(() => {
    if (isInExam) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "";
        return "";
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [isInExam]);

  // Store the exam URL when entering an exam

  useLayoutEffect(() => {
    const currentPath = window.location.pathname;
    if (isExamRoute(currentPath)) {
      // Immediately block back navigation before React finishes mounting
      const handlePopState = (event) => {
        window.history.pushState({ exam: true }, "", currentPath);
      };

      // Replace current history entry and push new states
      window.history.replaceState({ exam: true }, "", currentPath);
      for (let i = 0; i < 3; i++) {
        window.history.pushState({ exam: true }, "", currentPath);
      }

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        // Cleanup history states when leaving exam
        if (!isExamRoute(window.location.pathname)) {
          window.history.go(-3); // Adjust based on number of pushed states
        }
      };
    }
  }, []);

  // Modify the main exam route useEffect
  useEffect(() => {
    if (isInExam) {
      const currentExamPath = location.pathname;
      setExamStartLocation(currentExamPath);

      // Real-time history reinforcement
      const intervalId = setInterval(() => {
        if (window.location.pathname !== currentExamPath) {
          window.history.replaceState({ exam: true }, "", currentExamPath);
        }
      }, 50);

      const handlePopState = () => {
        window.history.pushState({ exam: true }, "", currentExamPath);
        if (window.location.pathname !== currentExamPath) {
          navigate(currentExamPath, { replace: true });
        }
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      setExamStartLocation(null);
    }
  }, [isInExam, location.pathname, navigate]);

  // Combined popstate handling
  useEffect(() => {
    if (isInExam && examStartLocation) {
      // If trying to navigate to a different page during exam, redirect back
      if (location.pathname !== examStartLocation) {
        navigate(examStartLocation, { replace: true });
      }

      const blockNavigation = () => {
        // Increment history state to prevent going back
        historyStateRef.current += 1;
        window.history.pushState(
          { id: historyStateRef.current },
          "",
          examStartLocation
        );
      };

      // Block tab closing/switching
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "";
        return "";
      };

      // Enhanced popstate handler
      const handlePopState = (event) => {
        if (event.state?.id !== historyStateRef.current) {
          blockNavigation();
        }
      };

      // Initial history state
      blockNavigation();

      // Listen for keyboard shortcuts
      const handleKeyDown = (e) => {
        // Block Alt+Left (browser back)
        if (e.altKey && e.keyCode === 37) {
          e.preventDefault();
          blockNavigation();
        }
        // Block Backspace navigation
        if (e.key === "Backspace" && !e.target.matches("input, textarea")) {
          e.preventDefault();
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);
      document.addEventListener("keydown", handleKeyDown);

      // Check periodically if we're still on the correct URL
      const intervalId = setInterval(() => {
        if (window.location.pathname !== examStartLocation) {
          window.history.replaceState(
            { id: historyStateRef.current },
            "",
            examStartLocation
          );
        }
      }, 100);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
        document.removeEventListener("keydown", handleKeyDown);
        clearInterval(intervalId);
      };
    }
  }, [isInExam, examStartLocation, location.pathname, navigate]);

  // Show warning modal when trying to leave exam
  const beforeExamLeave = useCallback(() => {
    if (isInExam) {
      const confirmLeave = window.confirm(
        "Leaving the exam will submit it automatically. Are you sure you want to proceed?"
      );
      if (!confirmLeave) {
        return false;
      }
      // Here you could add logic to auto-submit the exam
    }
    return true;
  }, [isInExam]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const { unreadCount } = useNotifications();

  const handleLogout = useCallback(() => {
    if (isInExam) {
      const canLeave = beforeExamLeave();
      if (!canLeave) {
        // Ensure we stay on exam page even after cancel
        window.history.pushState(
          { id: historyStateRef.current },
          "",
          examStartLocation
        );
        return;
      }
    }
    logout();
    navigate("/login");
  }, [logout, navigate, isInExam, beforeExamLeave, examStartLocation]);

  const links = user
    ? NAV_LINKS[user.role]
    : [
        { to: "/login", text: "Login", icon: User },
        { to: "/register", text: "Register", icon: Users },
      ];

  // Prevent content render until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14 sm:h-16 items-center">
              {/* Logo skeleton */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-xl p-1.5">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              </div>

              {/* Desktop nav links skeleton */}
              <div className="hidden md:flex items-center gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
                  />
                ))}
                <div className="h-6 mx-2 w-px bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
              </div>

              {/* Mobile menu button skeleton */}
              <div className="flex items-center gap-3 md:hidden">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav
        className={`sticky top-0 z-50 transition-all duration-200
            ${
              scrolled
                ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg"
                : "bg-gray-50 dark:bg-gray-900"
            }
          `}
        role="navigation"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <Logo
              role={user?.role}
              disabled={isInExam}
              className="flex-shrink-0"
            />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ to, text, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className="px-3 lg:px-4 py-2"
                  icon={icon}
                  isActive={location.pathname === to}
                  disabled={isInExam}
                >
                  {text}
                </NavLink>
              ))}
              {user && !isInExam && (
                <button
                  onClick={handleLogout}
                  className="p-2.5 ml-1 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 
                        dark:hover:bg-red-900/20 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-red-500/50
                        hover:scale-105 active:scale-95"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
              <div className="h-6 mx-2 w-px bg-gray-200 dark:bg-gray-800" />
              {user && !isInExam && <NotificationButton />}
              <ThemeToggle
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
              <ThemeToggle
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                className="p-2"
              />
              {user && !isInExam && <NotificationButton />}
              {!isInExam && (
                <button
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-300 
                        hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50
                        hover:scale-105 active:scale-95"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-expanded={isOpen}
                  aria-label="Toggle navigation menu"
                >
                  {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNav
          isOpen={isOpen}
          links={links}
          onClose={() => setIsOpen(false)}
          onLogout={handleLogout}
          user={user}
          location={location}
          disabled={isInExam}
        />
      </nav>

      <main className="pb-8">
        {isInExam && location.pathname !== examStartLocation ? (
          <Navigate to={examStartLocation} replace />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default Navigation;
