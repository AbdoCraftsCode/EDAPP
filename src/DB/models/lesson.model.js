import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String,  },
    lessonImage: {
        secure_url: String,
        public_id: String,
    },
      
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Lesson", lessonSchema);
