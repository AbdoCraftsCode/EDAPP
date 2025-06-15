import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Chapter", chapterSchema);
