import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,

    // ✅ ربط الفصل بالمادة التعليمية
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });
  ;

export default mongoose.model("Chapter", chapterSchema);
