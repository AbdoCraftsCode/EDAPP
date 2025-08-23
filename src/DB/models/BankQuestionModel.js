import mongoose from "mongoose";

const bankQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    mark: { type: Number, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
       timeLimit: { type: Number, default: 30 },
}, { timestamps: true });

export const BankQuestionModel = mongoose.model("bank", bankQuestionSchema);
