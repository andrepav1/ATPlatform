import { createTransport } from "nodemailer";

import { getUserByApiKey } from "./util/users";

export const sendMail = async (api_key, { bot, instrument, units }) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = createTransport({
    host: process.env.E_MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.E_MAIL_USER,
      pass: process.env.E_MAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const user = await getUserByApiKey(api_key);

    // send mail with defined transport object
    transporter.sendMail({
      from: process.env.E_MAIL_USER,
      to: user.email,
      subject: `New Signal by [${bot.name}]`,
      text: `Your bot [${bot.name}] using strategy [${
        bot.activeStrategy.name
      }] has placed a new ${units >= 0 ? "BUY" : "SELL"} order of ${Math.abs(
        units
      )} units, on instrument [${instrument}].`
    });
  } catch (error) {
    console.log("error while sending email");
  }
};
