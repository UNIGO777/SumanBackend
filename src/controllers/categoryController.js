import mongoose from 'mongoose'
import { Category } from '../models/category.model.js'
import { isDBConnected } from '../config/db.js'

const isId = (id) => mongoose.isValidObjectId(id)
const makeSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')

export const index = async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ ok: false, message: 'Database not connected' })
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 20)
    const q = (req.query.q || '').toString().trim().toLowerCase()
    const isActive = req.query.isActive
    const filter = {}
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { slug: { $regex: q, $options: 'i' } }]
    if (isActive !== undefined) filter.isActive = isActive === 'true'
    const data = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
    const total = await Category.countDocuments(filter)
    res.json({ ok: true, data, page, limit, total })
  } catch (err) {
    next(err)
  }
}

export const show = async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ ok: false, message: 'Database not connected' })
    const id = req.params.id
    if (!isId(id)) return res.status(400).json({ ok: false, message: 'Invalid id' })
    const doc = await Category.findById(id).lean()
    if (!doc) return res.status(404).json({ ok: false, message: 'Category not found' })
    res.json({ ok: true, data: doc })
  } catch (err) {
    next(err)
  }
}

export const create = async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ ok: false, message: 'Database not connected' })
    const { name, description, isActive } = req.body
    if (!name || !name.toString().trim()) return res.status(400).json({ ok: false, message: 'Missing name' })
    const slug = makeSlug(name)
    try {
      const doc = await Category.create({ name: name.trim(), description, isActive, slug })
      res.status(201).json({ ok: true, data: doc.toObject() })
    } catch (e) {
      if (e.code === 11000) return res.status(409).json({ ok: false, message: 'Category already exists' })
      throw e
    }
  } catch (err) {
    next(err)
  }
}

export const updateOne = async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ ok: false, message: 'Database not connected' })
    const id = req.params.id
    if (!isId(id)) return res.status(400).json({ ok: false, message: 'Invalid id' })
    const data = { ...req.body }
    if (data.name && !data.slug) data.slug = makeSlug(data.name)
    try {
      const doc = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()
      if (!doc) return res.status(404).json({ ok: false, message: 'Category not found' })
      res.json({ ok: true, data: doc })
    } catch (e) {
      if (e.code === 11000) return res.status(409).json({ ok: false, message: 'Category already exists' })
      throw e
    }
  } catch (err) {
    next(err)
  }
}

export const remove = async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ ok: false, message: 'Database not connected' })
    const id = req.params.id
    if (!isId(id)) return res.status(400).json({ ok: false, message: 'Invalid id' })
    const ok = await Category.findByIdAndDelete(id)
    if (!ok) return res.status(404).json({ ok: false, message: 'Category not found' })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

