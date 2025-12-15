import mongoose, { Schema } from 'mongoose'

const PromoCodeSchema = new Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    description: { type: String },
    discountType: { type: String, required: true, enum: ['percent', 'fixed'] },
    amount: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    minOrderValue: { type: Number, min: 0 },
    startsAt: { type: Date },
    endsAt: { type: Date },
    usageLimit: { type: Number, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    applicableSubCategories: [{ type: Schema.Types.ObjectId, ref: 'SubCategory' }],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: true }
)

export const PromoCode = mongoose.models.PromoCode || mongoose.model('PromoCode', PromoCodeSchema)

