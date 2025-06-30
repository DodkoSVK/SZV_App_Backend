const { func } = require("joi");
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

const sendEmail = async(sender, recipient, suject, message) => {
  try {
    const mail = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: suject,
      html: message
    });

    console.log(`Email sended successfully with ID: ${mail.messageId}`);
  } catch (e) {
    console.error(`🟠 We got error with sending email: ${e}`);
  }

}


const resigerEmailTemplate = (login, temporaryPassword ) => {
  const html = `
  <!DOCTYPE html>
  <html lang="sk">
    <head>
      <meta charset="UTF-8" />
      <title>Vitajte!</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="background-color: #4CAF50; color: #ffffff; padding: 20px; text-align: center;">
                  <h1>👋 Vitajte v našej aplikácii SZV!</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px;">
                  <p>Dobrý deň,</p>
                  <p>Boli Vám vygenerované prihlasovacie údaje.:</p>
                  <ul>
                    <li><strong>Login:</strong> <span style="color: #4CAF50;">${login}</span></li>
                    <li><strong>Jednorazové heslo:</strong> <span style="color: #4CAF50;">${temporaryPassword}</span></li>
                  </ul>
                  <p>🔒 <strong>Upozornenie:</strong> Prihláste sa prosím a <strong>okamžite si zmeňte svoje heslo</strong> pre zachovanie bezpečnosti vášho účtu.</p>
                  <p>
                    👉 Kliknite sem pre prihlásenie:
                    <br />
                    <a href="https://app.vzpieranie.sk/login" style="display: inline-block; background-color: #4CAF50; color: #ffffff; padding: 10px 20px; border-radius: 4px; text-decoration: none;">
                      Prihlásiť sa
                    </a>
                  </p>
                  <hr />
                  <p style="font-size: 12px; color: #888888;">
                    📧 Tento e-mail bol generovaný automaticky, prosím, neodpovedajte naň.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #888888;">
                  © ${new Date().getFullYear()} Emday Photography. Všetky práva vyhradené.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
  return html;
}
  // poslanie mailu
async function sendLoveMail() {
    try {
      let info = await transporter.sendMail({
        from: '"Test Info" <info@app.vzpieranie.sk>',
        to: "",
        subject: "Dodkov Test jeho silnej aplikácie",
        html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
          <p>🌹 Ňufík,</p>
          <p>Len som Ti chcel dnes povedať, že že že si krástna. ❤️</p>
          <p>Aaaa že mi chýbaššš 🥰</p>
          <p>Nezabudni, že Ťa milujem z celého srdca. 💖</p>
          <p style="margin-top: 20px;">Tvoj 🐧TučniačikoDráčikoMimiMimoň🐉 </p>
          <p>PS Dodko programuje register a login a uz 2h rozbiehal mail server a potom zistil, ze to vie ojebat za 5sekund a tak je to ojebane a bezpecne :D hi hi</p>
        </div>
      `
      });
  
      console.log("E-mail odoslaný: %s", info.messageId);
    } catch (err) {
      console.error("Chyba pri posielaní:", err);
    }
  }

  module.exports = {sendLoveMail, sendEmail, resigerEmailTemplate}