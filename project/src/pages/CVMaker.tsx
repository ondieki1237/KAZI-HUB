import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { FaUser, FaEnvelope, FaGraduationCap, FaBriefcase, FaTools, FaDownload, FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface ChatMessage {
  type: 'bot' | 'user';
  content: string;
}

interface CVData {
  fullName: string;
  email: string;
  education: string[];
  experience: string[];
  skills: string[];
  summary: string;
}

const CVMaker: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [cvData, setCVData] = useState<CVData>({
    fullName: '',
    email: '',
    education: [],
    experience: [],
    skills: [],
    summary: '',
  });
  const cvRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const questions = [
    "Hi! I'm your CV assistant. Let's create your professional CV. What's your full name?",
    "Great! What's your email address?",
    "Tell me about your educational background. Include your degree, institution, and graduation year.",
    "What are your key professional skills? (List at least 5)",
    "Share your work experience. Include company names, positions, and durations.",
    "Finally, give me a brief professional summary about yourself.",
  ];

  const handleUserInput = () => {
    if (!userInput.trim()) return;

    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { type: 'user', content: userInput },
    ];

    // Update CV data based on current question
    const updateCVData = () => {
      switch (currentQuestion) {
        case 0:
          setCVData(prev => ({ ...prev, fullName: userInput }));
          break;
        case 1:
          setCVData(prev => ({ ...prev, email: userInput }));
          break;
        case 2:
          setCVData(prev => ({ ...prev, education: [...prev.education, userInput] }));
          break;
        case 3:
          setCVData(prev => ({ ...prev, skills: userInput.split(',').map(skill => skill.trim()) }));
          break;
        case 4:
          setCVData(prev => ({ ...prev, experience: [...prev.experience, userInput] }));
          break;
        case 5:
          setCVData(prev => ({ ...prev, summary: userInput }));
          break;
      }
    };

    updateCVData();

    // Add next question if available
    if (currentQuestion < questions.length - 1) {
      newMessages.push({ type: 'bot', content: questions[currentQuestion + 1] });
      setCurrentQuestion(prev => prev + 1);
    } else {
      newMessages.push({
        type: 'bot',
        content: "Great! I've created your CV. You can now download it using the button below.",
      });
    }

    setChatMessages(newMessages);
    setUserInput('');
  };

  const handleDownload = () => {
    if (cvRef.current) {
      html2pdf()
        .set({
          margin: 1,
          filename: `${cvData.fullName}_CV.pdf`,
        html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        })
        .from(cvRef.current)
        .save();
    }
  };

  useEffect(() => {
    // Initialize chat with first question
    if (chatMessages.length === 0) {
      setChatMessages([{ type: 'bot', content: questions[0] }]);
    }
    // Auto-scroll chat
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="cv-maker-container">
      <div className="chat-section" ref={chatRef}>
        {chatMessages.map((msg, index) => (
          <motion.div
            key={index}
            className={`chat-message ${msg.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {msg.type === 'bot' && <FaUser className="icon" />}
            <p>{msg.content}</p>
          </motion.div>
        ))}
      </div>

      <div className="input-section">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
          placeholder="Type your answer here..."
        />
        <button onClick={handleUserInput}>
          <FaPaperPlane />
        </button>
      </div>

      {currentQuestion === questions.length - 1 && (
        <>
          <div className="cv-preview" ref={cvRef}>
            <div className="cv-header">
              <h1>{cvData.fullName}</h1>
              <p><FaEnvelope /> {cvData.email}</p>
            </div>

            <div className="cv-section">
              <h2><FaUser /> Professional Summary</h2>
              <p>{cvData.summary}</p>
        </div>

            <div className="cv-section">
              <h2><FaGraduationCap /> Education</h2>
              {cvData.education.map((edu, index) => (
                <p key={index}>{edu}</p>
              ))}
            </div>

            <div className="cv-section">
              <h2><FaTools /> Skills</h2>
              <div className="skills-grid">
                {cvData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>

            <div className="cv-section">
              <h2><FaBriefcase /> Experience</h2>
              {cvData.experience.map((exp, index) => (
                <p key={index}>{exp}</p>
              ))}
        </div>
      </div>

          <button className="download-button" onClick={handleDownload}>
            <FaDownload /> Download CV
          </button>
        </>
      )}

      <style jsx>{`
        .cv-maker-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Arial', sans-serif;
        }

        .chat-section {
          height: 400px;
          overflow-y: auto;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .chat-message {
          display: flex;
          align-items: start;
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 10px;
        }

        .chat-message.bot {
          background: #e3f2fd;
          margin-right: 20%;
        }

        .chat-message.user {
          background: #f0f4c3;
          margin-left: 20%;
          flex-direction: row-reverse;
        }

        .icon {
          margin: 0 10px;
          font-size: 20px;
        }

        .input-section {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        input {
          flex: 1;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }

        button {
          padding: 12px 24px;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        button:hover {
          background: #1976d2;
        }

        .cv-preview {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .cv-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .cv-section {
          margin-bottom: 25px;
        }

        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .skill-tag {
          background: #e3f2fd;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
        }

        .download-button {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 auto;
          font-size: 18px;
          padding: 15px 30px;
          background: #4caf50;
        }

        .download-button:hover {
          background: #388e3c;
        }
      `}</style>
    </div>
  );
};

export default CVMaker;
