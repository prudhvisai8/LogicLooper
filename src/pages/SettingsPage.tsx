import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Moon,
  Bell,
  Volume2,
  Trash2
} from "lucide-react";

const API_VERSION = import.meta.env.VITE_API_VERSION || "v1.0.0";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("sound") !== "false"
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notifications") !== "false"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("sound", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("notifications", notificationsEnabled.toString());
  }, [notificationsEnabled]);

  const resetProgress = () => {
    if (confirm("Are you sure you want to reset all progress?")) {
      localStorage.removeItem("activity");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-card transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">

        <SettingsToggle
          icon={Moon}
          title="Dark Mode"
          value={darkMode}
          onChange={setDarkMode}
        />

        <SettingsToggle
          icon={Volume2}
          title="Sound Effects"
          value={soundEnabled}
          onChange={setSoundEnabled}
        />

        <SettingsToggle
          icon={Bell}
          title="Daily Notifications"
          value={notificationsEnabled}
          onChange={setNotificationsEnabled}
        />

        {/* Reset Section */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-semibold">Reset Progress</p>
              <p className="text-sm text-muted-foreground">
                This cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={resetProgress}
            className="px-4 py-2 rounded-xl bg-destructive text-white text-sm hover:opacity-90 transition"
          >
            Reset
          </button>
        </motion.div>

        {/* API Version */}
        <div className="text-center text-xs text-muted-foreground pt-6">
          API Version: {API_VERSION}
        </div>
      </main>
    </div>
  );
};

const SettingsToggle = ({
  icon: Icon,
  title,
  value,
  onChange,
}: {
  icon: any;
  title: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary" />
      <p className="font-semibold">{title}</p>
    </div>

    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
        value ? "bg-primary" : "bg-muted"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition ${
          value ? "translate-x-6" : ""
        }`}
      />
    </button>
  </motion.div>
);

export default SettingsPage;
