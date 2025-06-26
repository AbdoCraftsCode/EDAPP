// models/subject.model.js
import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },   // مثال: رياضيات، علوم
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",                           // الربط مع الصف الدراسي
        required: true,
    },
});

export const SubjectModel = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
