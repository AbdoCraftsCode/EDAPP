// models/weeklyScore.model.js
import mongoose from "mongoose";

const weeklyScoreSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Roommmm", required: true },
    weekKey: { type: String, required: true }, // مثال: "2025-W34"
    points: { type: Number, default: 0 },
    answeredQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bank" }], // اللي جاوبها هذا الأسبوع
}, { timestamps: true });

weeklyScoreSchema.index({ userId: 1, roomId: 1, weekKey: 1 }, { unique: true });

export const WeeklyScoreModel = mongoose.model("WeeklyScore", weeklyScoreSchema);
