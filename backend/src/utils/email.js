const nodemailer = require('nodemailer');
const { getRFPNotificationTemplate, getResponseNotificationTemplate, getStatusUpdateTemplate } = require('../templates/emailTemplates');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendRFPNotification = async (suppliers, rfp) => {
  const promises = suppliers.map(async (supplier) => {
    const template = getRFPNotificationTemplate(rfp, supplier);
    return sendEmail(supplier.email, template.subject, template.html, template.text);
  });

  return Promise.all(promises);
};

const sendResponseNotification = async (buyer, rfp, response) => {
  const template = getResponseNotificationTemplate(rfp, response, buyer);
  return sendEmail(buyer.email, template.subject, template.html, template.text);
};

const sendStatusUpdateNotification = async (user, rfp, status) => {
  const template = getStatusUpdateTemplate(rfp, user, status);
  return sendEmail(user.email, template.subject, template.html, template.text);
};

module.exports = {
  sendEmail,
  sendRFPNotification,
  sendResponseNotification,
  sendStatusUpdateNotification
};
