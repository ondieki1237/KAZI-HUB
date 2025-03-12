import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import PDFDocument from '../utils/pdfGenerator.cjs';

const router = express.Router();

router.post('/generate', verifyToken, async (req, res) => {
  try {
    console.log('Received CV generation request');
    const cvData = req.body;
    
    if (!cvData || !cvData.fullName) {
      console.error('Invalid CV data received');
      return res.status(400).json({ message: 'Invalid CV data' });
    }

    console.log('Creating PDF document for:', cvData.fullName);
    
    // Create a new PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(cvData.fullName)}-CV.pdf`);
    
    // Handle PDF generation errors
    doc.on('error', (err) => {
      console.error('PDF generation error:', err);
      res.status(500).json({ message: 'Error generating PDF' });
    });

    // Pipe the PDF document to the response
    doc.pipe(res);
    
    try {
      // Add content to the PDF
      // Header
      doc
        .font('Helvetica-Bold')
        .fontSize(25)
        .text(cvData.fullName, { align: 'center' })
        .font('Helvetica')
        .fontSize(15)
        .text(cvData.profession || '', { align: 'center' })
        .moveDown();

      // Contact Information
      doc
        .fontSize(12)
        .text(`Email: ${cvData.email || ''}`)
        .text(`Phone: ${cvData.phone || ''}`)
        .text(`Address: ${cvData.address || ''}`)
        .moveDown();

      // Summary
      if (cvData.summary) {
        doc
          .font('Helvetica-Bold')
          .fontSize(16)
          .text('Professional Summary')
          .moveDown()
          .font('Helvetica')
          .fontSize(12)
          .text(cvData.summary)
          .moveDown();
      }

      // Experience
      if (cvData.experience && cvData.experience.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(16)
          .text('Work Experience')
          .moveDown();

        cvData.experience.forEach(exp => {
          doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .text(exp.position || '')
            .font('Helvetica')
            .fontSize(12)
            .text(exp.company || '')
            .text(`${exp.startDate || ''} - ${exp.endDate || 'Present'}`)
            .text(exp.description || '')
            .moveDown();
        });
      }

      // Education
      if (cvData.education && cvData.education.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(16)
          .text('Education')
          .moveDown();

        cvData.education.forEach(edu => {
          doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .text(edu.school || '')
            .font('Helvetica')
            .fontSize(12)
            .text(`${edu.degree || ''} - ${edu.graduationYear || ''}`)
            .moveDown();
        });
      }

      // Skills
      if (cvData.skills && cvData.skills.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(16)
          .text('Skills')
          .moveDown()
          .font('Helvetica')
          .fontSize(12)
          .text(cvData.skills.filter(Boolean).join(', '))
          .moveDown();
      }

      // Finalize the PDF
      doc.end();
      console.log('CV generated successfully for:', cvData.fullName);
    } catch (error) {
      console.error('Error while generating PDF content:', error);
      // If we haven't sent the response yet, send an error
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error generating CV content' });
      }
    }
  } catch (error) {
    console.error('Error in CV generation route:', error);
    // If we haven't sent the response yet, send an error
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating CV' });
    }
  }
});

export default router; 