import mongoose from "mongoose";

const commissionHistorySchema = new mongoose.Schema(
  {
    percentage: {
      type: Number,
      required: true,
      min: [0, "Commission percentage cannot be negative"],
      max: [100, "Commission percentage cannot exceed 100%"],
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const commissionSettingSchema = new mongoose.Schema(
  {
    percentage: {
      type: Number,
      required: true,
      default: 10, // 10% default platform commission
      min: [0, "Commission percentage cannot be negative"],
      max: [100, "Commission percentage cannot exceed 100%"],
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    history: [commissionHistorySchema],
  },
  { timestamps: true }
);

// Static method to retrieve the single active global commission setting or initialize it
commissionSettingSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      percentage: 10,
      isEnabled: true,
      history: [
        {
          percentage: 10,
          isEnabled: true,
          note: "Default LokArt initial commission rate",
          updatedAt: new Date(),
        },
      ],
    });
  }
  return settings;
};

const CommissionSetting = mongoose.model(
  "CommissionSetting",
  commissionSettingSchema
);

export default CommissionSetting;
