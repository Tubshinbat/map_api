const nodemailer = require("nodemailer");

const sendEmail = async ({ subject, text, html, email }) => {
  try {
    const transport = nodemailer.createTransport({
      host: "bizmail16.itools.mn",
      port: 465,
      secure: true,
      auth: {
        user: "info@webr.mn",
        pass: "159753456Uk@",
      },
    });

    const info = await transport.sendMail({
      from: "info@webr.mn",
      to: email,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);

    return info;
  } catch (error) {
    console.log(error);
    return error;
  }
};

//  // async..await is not allowed in global scope, must use a wrapper
// const sendEmail = async (options) => {
//   // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     host: SMTP_HOST,
//     port: SMTP_PORT,
//     secure: true, // true for 465, false for other ports
//     auth: {
//       user: SMTP_USERNAME, // generated ethereal user
//       pass: SMTP_PASSWORD, // generated ethereal password
//     },
//   });

//   // send mail with defined transport object
//   let info = await transporter.sendMail({
//     from: `${SMTP_FROM} <${SMTP_FROM_EMAIL}>`, // sender address
//     to: options.email, // list of receivers
//     subject: options.subject, // Subject line
//     html: options.message, // html body
//   });

//   console.log("Message sent: %s", info.messageId);
//   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

//   return info;
// };

module.exports = sendEmail;
