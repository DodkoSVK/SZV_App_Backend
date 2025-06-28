const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: "smtp.m1.websupport.sk",
  port: 465,
  secure: true,  // lebo port 465 = implicit TLS
  auth: {
    user: "info@app.vzpieranie.sk",
    pass: process.env.MAIL_PASS
  }
});


  // poslanie mailu
async function sendMail() {
    try {
      let info = await transporter.sendMail({
        from: '"Test Info" <info@app.vzpieranie.sk>',
        to: "chovanec@emday.sk",
        subject: "Test z Node.js cez Postfix",
        text: "Ahoj, funguje to!",
        html: "<b>Ahoj, funguje to!</b>"
      });
  
      console.log("E-mail odoslaný: %s", info.messageId);
    } catch (err) {
      console.error("Chyba pri posielaní:", err);
    }
  }

  module.exports = {sendMail}