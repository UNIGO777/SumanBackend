import nodemailer from 'nodemailer'
import { env } from './env.js'

let transporter

if (env.mail.host && env.mail.port && env.mail.user && env.mail.pass) {
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: { user: env.mail.user, pass: env.mail.pass }
  })
} else {
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  })
}

export const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: env.mail.from,
    to: to || env.mail.to || env.mail.from,
    subject,
    text,
    html
  }
  const info = await transporter.sendMail(mailOptions)
  return info
}

