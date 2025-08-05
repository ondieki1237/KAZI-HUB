import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const data = req.body;
    
    // Create a PDF document
    const doc = new PDFDocument();
    
    // Generate a unique filename
    const fileName = `${Date.now()}_${data.fullName.replace(/\s+/g, '_')}_CV.pdf`;
    const filePath = path.join(__dirname, '../public/cvs', fileName);
    
    // Pipe the PDF to a write stream
    doc.pipe(fs.createWriteStream(filePath));

    // Add content to the PDF
    doc.fontSize(25).text(data.fullName, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(data.email);
    doc.text(data.phone);
    doc.text(data.address);
    doc.moveDown();

    // Summary
    doc.fontSize(16).text('Professional Summary');
    doc.fontSize(12).text(data.summary);
    doc.moveDown();

    // Education
    doc.fontSize(16).text('Education');
    data.education.forEach(edu => {
      doc.fontSize(12).text(`${edu.degree} - ${edu.school}`);
      doc.text(`Graduated: ${edu.graduationYear}`);
      doc.moveDown(0.5);
    });
    doc.moveDown();

    // Experience
    doc.fontSize(16).text('Work Experience');
    data.experience.forEach(exp => {
      doc.fontSize(12).text(`${exp.position} at ${exp.company}`);
      doc.text(`${exp.startDate} - ${exp.endDate}`);
      doc.text(exp.description);
      doc.moveDown(0.5);
    });
    doc.moveDown();

    // Skills
    doc.fontSize(16).text('Skills');
    doc.fontSize(12).text(data.skills.join(', '));

    // Finalize the PDF
    doc.end();

    // Send the file URL back to the client
    const fileUrl = `http://192.168.1.246:5000/cvs/${fileName}`;
    
    res.json({
      success: true,
      fileUrl,
      message: 'CV generated successfully'
    });

  } catch (error) {
    console.error('Error generating CV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CV'
    });
  }
});

export default router; 