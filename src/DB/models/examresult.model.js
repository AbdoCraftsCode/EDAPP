import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    mark: Number
}, { _id: false });

const examResultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true
    },
    totalScore: {
        type: Number,
        required: true
    },
    maxScore: {
        type: Number,
        required: true
    },
    answers: [answerSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("ExamResult", examResultSchema);
