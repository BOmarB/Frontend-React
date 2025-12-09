// src/components/ChatbaseWidget.jsx
import { useEffect } from "react";
import { useAuth } from "../contexts/authContext";

const ChatbaseWidget = () => {
  // Access user authentication data
  const { user } = useAuth();

  // Check if the user has admin or teacher role
  const hasAccess = user && (user.role === "admin" || user.role === "teacher");

  // Function to completely remove the widget and clean up
  const removeWidget = () => {
    // Remove the script if it exists
    const existingScript = document.getElementById("j6WzU905DPPPlMELmCp78");
    if (existingScript) {
      document.body.removeChild(existingScript);
    }

    // Remove the widget iframe if it exists
    const widgetIframe = document.querySelector(".chatbase-iframe");
    if (widgetIframe) {
      widgetIframe.remove();
    }

    // Remove any chat bubble
    const chatBubble = document.querySelector(".chatbase-bubble");
    if (chatBubble) {
      chatBubble.remove();
    }

    // Clean up the global chatbase object
    if (window.chatbase) {
      // Reset chatbase queue
      if (window.chatbase.q) {
        window.chatbase.q = [];
      }

      // Try to hide the widget through the API if it's initialized
      try {
        if (window.chatbase("getState") === "initialized") {
          window.chatbase("hide");
        }
      } catch (e) {
        // Ignore errors if chatbase isn't fully initialized
      }
    }
  };

  useEffect(() => {
    // Only load the widget if the user has access
    if (!hasAccess) {
      removeWidget();
      return;
    }

    // Initialize Chatbase
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args) => {
        if (!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(args);
      };
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") {
            return target.q;
          }
          return (...args) => target(prop, ...args);
        },
      });
    }

    // Load the script
    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "j6WzU905DPPPlMELmCp78";
    script.domain = "www.chatbase.co";
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      removeWidget();
    };
  }, [hasAccess]); // Dependency on hasAccess to re-run when authentication status changes

  return null; // This component doesn't render any visible UI
};

export default ChatbaseWidget;
