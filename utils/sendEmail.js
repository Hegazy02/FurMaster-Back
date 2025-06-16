const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // ايميلك
      pass: process.env.EMAIL_PASS, // app password أو كلمة سر الإيميل
    },
  });

  await transporter.sendMail({
    from: `"FurMaster Store" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
