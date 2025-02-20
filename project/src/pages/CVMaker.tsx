import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Download, User } from 'lucide-react';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import PageHeader from '../components/PageHeader';

const CVMaker: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0);
  const [showDownload, setShowDownload] = useState(false);
  const [cvData, setCvData] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    experience: '',
    skills: '',
  });
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [userInput, setUserInput] = useState<string>('');

  const questions = [
    "What is your full name?",
    "What is your email address?",
    "What is your phone number?",
    "Tell me about your education.",
    "Describe your work experience.",
    "List your skills.",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCvData({ ...cvData, [name]: value });
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Add user message to chat history
    const updatedChatHistory = [...chatHistory, { role: 'user', content: userInput }];
    setChatHistory(updatedChatHistory);
    setUserInput('');

    // Call GPT API
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_OPENAI_API_KEY`, // Replace with your OpenAI API key
          'OpenAI-Organization': 'org-Evc00c6GhrAfL2OLm6ziJ6ed', // Add your organization ID here
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            ...updatedChatHistory,
            { role: 'system', content: 'You are a helpful assistant that helps users create a CV.' },
          ],
        }),
      });

      const data = await response.json();
      const botReply = data.choices[0].message.content;

      // Add bot reply to chat history
      setChatHistory([...updatedChatHistory, { role: 'assistant', content: botReply }]);
    } catch (error) {
      console.error('Error calling GPT API:', error);
    }
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const generatePDF = () => {
    const cvContent = document.createElement('div');
    cvContent.innerHTML = `
      <div style="padding: 40px; font-family: Arial, sans-serif;">
        <h1 style="color: #0D9488; font-size: 24px; margin-bottom: 20px;">${cvData.name}</h1>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 5px 0;">${cvData.email}</p>
          <p style="margin: 5px 0;">${cvData.phone}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #0D9488; font-size: 18px; margin-bottom: 10px;">Education</h2>
          <p style="margin: 5px 0;">${cvData.education}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #0D9488; font-size: 18px; margin-bottom: 10px;">Experience</h2>
          <p style="margin: 5px 0;">${cvData.experience}</p>
        </div>

        <div>
          <h2 style="color: #0D9488; font-size: 18px; margin-bottom: 10px;">Skills</h2>
          <p style="margin: 5px 0;">${cvData.skills}</p>
        </div>
      </div>
    `;

    const opt = {
      margin: 1,
      filename: `${cvData.name.replace(/\s+/g, '_')}_CV.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(cvContent).save();
  };

  const handleSubmit = () => {
    if (!cvData.name || !cvData.email || !cvData.phone || !cvData.education || !cvData.experience || !cvData.skills) {
      toast.error('Please fill in all fields');
      return;
    }
    setShowDownload(true);
    toast.success('CV Created Successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="CV Maker" />
      <div className="min-h-screen bg-teal-dark flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-white mb-8">CV Maker Chatbot</h1>
        
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          {!showDownload ? (
            <>
              <p className="text-xl text-teal-dark mb-6 font-medium">
                {questions[step]}
              </p>

              {step <= 2 ? (
                <input
                  type={step === 1 ? 'email' : step === 2 ? 'tel' : 'text'}
                  name={Object.keys(cvData)[step]}
                  value={Object.values(cvData)[step]}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-teal-dark rounded-lg mb-6 focus:ring-2 focus:ring-teal-medium outline-none"
                  placeholder="Your answer..."
                />
              ) : (
                <textarea
                  name={Object.keys(cvData)[step]}
                  value={Object.values(cvData)[step]}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-teal-dark rounded-lg mb-6 min-h-[120px] focus:ring-2 focus:ring-teal-medium outline-none"
                  placeholder="Your answer..."
                />
              )}

              <div className="flex justify-between">
                {step > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                {step < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-teal-dark text-white rounded-lg hover:bg-teal-medium transition-colors ml-auto"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-teal-dark text-white rounded-lg hover:bg-teal-medium transition-colors ml-auto"
                  >
                    Create CV
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-teal-dark mb-4">CV Created!</h2>
              <p className="text-gray-600 mb-6">Your CV has been created successfully. You can now download it or create a new one.</p>
              
              <div className="space-y-4">
                <button
                  onClick={generatePDF}
                  className="w-full px-6 py-3 bg-teal-dark text-white rounded-lg hover:bg-teal-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Download CV</span>
                </button>
                
                <button
                  onClick={() => {
                    setCvData({
                      name: '',
                      email: '',
                      phone: '',
                      education: '',
                      experience: '',
                      skills: '',
                    });
                    setStep(0);
                    setShowDownload(false);
                  }}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Create New CV
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVMaker;