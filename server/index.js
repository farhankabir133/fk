require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// Serve React static files in production
const clientBuildPath = path.join(__dirname, '../dist');
if (process.env.NODE_ENV === 'production' && require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
}

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter config
    transporter.verify(function(error, success) {
      if (error) {
        console.error('Nodemailer transporter verification failed:', error);
      } else {
        console.log('Nodemailer transporter is ready to send messages');
      }
    });

    console.log('Attempting to send email with config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
    });

    const mailOptions = {
      from: `"FK Website" <${process.env.SMTP_USER}>`, // Use your Gmail as sender
      to: process.env.CONTACT_EMAIL,
      replyTo: email, // User's email for reply
      subject: subject,
      text: message,
      html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b><br>${message}</p>`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ error: 'Failed to send message.', details: err.message });
      } else {
        console.log('Email sent:', info.response);
        return res.json({ success: true, message: 'Message sent successfully!' });
      }
    });
  } catch (error) {
    console.error('Unexpected error in /api/contact:', error);
    res.status(500).json({ error: 'Failed to send message.', details: error.message });
  }
});


// Fallback: serve index.html for any unknown route (SPA)
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production' && require('fs').existsSync(clientBuildPath)) {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
