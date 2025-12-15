import { sendMail } from '../config/mailer.js'

export const sendBasic = async (req, res, next) => {
  try {
    const { to, subject, text, html } = req.body
    if (!subject || (!text && !html)) return res.status(400).json({ ok: false, message: 'Missing subject or content' })
    const info = await sendMail({ to, subject, text, html })
    res.json({ ok: true, id: info.messageId })
  } catch (err) {
    next(err)
  }
}

export const contact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) return res.status(400).json({ ok: false, message: 'Missing fields' })
    const subject = `Contact from ${name}`
    const text = `From: ${name} <${email}>\n\n${message}`
    const info = await sendMail({ subject, text })
    res.json({ ok: true, id: info.messageId })
  } catch (err) {
    next(err)
  }
}

