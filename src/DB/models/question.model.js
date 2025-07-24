// src/DB/schemas/question.schema.js
import mongoose from "mongoose";

export const questionSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    mark: { type: Number, required: true }
});


export const QuestionModel = mongoose.model("Question", questionSchema);
