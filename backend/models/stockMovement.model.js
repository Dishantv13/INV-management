import mongoose, { Schema } from "mongoose";

const stockMovementSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    type: {
      enum: ["IN", "OUT"],
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reference: {
      type: String,
      required: true,
      enum: ["manual", "sale", "purchase", "adjustment"],
    },
    note: {
      type: String,
      trim: true,
      optional: true,
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

export const StockMovement = mongoose.model(
  "StockMovement",
  stockMovementSchema,
);
