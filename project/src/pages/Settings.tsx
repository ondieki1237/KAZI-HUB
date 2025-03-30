import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Footer from '../components/Footer';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  // State variables for settings
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [monochromaticMode, setMonochromaticMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [lineSpacing, setLineSpacing] = useState<number>(1.5);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedMonochromaticMode = localStorage.getItem("monochromaticMode") === "true";
    const savedFontSize = parseInt(localStorage.getItem("fontSize") || "16", 10);
    const savedLineSpacing = parseFloat(localStorage.getItem("lineSpacing") || "1.5");

    setDarkMode(savedDarkMode);
    setMonochromaticMode(savedMonochromaticMode);
    setFontSize(savedFontSize);
    setLineSpacing(savedLineSpacing);
  }, []);

  // Apply settings dynamically
  useEffect(() => {
    const bodyStyle: React.CSSProperties = {
      backgroundColor: darkMode ? "#333" : "#f9f9f9",
      color: darkMode ? "#fff" : "#333",
      fontSize: `${fontSize}px`,
      lineHeight: lineSpacing.toString(),
      filter: monochromaticMode ? "grayscale(100%)" : "none",
    };

    document.body.style.cssText = Object.entries(bodyStyle)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`)
      .join(" ");
  }, [darkMode, monochromaticMode, fontSize, lineSpacing]);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem("darkMode", String(darkMode));
    localStorage.setItem("monochromaticMode", String(monochromaticMode));
    localStorage.setItem("fontSize", String(fontSize));
    localStorage.setItem("lineSpacing", String(lineSpacing));

    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Settings" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Home className="h-5 w-5" />
          </button>
        </div>

        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Appearance Settings</h2>
          
          <div className="space-y-6">
            {/* Settings controls */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  className="form-checkbox h-5 w-5 text-teal-600"
                />
                <span className="text-gray-700">Dark Mode</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={monochromaticMode}
                  onChange={() => setMonochromaticMode(!monochromaticMode)}
                  className="form-checkbox h-5 w-5 text-teal-600"
                />
                <span className="text-gray-700">Monochromatic Mode</span>
              </label>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Font Size: {fontSize}px</label>
              <input
                type="range"
                min="14"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Line Spacing: {lineSpacing}</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={lineSpacing}
                onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={saveSettings}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;