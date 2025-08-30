const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config({ path: __dirname + '/.env' });
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());


const { body, validationResult } = require('express-validator');
const xss = require('xss');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Contact endpoint
app.post(
  '/api/contact',
  [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('subject').trim().notEmpty().withMessage('Subject is required').escape(),
    body('message').trim().notEmpty().withMessage('Message is required').escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    // Sanitize input to prevent XSS
    const { name, email, subject, message } = req.body;
    const safeName = xss(name);
    const safeEmail = xss(email);
  const safeSubject = xss(subject);
  const safeMessage = xss(message);

    const mailOptions = {
      from: `"${safeName}" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL, // Your email address
      subject: `Contact Form: ${safeSubject}`,
      text: `Name: ${safeName}\nEmail: ${safeEmail}\nSubject: ${safeSubject}\nMessage:\n${safeMessage}`,
      html: `<h3>Contact Form Submission</h3>\n             <p><strong>Name:</strong> ${safeName}</p>\n             <p><strong>Email:</strong> ${safeEmail}</p>\n             <p><strong>Subject:</strong> ${safeSubject}</p>\n             <p><strong>Message:</strong><br/>${safeMessage}</p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
      console.error('Nodemailer error:', error);
      res.status(500).json({ error: 'Failed to send message.' });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
