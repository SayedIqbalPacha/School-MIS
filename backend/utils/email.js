// NODEMAILER
const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
  //1) create a transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2) DEFINE THE EMAIL OPTIONS
  const mailOptions = {
    from: 'sayed <sayed@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) SEND THE EMAIL
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
