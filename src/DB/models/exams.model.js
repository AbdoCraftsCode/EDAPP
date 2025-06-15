import mongoose, { Schema, Types } from "mongoose";

const questionSchema = new Schema({
    _id: { type: Types.ObjectId, auto: true }, // مهم جدًا علشان تقدر تبحث بالسؤال
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    mark: { type: Number, required: true }
});

const examSchema = new Schema(
    {
        lessonId: { type: Types.ObjectId, ref: "Lesson", required: true },
        questions: [questionSchema],
        createdBy: { type: Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

const ExamModel = mongoose.model("Exam", examSchema);
export default ExamModel;
