import mongoose from "mongoose";

// const dailyExamSchema = new mongoose.Schema({
//     title: { type: String, required: true }, // مثال: امتحان يوم 2025-09-28
//     date: { type: Date,   },
//     questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "DailyQuestion" }],
//     isActive: { type: Boolean, default: true }, // الامتحان شغال ولا لأ
//     entryFee: { type: Number, default: 0 }, // لازم يدفع من المحفظة
//     prize: { type: Number, default: 0 }, // الجايزة للي يكسب
//     classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
//     // ربط بالصف
// }, { timestamps: true });
const dailyExamSchema = new mongoose.Schema({
    title: { type: String, required: true }, // مثال: امتحان يوم 2025-09-28

    date: { type: Date }, // التاريخ العام (للتصفية والكرون)

    examDay: { type: String, required: true },
    // مثال: "06/10/2025" ← بصيغة اليوم/الشهر/السنة زي ما يدخلها الأدمن

    startTime: { type: String, required: true },
    // مثال: "21:00" ← (الساعة 9 مساءً)

    endTime: { type: String, required: true },
    // مثال: "23:59"

    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "DailyQuestion" }],

    isActive: { type: Boolean, default: true }, // الامتحان شغال ولا لأ

    entryFee: { type: Number, default: 0 }, // رسوم الاشتراك

    prize: { type: Number, default: 0 }, // الجايزة للفائز

    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }, // الصف الدراسي

    subscribers: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ], 

    isSubscribed: { type: Boolean, default: false }, // هل الطالب مشترك في الامتحان أم لا

    instructions: [
        { type: String }
    ],
    rewards: [
        {
            rank: { type: Number, required: true }, // الترتيب (1، 2، 3، ...)
            amount: { type: Number, required: true } // المبلغ المالي أو الجائزة
        }
    ]
    // قائمة تعليمات منظمة

}, { timestamps: true });


const dailyQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    mark: { type: Number, default: 1 },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }, // الصف الدراسي
}, { timestamps: true });

const dailyResultSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "DailyExam", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reward: { type: Number, default: 0 },
    rewardGiven: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 }, // بالثواني
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }, // نفس الصف
}, { timestamps: true });
const dailyAnswerSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "DailyExam", required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "DailyQuestion", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isCorrect: { type: Boolean, required: true },
    mark: { type: Number, default: 0 }
}, { timestamps: true });




export const DailyResultModel = mongoose.model("DailyResult", dailyResultSchema);


export const DailyQuestionModel = mongoose.model("DailyQuestion", dailyQuestionSchema);


export const DailyExamModel = mongoose.model("DailyExam", dailyExamSchema);
export const DailyAnswerModel = mongoose.model("DailyAnswer", dailyAnswerSchema);