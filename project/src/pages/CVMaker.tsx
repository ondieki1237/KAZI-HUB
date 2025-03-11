import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CVFormData {
  fullName: string;
  profession: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  education: {
    school: string;
    degree: string;
    graduationYear: string;
  }[];
  experience: {
    company: string;
    position: string;
    startDate: Date | null;
    endDate: Date | null;
    description: string;
  }[];
  skills: string[];
}

const CVMaker: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CVFormData>({
    fullName: '',
    profession: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    education: [{ school: '', degree: '', graduationYear: '' }],
    experience: [{ company: '', position: '', startDate: null, endDate: null, description: '' }],
    skills: ['']
  });

  const handleEducationChange = (index: number, field: keyof typeof formData.education[0], value: string) => {
    const newEducation = [...formData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setFormData({ ...formData, education: newEducation });
  };

  const handleExperienceChange = (
    index: number,
    field: keyof typeof formData.experience[0],
    value: string | Date | null
  ) => {
    const newExperience = [...formData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setFormData({ ...formData, experience: newExperience });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { school: '', degree: '', graduationYear: '' }]
    });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: '', position: '', startDate: null, endDate: null, description: '' }]
    });
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData({ ...formData, skills: newSkills });
  };

  const addSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, ''] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convert dates to string format (MM/YYYY) for submission
    const formattedData = {
      ...formData,
      experience: formData.experience.map(exp => ({
        ...exp,
        startDate: exp.startDate ? exp.startDate.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) : '',
        endDate: exp.endDate ? exp.endDate.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) : ''
      }))
    };

    try {
      const response = await fetch('http://192.168.1.157:5000/api/cv-maker/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate CV');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${formData.fullName.replace(/\s+/g, '_')}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('CV generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate CV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-teal-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">CV Maker</h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-4 py-2 text-white hover:bg-teal-700 rounded-md transition-colors duration-200"
          >
            <Home className="h-5 w-5 mr-2" />
            <span className="font-medium">Home</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-lg">
          {/* Personal Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-2">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="text"
                placeholder="Profession"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              required
            />
            <textarea
              placeholder="Professional Summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              rows={4}
              required
            />
          </div>

          {/* Education */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-2">Education</h2>
            {formData.education.map((edu, index) => (
              <div key={index} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <input
                  type="text"
                  placeholder="School/Institution"
                  value={edu.school}
                  onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Degree/Certificate"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Graduation Year"
                    value={edu.graduationYear}
                    onChange={(e) => handleEducationChange(index, 'graduationYear', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addEducation}
              className="flex items-center text-teal-600 hover:text-teal-800 font-medium transition-colors"
            >
              <span className="mr-2">+</span> Add Education
            </button>
          </div>

          {/* Experience */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-2">Work Experience</h2>
            {formData.experience.map((exp, index) => (
              <div key={index} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={exp.position}
                  onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <DatePicker
                    selected={exp.startDate}
                    onChange={(date: Date) => handleExperienceChange(index, 'startDate', date)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    placeholderText="Start Date (MM/YYYY)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                  <DatePicker
                    selected={exp.endDate}
                    onChange={(date: Date) => handleExperienceChange(index, 'endDate', date)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    placeholderText="End Date (MM/YYYY)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <textarea
                  placeholder="Job Description"
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  rows={3}
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addExperience}
              className="flex items-center text-teal-600 hover:text-teal-800 font-medium transition-colors"
            >
              <span className="mr-2">+</span> Add Experience
            </button>
          </div>

          {/* Skills */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-2">Skills</h2>
            {formData.skills.map((skill, index) => (
              <input
                key={index}
                type="text"
                placeholder="Skill (e.g., Plumbing, JavaScript)"
                value={skill}
                onChange={(e) => handleSkillChange(index, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                required
              />
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="flex items-center text-teal-600 hover:text-teal-800 font-medium transition-colors"
            >
              <span className="mr-2">+</span> Add Skill
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></span>
                Generating CV...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Generate CV
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CVMaker;