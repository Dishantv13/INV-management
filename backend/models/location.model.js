import mongoose, {Schema} from "mongoose";

const LoactionSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  locationNo : {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
}, { timestamps: true });


export const Location = mongoose.model("Location", LoactionSchema);