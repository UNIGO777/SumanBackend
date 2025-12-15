import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { sendMail } from '../config/mailer.js'

const store = new Map()
const ttlMs = 10 * 60 * 1000
const maxAttempts = 5

const genOtp = () => String(Math.floor(100000 + Math.random() * 900000))

export const loginInit = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ ok: false, message: 'Email and password are required' })
    if (!env.admin.email || !env.admin.password) return res.status(500).json({ ok: false, message: 'Admin credentials not configured' })
    if (email !== env.admin.email || password !== env.admin.password) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' })
    }
    const code = genOtp()
    const exp = Date.now() + ttlMs
    store.set(email, { code, exp, attempts: 0 })
    const subject = 'Admin Login OTP'
    const text = `Your OTP is ${code}. It expires in 10 minutes.`
    await sendMail({ to: email, subject, text })
    res.json({ ok: true, message: 'OTP sent' })
  } catch (err) {
    next(err)
  }
}

export const loginVerify = async (req, res, next) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ ok: false, message: 'Email and OTP are required' })
    const entry = store.get(email)
    if (!entry) return res.status(400).json({ ok: false, message: 'OTP not requested' })
    if (entry.attempts >= maxAttempts) {
      store.delete(email)
      return res.status(429).json({ ok: false, message: 'Too many attempts' })
    }
    entry.attempts++
    if (Date.now() > entry.exp) {
      store.delete(email)
      return res.status(400).json({ ok: false, message: 'OTP expired' })
    }
    if (otp !== entry.code) return res.status(400).json({ ok: false, message: 'Invalid OTP' })
    if (!env.jwtSecret) return res.status(500).json({ ok: false, message: 'JWT secret not configured' })
    store.delete(email)
    const token = jwt.sign({ sub: email, role: 'admin' }, env.jwtSecret, { expiresIn: '1d' })
    res.json({ ok: true, token })
  } catch (err) {
    next(err)
  }
}

export const me = (req, res) => {
  res.json({ ok: true, data: { email: req.admin?.email } })
}

