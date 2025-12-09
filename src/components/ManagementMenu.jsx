import React, { useState } from "react";
import { ChevronLeft, Users, Book, Plus, X } from "lucide-react";
import { GlassCard } from "../pages/teacherP/teacherDashboard";
import { createGroup, createModule } from "../services/userService";

const ManagementMenu = ({ isDarkMode, onGroupCreate, onModuleCreate }) => {
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCreateGroup = async () => {
    try {
      const response = await createGroup({ name: newName });

      if (response.message === "Group created successfully") {
        if (onGroupCreate) {
          onGroupCreate({ name: newName });
        }
        setNewName("");
        setShowGroupDialog(false);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleCreateModule = async () => {
    try {
      const response = await createModule({ name: newName });

      if (response.message === "Module created successfully") {
        if (onModuleCreate) {
          onModuleCreate({ name: newName });
        }
        setNewName("");
        setShowModuleDialog(false);
      }
    } catch (error) {
      console.error("Error creating module:", error);
    }
  };

  const Modal = ({ title, isOpen, onClose, onSubmit }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit();
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <GlassCard
          isDarkMode={isDarkMode}
          className="max-w-md w-full rounded-2xl p-6"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="p-6">
              <h3
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-white" : ""
                }`}
              >
                {title}
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={`mt-1 w-full rounded-lg p-2 border ${
                      isDarkMode
                        ? "bg-gray-700 text-white border-gray-600"
                        : "border-gray-300 text-gray-900"
                    }`}
                    placeholder={`Enter ${title.toLowerCase()}`}
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-4 py-2 rounded-xl ${
                      isDarkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create {title.split(" ").pop()}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </GlassCard>
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`p-2 rounded-lg transition-colors ${
          isDarkMode
            ? "hover:bg-gray-700 text-gray-300"
            : "hover:bg-gray-100 text-gray-600"
        }`}
      >
        <ChevronLeft
          className={`w-6 h-6 transform ${
            isMenuOpen ? "rotate-90" : "-rotate-90"
          }`}
        />
      </button>

      {isMenuOpen && (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <div className="py-2">
            <button
              onClick={() => {
                setShowGroupDialog(true);
                setIsMenuOpen(false);
              }}
              className={`w-full px-4 py-2 text-left flex items-center gap-2 ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              Add New Group
            </button>
            <button
              onClick={() => {
                setShowModuleDialog(true);
                setIsMenuOpen(false);
              }}
              className={`w-full px-4 py-2 text-left flex items-center gap-2 ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Book className="w-4 h-4" />
              Add Module
            </button>
          </div>
        </div>
      )}

      <Modal
        title="New Group"
        isOpen={showGroupDialog}
        onClose={() => {
          setShowGroupDialog(false);
          setNewName("");
        }}
        onSubmit={handleCreateGroup}
      />

      <Modal
        title="New Module"
        isOpen={showModuleDialog}
        onClose={() => {
          setShowModuleDialog(false);
          setNewName("");
        }}
        onSubmit={handleCreateModule}
      />
    </div>
  );
};

export default ManagementMenu;
