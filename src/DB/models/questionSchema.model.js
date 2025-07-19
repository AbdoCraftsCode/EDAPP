import mongoose from "mongoose";

const generalQuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    mark: { type: Number, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }
}, { timestamps: true });

export const GeneralQuestionModel = mongoose.model("GeneralQuestion", generalQuestionSchema);
