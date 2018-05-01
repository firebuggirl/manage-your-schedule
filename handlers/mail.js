const nodemailer = require('nodemailer');//interface with SMTP or any other transports..sends email for you
const pug = require('pug');
const juice = require('juice'); //inlines CSS
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({//a way to interface with different ways of sending email, with SMPT being the most popular
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});
                    //The block of code sends an email each time the server (ie., nodemon) is started....to test if email gets sent...block this code out when no longer need to test
// transport.sendMail({//include this in start.js to see if mail gets sent...check in Mailtrap inbox
//   from: 'Juliette Tworsey <juliette.tworsey@gmail.com>',
//   to: 'randy@example.com',
//   subject: 'Just trying things out!',
//   html: 'Woo hoo cachoo!',
//   text: 'Woo hoo cachoo!' //for those who have HTML-free email
// });
const generateHTML = (filename, options = {}) => {//convert pug files to HTML and inline CSS
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);//options will contain
  const inlined = juice(html);
  return inlined;
};
//not needed anywhere outside of this file, hence no 'export'

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);

  const mailOptions = {
    from: `Juliette <juliette.tworsey@gmail.com>`,
    to: options.user.email,
    subject: options.subject,
    //filename: 'password-reset',
    html,
    text

  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};
