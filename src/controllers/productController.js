import mongoose from 'mongoose'
import { Product } from '../models/product.model.js'
import { Category } from '../models/category.model.js'
import { SubCategory } from '../models/subcategory.model.js'
import { isDBConnected } from '../config/db.js'

const isId = (id) => mongoose.isValidObjectId(id)
const normalizePrice = (price) => {
  const n = Number(price)
  if (Number.isNaN(n) || n < 0) return null
  return { amount: n }
}

export const index = async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ ok: false, message: 'Database not connected' })
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 20)
    const q = (req.query.q || '').toString().trim().toLowerCase()
    const filter = {}
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { slug: { $regex: q, $options: 'i' } }]
    const data = await Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()
    const total = await Product.countDocuments(filter)
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
    const p = await Product.findById(id).lean()
    if (!p) return res.status(404).json({ ok: false, message: 'Product not found' })
    res.json({ ok: true, data: p })
  } catch (err) {
    next(err)
  }
}

export const create = async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ ok: false, message: 'Database not connected' })
    const { name, price, description, categoryId, subCategoryId, sku, stock, attributes } = req.body
    if (!name || price === undefined) return res.status(400).json({ ok: false, message: 'Missing name or price' })
    const norm = normalizePrice(price)
    if (!norm) return res.status(400).json({ ok: false, message: 'Invalid price' })
    let category = categoryId
    let subCategory = subCategoryId
    if (category) {
      if (!isId(category)) return res.status(400).json({ ok: false, message: 'Invalid categoryId' })
      const exists = await Category.findById(category).lean()
      if (!exists) return res.status(404).json({ ok: false, message: 'Category not found' })
    }
    if (subCategory) {
      if (!isId(subCategory)) return res.status(400).json({ ok: false, message: 'Invalid subCategoryId' })
      const sc = await SubCategory.findById(subCategory).lean()
      if (!sc) return res.status(404).json({ ok: false, message: 'SubCategory not found' })
      if (category && sc.category.toString() !== category.toString()) {
        return res.status(400).json({ ok: false, message: 'SubCategory does not belong to Category' })
      }
      if (!category) category = sc.category.toString()
    }
    const doc = await Product.create({
      name,
      price: norm,
      description: description || '',
      category: category || undefined,
      subCategory: subCategory || undefined,
      sku,
      stock: stock !== undefined ? Number(stock) : undefined,
      image: req.body.image,
      images: req.body.images,
      attributes
    })
    res.status(201).json({ ok: true, data: doc.toObject() })
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
    if (data.price !== undefined) {
      const norm = normalizePrice(data.price)
      if (!norm) return res.status(400).json({ ok: false, message: 'Invalid price' })
      data.price = norm
    }
    if (data.categoryId) {
      const cId = data.categoryId
      if (!isId(cId)) return res.status(400).json({ ok: false, message: 'Invalid categoryId' })
      const exists = await Category.findById(cId).lean()
      if (!exists) return res.status(404).json({ ok: false, message: 'Category not found' })
      data.category = cId
      delete data.categoryId
    }
    if (data.subCategoryId) {
      const scId = data.subCategoryId
      if (!isId(scId)) return res.status(400).json({ ok: false, message: 'Invalid subCategoryId' })
      const sc = await SubCategory.findById(scId).lean()
      if (!sc) return res.status(404).json({ ok: false, message: 'SubCategory not found' })
      if (data.category && sc.category.toString() !== data.category.toString()) {
        return res.status(400).json({ ok: false, message: 'SubCategory does not belong to Category' })
      }
      data.subCategory = scId
      delete data.subCategoryId
    }
    const p = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()
    if (!p) return res.status(404).json({ ok: false, message: 'Product not found' })
    res.json({ ok: true, data: p })
  } catch (err) {
    next(err)
  }
}

export const remove = async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ ok: false, message: 'Database not connected' })
    const id = req.params.id
    const ok = await Product.findByIdAndDelete(id)
    if (!ok) return res.status(404).json({ ok: false, message: 'Product not found' })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
