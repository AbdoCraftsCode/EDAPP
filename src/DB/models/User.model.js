

import mongoose, { Schema, Types, model } from "mongoose";
export const gendertypes = { male: "Male", female: "Female" }
export const roletypes = { User: "User", Admin: "Admin" }
export const providerTypes = { system: "system", google: "google" }

const userSchema = new mongoose.Schema(
    {

        friends: [{ type: Types.ObjectId, ref: "User" }],
        sentRequests: [{ type: Types.ObjectId, ref: "User" }],

        friendRequests: [{ type: Types.ObjectId, ref: "User" }], // 🟡 الطلبات المعلقة
        followers: [{ type: Types.ObjectId, ref: "User" }],      // 🟢 المتابعين
        following: [{ type: Types.ObjectId, ref: "User" }],      // 🔵 من يتابعهم المستخدم

        email: { type: String, unique: true, required: true },
        password: { type: String },
        provider: { type: String, enum: Object.values(providerTypes),default:providerTypes.system },
        gender: { type: String, enum: Object.values(gendertypes), default: gendertypes.male },
        isDeleted: { type:Boolean, default:false},
        username: { type: String },
        DOB: {
            type: Date,
         
            validate: {
                validator: function (value) {
                    const today = new Date();
                    const minAgeDate = new Date();
                    minAgeDate.setFullYear(today.getFullYear() - 18); 
                    return value < today && value <= minAgeDate;
                },
                message: "Date of Birth must be in the past and age must be greater than 18 years.",
            },
        },  
           
        mobileNumber: { type: String },
        country: { type: String, default: false },
        watchingplan: { type: Boolean, default: false },
        Downloadsplan: { type: Boolean, default: false },
        isPromoter: { type: Boolean, default: false },

        role: { type: String, enum: Object.values(roletypes),  default: roletypes.User },
        isConfirmed: { type: Boolean, default: false },
        deletedAt: { type: Date },
        bannedAt: { type: Date },
        isBanned: { type: Boolean, default: false },
        // isBrimume: { type: Boolean, default: false },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changecredintialTime: { type: Date },
        isBusy: { type: Boolean, default: false },

        myWallet: { type: Number, default: 0 },
        isSearching: { type: Boolean, default: false },
        fcmToken: { type: String, default: null },
        image: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Image"
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class"
        },


        isPremium: { type: Boolean, default: false },
        premiumUntil: { type: Date, default: null },
     
        profilePic: {
            secure_url: { type: String, }, // الصورة مطلوبة
            public_id: { type: String, }   // مهم لحذف الصور من Cloudinary
        },
        userId: String,
        emailOTP: String,
        forgetpasswordOTP: String,
        attemptCount: Number,
        otpExpiresAt: Date,
        blockUntil: {
            type: Date,
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class", // ربط الطالب بالصف الدراسي
          },

     
    },
    { timestamps: true }
);




const Usermodel = mongoose.model("User", userSchema);
export default Usermodel;
export const scketConnections = new Map()
export const onlineUsers = new Map();



