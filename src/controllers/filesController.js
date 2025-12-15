export const uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: 'No file provided' })
    const path = `/uploads/${req.file.filename}`
    res.status(201).json({ ok: true, path })
  } catch (err) {
    next(err)
  }
}

export const uploadMultiple = async (req, res, next) => {
  try {
    const files = req.files || []
    if (!files.length) return res.status(400).json({ ok: false, message: 'No files provided' })
    const paths = files.map((f) => `/uploads/${f.filename}`)
    res.status(201).json({ ok: true, paths })
  } catch (err) {
    next(err)
  }
}

