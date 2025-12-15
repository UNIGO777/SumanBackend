import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { env } from '../config/env.js'

const dir = path.resolve(env.uploadDir)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase()
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-')
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, base + '-' + unique + ext)
  }
})

const fileFilter = function (req, file, cb) {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Invalid file type'), false)
}

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})

