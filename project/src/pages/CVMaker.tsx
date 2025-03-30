import React, { useRef, useState } from "react";
import html2pdf from "html2pdf.js";

const CVMaker: React.FC = () => {
  const cvRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "Seth Makori Ondieki",
    email: "makoriseth1237@gmail.com",
    location: "Mombasa, Kenya",
    profile: "Passionate software engineer with experience in web development, backend systems, and user-focused applications. Adept at building solutions that solve real-world problems.",
    education: "Technical University of Mombasa – BSc Electronics & Instrumentation (2019–2024)",
    skills: "JavaScript, TypeScript, Python, React, Node.js, Express, SQL, MongoDB, Git, Docker, CI/CD",
    experience: "Kenya Airports Authority (Intern) – Networking & Electronics (2023); Cyber Attendant – Tech support & document handling (2020)",
    projects: "RideShare App – Real-time ride matching & booking; DoctorGestures – Health record & prescription management system",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownload = () => {
    if (cvRef.current) {
      html2pdf().set({
        margin: 0.5,
        filename: `${formData.name}_CV.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }).from(cvRef.current).save();
    }
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    color: '#004d4d',
    backgroundColor: 'white',
    padding: '30px',
    maxWidth: '800px',
    margin: '20px auto',
    border: '1px solid #ddd',
    borderRadius: '10px',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: '#008080',
    color: 'white',
    padding: '20px',
    borderRadius: '10px 10px 0 0',
    textAlign: 'center'
  };

  const sectionTitle: React.CSSProperties = {
    borderBottom: '2px solid #008080',
    paddingBottom: '5px',
    marginTop: '20px',
    fontSize: '18px',
    fontWeight: 'bold',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#008080',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    margin: '20px auto',
    display: 'block',
  };

  return (
    <>
      <form style={containerStyle}>
        <h2>Fill Your CV Info</h2>
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
        <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <textarea name="profile" placeholder="Profile Summary" rows={3} value={formData.profile} onChange={handleChange} />
        <textarea name="education" placeholder="Education" rows={2} value={formData.education} onChange={handleChange} />
        <textarea name="skills" placeholder="Skills (comma-separated)" rows={2} value={formData.skills} onChange={handleChange} />
        <textarea name="experience" placeholder="Experience (semicolon-separated)" rows={3} value={formData.experience} onChange={handleChange} />
        <textarea name="projects" placeholder="Projects (semicolon-separated)" rows={2} value={formData.projects} onChange={handleChange} />
      </form>

      <div ref={cvRef} style={containerStyle}>
        <div style={headerStyle}>
          <h1>{formData.name}</h1>
          <p>{formData.email} | {formData.location}</p>
        </div>

        <div>
          <h2 style={sectionTitle}>Profile Summary</h2>
          <p>{formData.profile}</p>

          <h2 style={sectionTitle}>Education</h2>
          <p>{formData.education}</p>

          <h2 style={sectionTitle}>Skills</h2>
          <ul>
            {formData.skills.split(',').map((skill, i) => (
              <li key={i}>{skill.trim()}</li>
            ))}
          </ul>

          <h2 style={sectionTitle}>Experience</h2>
          <ul>
            {formData.experience.split(';').map((exp, i) => (
              <li key={i}>{exp.trim()}</li>
            ))}
          </ul>

          <h2 style={sectionTitle}>Projects</h2>
          <ul>
            {formData.projects.split(';').map((proj, i) => (
              <li key={i}>{proj.trim()}</li>
            ))}
          </ul>
        </div>
      </div>

      <button onClick={handleDownload} style={buttonStyle}>Download CV</button>
    </>
  );
};

export default CVMaker;
