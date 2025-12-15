import mongoose, { Schema } from 'mongoose'

const SubCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

SubCategorySchema.index({ category: 1, slug: 1 }, { unique: true })

SubCategorySchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
  }
  next()
})

export const SubCategory = mongoose.models.SubCategory || mongoose.model('SubCategory', SubCategorySchema)

