const nodemailer = require("nodemailer");
const sendEmail = async (options) => {
  // 1) Create transporter (service that will send email like: "Gmail", "MailGun", "MailTrap")
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false port will be 587, if true port will be 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2) Define email options (like from, to, subject, email content)
  const emailOptions = {
    from: "GLGL shop app <ahmed4bdelgelel@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) Send email
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
