// models/answered.model.js
import mongoose from "mongoose";

// لتمنع إعادة إجابة نفس السؤال مدى الحياة
const answeredSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Roommmm", required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Bank", required: true },
    correct: { type: Boolean, required: true },
    answeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

answeredSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const AnsweredModel = mongoose.model("Answereddd", answeredSchema);
