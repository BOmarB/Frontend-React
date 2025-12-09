import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("access_token");

    if (storedUser && accessToken) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.status === "Permissioned") {
        setUser(parsedUser);
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    if (userData.status === "Permissioned") {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      logout();
    }
  };

  const logout = () => {
    // Clear user data from localStorage
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Clear all exam-related session storage
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("exam_")) {
        sessionStorage.removeItem(key);
      }
    });

    // Force removal of AI chat widget
    const widgetIframe = document.querySelector(".chatbase-iframe");
    if (widgetIframe) {
      widgetIframe.remove();
    }

    const chatBubble = document.querySelector(".chatbase-bubble");
    if (chatBubble) {
      chatBubble.remove();
    }

    // Clean up the global chatbase object
    if (window.chatbase) {
      try {
        if (window.chatbase("getState") === "initialized") {
          window.chatbase("hide");
        }
      } catch (e) {
        // Ignore errors if chatbase isn't fully initialized
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
