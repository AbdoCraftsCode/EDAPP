// models/class.model.js
import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
});

export const ClassModel = mongoose.models.Class || mongoose.model("Class", classSchema);
