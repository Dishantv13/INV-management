import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
    openingStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    closingStock: {
      type: Number,
      default: 0,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    inventory: [
      {
        locationId: {
          type: Schema.Types.ObjectId,
          ref: "Location",
          required: true,
        },
        currentStock: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
  },
  { timestamps: true },
);

itemSchema.virtual("isLowStock").get(function () {
  return this.currentStock <= this.lowStockThreshold;
});
itemSchema.index({ sku: 1 }, { unique: true });

export const Item = mongoose.model("Item", itemSchema);
