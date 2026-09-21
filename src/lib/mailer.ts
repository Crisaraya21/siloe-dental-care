import nodemailer, { type TransportOptions } from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env["GMAIL_USER"],
    pass: process.env["GMAIL_APP_PASSWORD"],
  },
  family: 4,
} as TransportOptions);

export async function sendEmail(to: string, subject: string, html: string) {
  const from = process.env["GMAIL_USER"];

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}
