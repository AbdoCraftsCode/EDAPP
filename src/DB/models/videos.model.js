
import mongoose, { Schema, Types } from "mongoose";

const lessonResourceSchema = new Schema({
    lessonId: { type: Types.ObjectId, ref: "Lesson", required: true },
    uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
    fileName: String,
    fileType: String, 
    fileSize: Number, 
    url: String,
    description: String,
}, { timestamps: true });

export const LessonResourceModel = mongoose.model("LessonResource", lessonResourceSchema);
