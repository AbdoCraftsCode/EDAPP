import Usermodel, { providerTypes, roletypes } from "../../../DB/models/User.model.js";
import * as dbservice from "../../../DB/dbservice.js"
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { comparehash, generatehash } from "../../../utlis/security/hash.security.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import {  decodedToken,  generatetoken,  tokenTypes } from "../../../utlis/security/Token.security.js";
import { Emailevent } from "../../../utlis/events/email.emit.js";
import { OAuth2Client } from "google-auth-library";
import axios from 'axios';
import { nanoid } from 'nanoid';
import chapterModel from "../../../DB/models/chapter.model.js";
import lessonModel from "../../../DB/models/lesson.model.js";
import { LessonResourceModel } from "../../../DB/models/videos.model.js";
import cloud from "../../../utlis/multer/cloudinary.js"
import fs from 'fs';
import ExamModel from "../../../DB/models/exams.model.js";
import examresultModel from "../../../DB/models/examresult.model.js";
import { MaterialModel } from "../../../DB/models/exampdf.model.js";
import { ClassModel } from "../../../DB/models/supject.model.js";
import { SubjectModel } from "../../../DB/models/class.model.js";
import { CartoonImageModel } from "../../../DB/models/cartoonImageSchema.model.js";
import { GeneralQuestionModel } from "../../../DB/models/questionSchema.model.js";
import mongoose from "mongoose";
import withdrawalSchemaModel from "../../../DB/models/withdrawalSchema.model.js";
import { BankQuestionModel } from "../../../DB/models/BankQuestionModel.js";
import { RoomModell } from "../../../DB/models/roomSchemaaa.js";
import { WeeklyScoreModel } from "../../../DB/models/weeklyScoreSchema.js";
import { AnsweredModel } from "../../../DB/models/answeredSchema.js";

import moment from "moment";


export const login = asyncHandelr(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email, password);

    const checkUser = await Usermodel.findOne({ email });
    if (!checkUser) {
        return next(new Error("User not found", { cause: 404 }));
    }

    if (checkUser?.provider === providerTypes.google) {
        return next(new Error("Invalid account", { cause: 404 }));
    }

    if (!checkUser.isConfirmed) {
        return next(new Error("Please confirm your email tmm ", { cause: 404 }));
    }

    if (!comparehash({ planText: password, valuehash: checkUser.password })) {
        return next(new Error("Password is incorrect", { cause: 404 }));
    }

    const access_Token = generatetoken({
        payload: { id: checkUser._id, role: checkUser.role },


    });

    const refreshToken = generatetoken({
        payload: { id: checkUser._id, role: checkUser.role, country: checkUser.country },
  
        expiresIn:"365d"
    });

    return successresponse(res, "Done", 200, { access_Token, refreshToken, checkUser });
});
// export const loginwithGmail = asyncHandelr(async (req, res, next) => {
//     const { idToken } = req.body;
//     const client = new OAuth2Client();

//     async function verify() {
//         const ticket = await client.verifyIdToken({
//             idToken,
//             audience: process.env.CIENT_ID,
//         });
//         return ticket.getPayload();
//     }

//     const payload = await verify();
//     console.log("Google Payload Data:", payload);

//     const { name, email, email_verified, picture } = payload;

//     if (!email) {
//         return next(new Error("Email is missing in Google response", { cause: 400 }));
//     }
//     if (!email_verified) {
//         return next(new Error("Email not verified", { cause: 404 }));
//     }

//     let user = await dbservice.findOne({
//         model: Usermodel,
//         filter: { email },
//     });

//     if (user?.provider === providerTypes.system) {
//         return next(new Error("Invalid account", { cause: 404 }));
//     }

//     if (!user) {
//         user = await dbservice.create({
//             model: Usermodel,
//             data: {
//                 email,
//                 username: name,
//                 profilePic: { secure_url: picture },
//                 isConfirmed: email_verified,
//                 provider: providerTypes.google,
//             },
//         });
//     }

//     const access_Token = generatetoken({
//         payload: { id: user._id },
//         signature: user?.role === roletypes.Admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
//     });

//     const refreshToken = generatetoken({
//         payload: { id: user._id },
//         signature: user?.role === roletypes.Admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
//         expiresIn: 31536000,
//     });
//     return successresponse(res, "Login successful", 200, { access_Token, refreshToken })

// });

export const refreshToken = asyncHandelr(async (req, res, next) => {

    const user = await decodedToken({ authorization: req.headers.authorization, tokenType: tokenTypes.refresh })

    const accessToken = generatetoken({
        payload: { id: user._id },
        signature: user.role === 'Admin' ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
    });

    // 7. إنشاء refresh token جديد
    const newRefreshToken = generatetoken({
        payload: { id: user._id },
        signature: user.role === 'Admin' ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: 31536000, // سنة واحدة
    });

    // 8. إرجاع الرد الناجح
    return successresponse(res, "Token refreshed successfully", 200, { accessToken, refreshToken: newRefreshToken });
});


// export const loginwithGmail = asyncHandelr(async (req, res, next) => {
//     const { accessToken } = req.body;

//     if (!accessToken) {
//         return next(new Error("Access token is required", { cause: 400 }));
//     }

//     // Step 1: Get user info from Google
//     let userInfo;
//     try {
//         const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//             },
//         });
//         userInfo = response.data;
//     } catch (error) {
//         console.error("Failed to fetch user info from Google:", error?.response?.data || error.message);
//         return next(new Error("Failed to verify access token with Google", { cause: 401 }));
//     }

//     const { email, name, picture, email_verified } = userInfo;

//     if (!email) {
//         return next(new Error("Email is missing in Google response", { cause: 400 }));
//     }
//     if (!email_verified) {
//         return next(new Error("Email not verified", { cause: 403 }));
//     }


//     let user = await dbservice.findOne({
//         model: Usermodel,
//         filter: { email },
//     });

//     if (user?.provider === providerTypes.system) {
//         return next(new Error("Invalid account. Please login using your email/password", { cause: 403 }));
//     }

    
//     if (!user) {
//         let userId;
//         let isUnique = false;
//         while (!isUnique) {
//             userId = Math.floor(1000000 + Math.random() * 9000000);
//             const existingUser = await dbservice.findOne({
//                 model: Usermodel,
//                 filter: { userId },
//             });
//             if (!existingUser) isUnique = true;
//         }

//         user = await dbservice.create({
//             model: Usermodel,
//             data: {
//                 email,
//                 username: name,
//                 profilePic: { secure_url: picture },
//                 isConfirmed: email_verified,
//                 provider: providerTypes.google,
//                 userId, // ✅ Add generated userId here
//                 gender: "Male", // لو تقدر تجيبه من جوجل أو تخليه undefined
//             },
//         });
//     }

//     // Step 4: Generate tokens
//     const access_Token = generatetoken({
//         payload: { id: user._id, country: user.country },
//     });

//     const refreshToken = generatetoken({
//         payload: { id: user._id },
//         expiresIn: "365d"
//     });

//     return successresponse(res, "Done", 200, { access_Token, refreshToken, user });
// });



export const loginwithGmail = asyncHandelr(async (req, res, next) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return next(new Error("Access token is required", { cause: 400 }));
    }

    // Step 1: Get user info from Google
    let userInfo;
    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        userInfo = response.data;
    } catch (error) {
        console.error("Failed to fetch user info from Google:", error?.response?.data || error.message);
        return next(new Error("Failed to verify access token with Google", { cause: 401 }));
    }

    const { email, name, picture, email_verified } = userInfo;

    if (!email) {
        return next(new Error("Email is missing in Google response", { cause: 400 }));
    }
    if (!email_verified) {
        return next(new Error("Email not verified", { cause: 403 }));
    }

    // 🟡 تعريف متغير لحالة المستخدم
    let isFirstTime = false;

    // Step 2: Check if user exists
    let user = await dbservice.findOne({
        model: Usermodel,
        filter: { email },
    });

    if (user?.provider === providerTypes.system) {
        return next(new Error("Invalid account. Please login using your email/password", { cause: 403 }));
    }

    // Step 3: Create user if doesn't exist
    if (!user) {
        isFirstTime = true;

        let userId;
        let isUnique = false;
        while (!isUnique) {
            userId = Math.floor(1000000 + Math.random() * 9000000);
            const existingUser = await dbservice.findOne({
                model: Usermodel,
                filter: { userId },
            });
            if (!existingUser) isUnique = true;
        }

        user = await dbservice.create({
            model: Usermodel,
            data: {
                email,
                username: name,
                profilePic: { secure_url: picture },
                isConfirmed: email_verified,
                provider: providerTypes.google,
                userId,
                gender: "Male", // أو undefined حسب المتاح
            },
        });
    }

    // Step 4: Generate tokens
    const access_Token = generatetoken({
        payload: { id: user._id, country: user.country },
    });

    const refreshToken = generatetoken({
        payload: { id: user._id },
        expiresIn: "365d"
    });

    // Step 5: Return response
    return successresponse(res, "Done", 200, {
        access_Token,
        refreshToken,
        user,
        isFirstTime, // ✅ تمت إضافتها هنا
    });
});

 





export const forgetpassword = asyncHandelr(async (req, res, next) => {
    const { email } = req.body;
    console.log(email);

    const checkUser = await Usermodel.findOne({ email });
    if (!checkUser) {
        return next(new Error("User not found", { cause: 404 }));
    }

    Emailevent.emit("forgetpassword", { email })

    return successresponse(res);
});


export const resetpassword = asyncHandelr(async (req, res, next) => {
    const { email, password, code } = req.body;
    console.log(email, password, code);

    const checkUser = await Usermodel.findOne({ email });
    if (!checkUser) {
        return next(new Error("User not found", { cause: 404 }));
    }

    if (!comparehash({ planText: code, valuehash: checkUser.forgetpasswordOTP })) {

        return next(new Error("code not match", { cause: 404 }));
    }

    const hashpassword = generatehash({ planText: password })
    await Usermodel.updateOne({ email }, {

        password: hashpassword,
        isConfirmed: true,
        changeCredentialTime: Date.now(),
        $unset: { forgetpasswordOTP: 0, otpExpiresAt: 0, attemptCount: 0 },

    })

    return successresponse(res);
});





export const createChapter = async (req, res) => {
    try {
        const { title, description, subjectId } = req.body;
        const userId = req.user._id;

        const chapter = await chapterModel.create({
            title,
            description,
            subjectId,
            createdBy: userId
        });

        res.status(201).json({ message: "✅ تم إنشاء الفصل بنجاح", chapter });
    } catch (error) {
        res.status(500).json({ message: "❌ خطأ أثناء إنشاء الفصل", error: error.message });
    }
};


export const getChaptersBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;

        if (!subjectId) {
            return res.status(400).json({ message: "❌ يجب إرسال معرف المادة." });
        }

        const chapters = await chapterModel.find({ subjectId })
            .populate("subjectId", "name")
            .populate("createdBy", "username");

        res.status(200).json({
            message: "✅ تم جلب الفصول بنجاح",
            chapters
        });

    } catch (err) {
        console.error("❌ Error fetching chapters by subject:", err);
        res.status(500).json({ message: "❌ حدث خطأ أثناء جلب الفصول", error: err.message });
    }
  };
  

export const createLesson = async (req, res) => {
    try {
        const { title, description, chapterId, content } = req.body;
        const userId = req.user._id;

        const lesson = await lessonModel.create({
            title,
            content,
            description,
            chapterId,
            createdBy: userId
        });

        res.status(201).json({ message: "✅ تم إنشاء الدرس بنجاح", lesson });
    } catch (error) {
        res.status(500).json({ message: "❌ خطأ أثناء إنشاء الدرس", error: error.message });
    }
}
  



export const updateLessonImage = asyncHandelr(async (req, res) => {
    const { lessonId } = req.body;

    // رفع الصورة الجديدة على Cloudinary
    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
        folder: `lessons/${lessonId}`,
    });

    // جلب بيانات الدرس الحالي
    const lesson = await dbservice.findOne({
        model: lessonModel,
        filter: { _id: lessonId },
    });

    // حذف الصورة القديمة إن وجدت
    if (lesson?.lessonImage?.public_id) {
        try {
            await cloud.uploader.destroy(lesson.lessonImage.public_id);
        } catch (err) {
            console.error("❌ خطأ في حذف الصورة القديمة:", err.message);
        }
    }

    // تحديث الدرس بالصورة الجديدة
    const updatedLesson = await dbservice.findOneAndUpdate({
        model: lessonModel,
        filter: { _id: lessonId },
        data: {
            lessonImage: { secure_url, public_id }
        },
        options: { new: true },
    });

    fs.unlinkSync(req.file.path); // حذف الصورة من السيرفر

    return successresponse(res, "✅ تم تحديث صورة الدرس بنجاح", 200, {
        lesson: updatedLesson,
    });
});






export const uploadLessonResource = async (req, res) => {
    try {
        const { lessonId, description = "" } = req.body;
        const file = req.file;
        const userId = req.user._id;

        if (!file) {
            return res.status(400).json({ message: "❌ يرجى رفع ملف." });
        }

        // تحديد نوع المورد المناسب
        let resourceType = "raw";
        if (file.mimetype.startsWith("video/")) resourceType = "video";
        else if (file.mimetype === "application/pdf") resourceType = "raw";
        else {
            return res.status(400).json({ message: "❌ مسموح فقط بالفيديوهات أو PDF." });
        }

        // رفع على Cloudinary
        const result = await cloud.uploader.upload(file.path, {
            resource_type: resourceType,
            folder: "edapp/lessons",
            use_filename: true,
            unique_filename: false,
        });

        const fileSizeMB = Math.ceil(file.size / (1024 * 1024));

        const resource = await LessonResourceModel.create({
            lessonId,
            uploadedBy: userId,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: fileSizeMB,
            url: result.secure_url,
            description,
        });

        fs.unlinkSync(file.path); // حذف الملف من السيرفر

        res.status(201).json({
            message: "✅ تم رفع الملف بنجاح",
            resource,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "❌ خطأ أثناء رفع الملف",
            error: err.message,
        });
    }
};

// GET /chapters
export const getAllChapters = async (req, res) => {
    try {
        const chapters = await chapterModel.find().sort({ createdAt: -1 });
        res.status(200).json({ message: "✅ قائمة الفصول", chapters });
    } catch (error) {
        res.status(500).json({ message: "❌ خطأ أثناء جلب الفصول", error: error.message });
    }
};
  
// GET /chapters/:chapterId/lessons
export const getLessonsByChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;

        // جلب الدروس المرتبطة بالفصل
        const lessons = await lessonModel.find({ chapterId });

        // تجهيز البيانات بدون ملفات
        const result = lessons.map((lesson) => ({
            _id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,       // ✅ محتوى الدرس لو موجود
            chapterId: lesson.chapterId,
            createdBy: lesson.createdBy,
            createdAt: lesson.createdAt,   // ✅ تاريخ الإنشاء
            updatedAt: lesson.updatedAt,
        }));

        res.status(200).json({
            message: "✅ تم جلب الدروس بدون ملفات",
            lessons: result
        });
    } catch (error) {
        res.status(500).json({ message: "❌ خطأ أثناء جلب الدروس", error: error.message });
    }
};


// GET /lessons
export const getAllLessons = async (req, res) => {
    try {
        const lessons = await lessonModel.find().sort({ createdAt: -1 });

        const fullLessons = await Promise.all(
            lessons.map(async (lesson) => {
                const resources = await LessonResourceModel.find({ lessonId: lesson._id });

                return {
                    _id: lesson._id,
                    title: lesson.title,
                    content: lesson.content,
                    description: lesson.description,
                    chapterId: lesson.chapterId,
                    createdBy: lesson.createdBy,
                    lessonImage: lesson.lessonImage || null, // ✅ الصورة
                    files: resources.map((file) => ({
                        type: file.fileType.startsWith("video") ? "video" : "pdf",
                        url: file.url,
                        description: file.description,
                        fileName: file.fileName,
                        fileSize: file.fileSize,
                    })),
                };
            })
        );

        res.status(200).json({ message: "✅ تم جلب كل الدروس", lessons: fullLessons });
    } catch (error) {
        res.status(500).json({
            message: "❌ خطأ أثناء جلب الدروس",
            error: error.message,
        });
    }
};


export const createExam = async (req, res) => {
    try {
        const { lessonId, questions } = req.body;
        const userId = req.user._id;

        const exam = await ExamModel.create({
            lessonId,
            questions,
            createdBy: userId,
        });

        res.status(201).json({ message: "✅ تم إنشاء الامتحان بنجاح", exam });
    } catch (err) {
        res.status(500).json({ message: "❌ فشل في إنشاء الامتحان", error: err.message });
    }
};
  
export const getExamQuestions = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const studentId = req.user._id;

        const exam = await ExamModel.findOne({ lessonId });
        if (!exam) {
            return res.status(404).json({ message: "❌ لا يوجد امتحان لهذا الدرس" });
        }

        // ✅ نجيب نتيجة الطالب لو موجودة
        const existingResult = await examresultModel.findOne({ lessonId, studentId });

        let answeredQuestionIds = [];

        if (existingResult) {
            answeredQuestionIds = existingResult.answers.map(a => a.questionId.toString());
        }

        // ✅ نحذف الأسئلة اللي الطالب جاوبها قبل كده
        const questions = exam.questions
            .filter(q => !answeredQuestionIds.includes(q._id.toString()))
            .map(q => ({
                _id: q._id,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                mark: q.mark
            }));

        res.status(200).json({
            message: "✅ تم جلب الأسئلة المتبقية فقط",
            questions
        });
    } catch (err) {
        res.status(500).json({ message: "❌ فشل في جلب الأسئلة", error: err.message });
    }
};

  

export const submitExam = async (req, res) => {
    try {
        const { lessonId, answers } = req.body;
        const studentId = req.user._id;

        const exam = await ExamModel.findOne({ lessonId });
        if (!exam) {
            return res.status(404).json({ message: "❌ لم يتم العثور على الامتحان لهذا الدرس" });
        }

        let totalScore = 0;
        let maxScore = 0;
        const result = [];

        for (const answer of answers) {
            const question = exam.questions.find(q => q._id.toString() === answer.questionId);
            if (!question) continue;

            const isCorrect = answer.selectedAnswer === question.correctAnswer;
            if (isCorrect) totalScore += question.mark;
            maxScore += question.mark;

            result.push({
                questionId: question._id,
                selectedAnswer: answer.selectedAnswer || null,
                correctAnswer: question.correctAnswer,
                isCorrect,
                mark: question.mark
            });
        }

        const savedResult = await examresultModel.create({
            studentId,
            lessonId,
            totalScore,
            maxScore,
            answers: result
        });

        res.status(201).json({
            message: "✅ تم تصحيح وحفظ الامتحان",
            totalScore,
            maxScore,
            result,
            savedResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "❌ حدث خطأ أثناء حفظ نتيجة الامتحان",
            error: err.message
        });
    }
};


export const getMyExamResults = async (req, res) => {
    try {
        const studentId = req.user._id;

        const results = await examresultModel.find({ studentId })
            .populate({
                path: "lessonId",
                select: "title"
            })
            .sort({ createdAt: -1 });

        const formattedResults = results.map(result => ({
            lessonTitle: result.lessonId?.title || "غير معروف",
            lessonId: result.lessonId?._id || null,
            totalScore: result.totalScore,
            maxScore: result.maxScore,
            questionsCount: result.answers.length,
            percentage: `${Math.round((result.totalScore / result.maxScore) * 100)}%`,
            createdAt: result.createdAt,
            answers: result.answers.map(answer => ({
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                // question: answer.question,
                correctAnswer: answer.correctAnswer,
                isCorrect: answer.isCorrect,
                mark: answer.mark
            }))
        }));

        res.status(200).json({
            message: "✅ تم جلب نتائج الطالب مع الإجابات",
            count: formattedResults.length,
            results: formattedResults
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "❌ حدث خطأ أثناء جلب النتائج",
            error: err.message
        });
    }
};

  
export const getResultByLesson = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { lessonId } = req.params;

        const result = await examresultModel.findOne({ studentId, lessonId })
            .populate({
                path: "lessonId",
                select: "title"
            });

        if (!result) {
            return res.status(404).json({ message: "❌ لا يوجد نتيجة لهذا الدرس" });
        }

        res.status(200).json({
            message: "✅ تم جلب نتيجة الدرس",
            lessonTitle: result.lessonId?.title || "غير معروف",
            totalScore: result.totalScore,
            maxScore: result.maxScore,
            percentage: `${Math.round((result.totalScore / result.maxScore) * 100)}%`,
            questionsCount: result.answers.length,
            answers: result.answers,
            createdAt: result.createdAt
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ خطأ أثناء جلب النتيجة", error: err.message });
    }
};
  
export const getTopStudentsOverall = async (req, res) => {
    try {
        const results = await examresultModel.aggregate([
            {
                $group: {
                    _id: "$studentId",
                    totalScore: { $sum: "$totalScore" },
                    maxScore: { $sum: "$maxScore" },
                    examsCount: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    percentage: {
                        $cond: [
                            { $eq: ["$maxScore", 0] },
                            0,
                            { $multiply: [{ $divide: ["$totalScore", "$maxScore"] }, 100] }
                        ]
                    }
                }
            },
            { $sort: { totalScore: -1 } },
            { $limit: 10 }
        ]);

        // جلب أسماء الطلاب
        const populated = await Promise.all(
            results.map(async (r) => {
                const user = await Usermodel.findById(r._id).select("username email");
                return {
                    studentName: user?.username || "مجهول",
                    studentEmail: user?.email || "",
                    totalScore: r.totalScore,
                    maxScore: r.maxScore,
                    percentage: `${Math.round(r.percentage)}%`,
                    examsCount: r.examsCount
                };
            })
        );

        res.status(200).json({
            message: "✅ تم جلب أوائل الطلاب بشكل عام",
            topStudents: populated
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ خطأ أثناء جلب الأوائل", error: err.message });
    }
  };


// export const getMyExamStats = async (req, res) => {
//     try {
//         const studentId = req.user._id;

//         const result = await examresultModel.aggregate([
//             {
//                 $match: { studentId: studentId }
//             },
//             {
//                 $group: {
//                     _id: "$studentId",
//                     totalScore: { $sum: "$totalScore" },
//                     maxScore: { $sum: "$maxScore" },
//                     examsCount: { $sum: 1 }
//                 }
//             },
//             {
//                 $addFields: {
//                     percentage: {
//                         $cond: [
//                             { $eq: ["$maxScore", 0] },
//                             0,
//                             { $multiply: [{ $divide: ["$totalScore", "$maxScore"] }, 100] }
//                         ]
//                     }
//                 }
//             }
//         ]);

//         if (result.length === 0) {
//             return res.status(404).json({
//                 message: "❌ لا توجد نتائج لهذا الطالب حتى الآن"
//             });
//         }

//         const user = await Usermodel.findById(studentId).select("username email classId profilePic userId gender");

//         const stats = {
//             studentName: user?.username || "مجهول",
//             studentEmail: user?.email || "",
//             profilePic: user?.profilePic || "",
//             classId: user?.classId || "",
//             userId: user?.userId || "",
//             gender: user?.gender || "",
//             totalScore: result[0].totalScore,
//             maxScore: result[0].maxScore,
//             percentage: `${Math.round(result[0].percentage)}%`,
//             examsCount: result[0].examsCount
//         };

//         res.status(200).json({
//             message: "✅ تم جلب بيانات الطالب",
//             studentStats: stats
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "❌ خطأ أثناء جلب البيانات", error: err.message });
//     }
// };


// export const getMyExamStats = async (req, res) => {
//     try {
//         const studentId = req.user._id;

//         const result = await examresultModel.aggregate([
//             { $match: { studentId: studentId } },
//             {
//                 $group: {
//                     _id: "$studentId",
//                     totalScore: { $sum: "$totalScore" },
//                     maxScore: { $sum: "$maxScore" },
//                     examsCount: { $sum: 1 }
//                 }
//             },
//             {
//                 $addFields: {
//                     percentage: {
//                         $cond: [
//                             { $eq: ["$maxScore", 0] },
//                             0,
//                             { $multiply: [{ $divide: ["$totalScore", "$maxScore"] }, 100] }
//                         ]
//                     }
//                 }
//             }
//         ]);

//         const user = await Usermodel.findById(studentId).select("username email classId profilePic userId gender _id");

//         if (!user) {
//             return res.status(404).json({ message: "❌ لم يتم العثور على الطالب" });
//         }

//         const stats = {
//             studentName: user.username || "مجهول",
//             studentEmail: user.email || "",
//             profilePic: user.profilePic || "",
//             classId: user.classId || "",
//             _id: user._id || "",
//             userId: user.userId || "",
//             gender: user.gender || "",
//             totalScore: result[0]?.totalScore || 0,
//             maxScore: result[0]?.maxScore || 0,
//             percentage: `${Math.round(result[0]?.percentage || 0)}%`,
//             examsCount: result[0]?.examsCount || 0
//         };

//         res.status(200).json({
//             message: "✅ تم جلب بيانات الطالب",
//             studentStats: stats
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "❌ خطأ أثناء جلب البيانات", error: err.message });
//     }
// };


export const getMyExamStats = async (req, res) => {
    try {
        const studentId = req.user._id;

        // ✅ حساب نتائج الامتحانات
        const result = await examresultModel.aggregate([
            { $match: { studentId: studentId } },
            {
                $group: {
                    _id: "$studentId",
                    totalScore: { $sum: "$totalScore" },
                    maxScore: { $sum: "$maxScore" },
                    examsCount: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    percentage: {
                        $cond: [
                            { $eq: ["$maxScore", 0] },
                            0,
                            { $multiply: [{ $divide: ["$totalScore", "$maxScore"] }, 100] }
                        ]
                    }
                }
            }
        ]);

        // ✅ جلب بيانات المستخدم (مع البريميوم)
        const user = await Usermodel.findById(studentId)
            .select("username email classId profilePic userId gender isPremium premiumUntil");

        if (!user) {
            return res.status(404).json({ message: "❌ لم يتم العثور على الطالب" });
        }

        // ✅ تنسيق بيانات الامتحان
        const stats = {
            studentName: user.username || "مجهول",
            studentEmail: user.email || "",
            profilePic: user.profilePic || "",
            classId: user.classId || "",
            _id: user._id || "",
            userId: user.userId || "",
            gender: user.gender || "",
            totalScore: result[0]?.totalScore || 0,
            maxScore: result[0]?.maxScore || 0,
            percentage: `${Math.round(result[0]?.percentage || 0)}%`,
            examsCount: result[0]?.examsCount || 0
        };

        // ✅ تنسيق بيانات البريميوم
        const premium = {
            userId: user._id,
            isPremium: user.isPremium || false,
            premiumUntil: user.premiumUntil || null
        };

        // ✅ رجع الاتنين مع بعض
        res.status(200).json({
            message: "✅ تم جلب بيانات الطالب",
            studentStats: stats,
            premiumStatus: premium
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ خطأ أثناء جلب البيانات", error: err.message });
    }
};


export const uploadChatAttachment = asyncHandelr(async (req, res) => {
    const file = req.file;
    const userId = req.user._id;

    if (!file) {
        return res.status(400).json({ message: "❌ يجب رفع ملف." });
    }

    let resourceType = "raw";
    let folder = "edapp/chat/files";

    if (file.mimetype.startsWith("image/")) {
        resourceType = "image";
        folder = "edapp/chat/images";
    } else if (file.mimetype.startsWith("audio/") || file.mimetype.startsWith("video/")) {
        resourceType = "video"; // audio/video يُرفع كـ video في Cloudinary
        folder = "edapp/chat/voices";
    }

    const result = await cloud.uploader.upload(file.path, {
        resource_type: resourceType,
        folder,
        use_filename: true,
        unique_filename: false
    });

    fs.unlinkSync(file.path); // حذف الملف المؤقت من السيرفر

    const fileSizeMB = Math.ceil(file.size / (1024 * 1024)); // الحجم بالميجا

    res.status(201).json({
        message: "✅ تم رفع الملف بنجاح",
        url: result.secure_url,
        type: file.mimetype,
        fileName: file.originalname,
        fileSize: fileSizeMB,
        public_id: result.public_id
    });
});


export const uploadMaterial = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user._id;

        if (!title) {
            return res.status(400).json({ message: "❌ يجب إدخال اسم المادة" });
        }

        let imageUrl = null;
        let pdfUrl = null;

        // ⬆️ رفع الصورة
        if (req.imageFile) {
            const imageResult = await cloud.uploader.upload(req.imageFile.path, {
                resource_type: "image",
                folder: "edapp/materials/images",
                use_filename: true,
                unique_filename: false,
            });
            imageUrl = imageResult.secure_url;
            fs.unlinkSync(req.imageFile.path);
        }

        // ⬆️ رفع الـ PDF
        if (req.pdfFile) {
            const pdfResult = await cloud.uploader.upload(req.pdfFile.path, {
                resource_type: "raw",
                folder: "edapp/materials/pdfs",
                use_filename: true,
                unique_filename: false,
            });
            pdfUrl = pdfResult.secure_url;
            fs.unlinkSync(req.pdfFile.path);
        }

        const savedMaterial = await MaterialModel.create({
            title,
            imageUrl,
            pdfUrl,
            uploadedBy: userId,
        });

        res.status(201).json({
            message: "✅ تم رفع المادة بنجاح",
            material: savedMaterial,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "❌ حدث خطأ أثناء رفع المادة",
            error: err.message,
        });
    }
};
  
export const getAllMaterials = async (req, res) => {
    try {
        const materials = await MaterialModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: "✅ تم جلب المواد بنجاح",
            count: materials.length,
            materials,
        });
    } catch (err) {
        console.error("❌ Error fetching materials:", err);
        res.status(500).json({
            message: "❌ حدث خطأ أثناء جلب المواد",
            error: err.message,
        });
    }
};
  


export const createClass = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "❌ يجب إدخال اسم الصف الدراسي" });
        }

        const existing = await ClassModel.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: "❌ الصف الدراسي موجود بالفعل" });
        }

        const newClass = await ClassModel.create({ name });
        res.status(201).json({ message: "✅ تم إنشاء الصف الدراسي", class: newClass });

    } catch (error) {
        console.error("Error creating class:", error);
        res.status(500).json({ message: "❌ حدث خطأ أثناء إنشاء الصف", error: error.message });
    }
};
  
export const getAllClasses = async (req, res) => {
    try {
        const classes = await ClassModel.find().sort({ name: 1 });
        res.status(200).json({ message: "✅ تم جلب الصفوف الدراسية", classes });
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ message: "❌ حدث خطأ أثناء جلب الصفوف", error: error.message });
    }
};
  
export const createSubject = async (req, res) => {
    try {
        const { name, classId } = req.body;

        if (!name || !classId) {
            return res.status(400).json({ message: "❌ يجب إدخال اسم المادة ومعرف الصف الدراسي" });
        }

        const existing = await SubjectModel.findOne({ name, classId });
        if (existing) {
            return res.status(400).json({ message: "❌ هذه المادة موجودة بالفعل في هذا الصف" });
        }

        const newSubject = await SubjectModel.create({ name, classId });
        res.status(201).json({ message: "✅ تم إنشاء المادة الدراسية", subject: newSubject });

    } catch (err) {
        console.error("Error creating subject:", err);
        res.status(500).json({ message: "❌ حدث خطأ أثناء إنشاء المادة", error: err.message });
    }
};


export const getAllSubjects = async (req, res) => {
    try {
        const { classId } = req.body; 

        const filter = classId ? { classId } : {};
        const subjects = await SubjectModel.find(filter).populate("classId", "name");

        res.status(200).json({ message: "✅ تم جلب المواد الدراسية", subjects });
    } catch (err) {
        console.error("Error fetching subjects:", err);
        res.status(500).json({ message: "❌ حدث خطأ أثناء جلب المواد", error: err.message });
    }
};
  

// export const updateUserSelf = async (req, res) => {
//     try {
//         const { classId, gender } = req.body;
//         const userId = req.user._id; // ✅ جلب ID من التوكن

//         if (!classId && !gender) {
//             return res.status(400).json({ message: "❌ يجب إرسال الدور أو الصف لتعديله" });
//         }

//         const user = await Usermodel.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "❌ المستخدم غير موجود" });
//         }

//         if (classId) user.classId = classId;
//         if (gender) user.gender = gender;

//         await user.save();

//         res.status(200).json({
//             message: "✅ تم تعديل بيانات المستخدم بنجاح",
//             user
//         });
//     } catch (err) {
//         res.status(500).json({
//             message: "❌ فشل تعديل البيانات",
//             error: err.message
//         });
//     }
//   };
export const updateUserSelf = async (req, res) => {
    try {
        const { classId, gender, imageId } = req.body; // 🆕 إضافة imageId
        const userId = req.user._id;

        if (!classId && !gender && !imageId) {
            return res.status(400).json({ message: "❌ يجب إرسال الصف أو النوع أو الصورة لتعديلها" });
        }

        const user = await Usermodel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "❌ المستخدم غير موجود" });
        }

        if (classId) user.classId = classId;
        if (gender) user.gender = gender;

        // 🆕 تحديث صورة المستخدم إذا تم إرسال imageId
        if (imageId) {
            const cartoonImage = await CartoonImageModel.findById(imageId);
            if (!cartoonImage) {
                return res.status(404).json({ message: "❌ لم يتم العثور على الصورة المختارة" });
            }
            user.profilePic = {
                secure_url: cartoonImage.image.secure_url,
                public_id: cartoonImage.image.public_id,
            };
        }

        await user.save();

        res.status(200).json({
            message: "✅ تم تعديل بيانات المستخدم بنجاح",
            user
        });
    } catch (err) {
        res.status(500).json({
            message: "❌ فشل تعديل البيانات",
            error: err.message
        });
    }
};


// controllers/generalQuestion.controller.js



export const bulkCreateGeneralQuestions = async (req, res) => {
    try {
        const questions = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "❌ يجب إرسال مصفوفة من الأسئلة" });
        }

        const created = await GeneralQuestionModel.insertMany(questions);

        res.status(201).json({
            message: "✅ تم إضافة الأسئلة بنجاح",
            insertedCount: created.length,
            insertedQuestions: created,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ خطأ أثناء إضافة الأسئلة", error: err.message });
    }
};


export const bankCreateGeneralQuestions = async (req, res) => {
    try {
        const questions = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "❌ يجب إرسال مصفوفة من الأسئلة" });
        }

        const created = await BankQuestionModel.insertMany(questions);

        res.status(201).json({
            message: "✅ تم إضافة الأسئلة بنجاح",
            insertedCount: created.length,
            insertedQuestions: created,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ خطأ أثناء إضافة الأسئلة", error: err.message });
    }
};

export const getBankQuestionsByClass = async (req, res) => {
    try {
        const { classId } = req.user;
        if (!classId) {
            return res.status(400).json({ message: "❌ لم يتم العثور على الصف الدراسي في التوكن" });
        }

        // 🟢 Pagination params
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const skip = (page - 1) * limit;

        // 🟢 Get total questions count
        const total = await BankQuestionModel.countDocuments({ classId });

        // 🟢 Get questions with pagination
        const questions = await BankQuestionModel.find({ classId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            message: "✅ تم جلب الأسئلة الخاصة بالصف الدراسي",
            classId,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            questions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ خطأ أثناء جلب الأسئلة", error: err.message });
    }
};


export const getRandomQuestionsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const limit = parseInt(req.query.limit) || 10; // عدد الأسئلة العشوائية

        if (!classId) {
            return res.status(400).json({ message: "❌ classId مفقود في الرابط" });
        }

        const questions = await GeneralQuestionModel.aggregate([
            { $match: { classId: { $eq: new mongoose.Types.ObjectId(classId) } } },
            { $sample: { size: limit } } // جلب عدد عشوائي
        ]);

        res.status(200).json({
            message: "✅ تم جلب الأسئلة العشوائية بنجاح",
            questions
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ خطأ أثناء جلب الأسئلة", error: err.message });
    }
};

export const submitMatchingExam = async (req, res) => {
    try {
        const { classId, answers } = req.body;
        const studentId = req.user._id;

        if (!classId || !Array.isArray(answers)) {
            return res.status(400).json({
                message: "❌ يجب إرسال classId و answers"
            });
        }

        // جلب الأسئلة الخاصة بالصف الدراسي
        const questions = await GeneralQuestionModel.find({ classId });

        if (!questions.length) {
            return res.status(404).json({
                message: "❌ لم يتم العثور على أسئلة لهذا الصف"
            });
        }

        let totalScore = 0;
        let maxScore = 0;
        const result = [];

        for (const answer of answers) {
            const question = questions.find(q => q._id.toString() === answer.questionId);
            if (!question) continue;

            const isCorrect = answer.selectedAnswer === question.correctAnswer;
            if (isCorrect) totalScore += question.mark;
            maxScore += question.mark;

            result.push({
                questionId: question._id,
                selectedAnswer: answer.selectedAnswer || null,
                correctAnswer: question.correctAnswer,
                isCorrect,
                mark: question.mark
            });
        }

        const savedResult = await examresultModel.create({
            studentId,
            classId,
            totalScore,
            maxScore,
            answers: result
        });

        res.status(201).json({
            message: "✅ تم تصحيح وحفظ نتيجة الامتحان المشترك",
            totalScore,
            maxScore,
            result,
            savedResult
        });

    } catch (err) {
        console.error("❌ خطأ أثناء تصحيح الامتحان:", err);
        res.status(500).json({
            message: "❌ حدث خطأ أثناء حفظ نتيجة الامتحان المشترك",
            error: err.message
        });
    }
};



export const setUserPremium = asyncHandelr(async (req, res, next) => {
    const { _id } = req.params;
    const { days } = req.body; // 👈 عدد الأيام

    // ✅ تأكد أن اللي بيعمل الطلب هو Owner (Admin)
    if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "⛔ مسموح فقط للـ Admin" });
    }

    // ✅ تأكد إن _id صحيح
    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "❌ Invalid user ID format" });
    }

    // ✅ جلب المستخدم
    const user = await Usermodel.findById(_id);
    if (!user) {
        return res.status(404).json({ message: "❌ User not found" });
    }

    // ✅ حساب تاريخ انتهاء البريميوم
    const premiumUntil = new Date();
    premiumUntil.setDate(premiumUntil.getDate() + Number(days));

    user.isPremium = true;
    user.premiumUntil = premiumUntil;

    await user.save();

    return res.status(200).json({
        message: "✅ Premium status updated successfully",
        data: {
            userId: user._id,
            isPremium: user.isPremium,
            premiumUntil: user.premiumUntil,
        },
    });
});



export const getAllPremiumUsers = asyncHandelr(async (req, res, next) => {
    // ✅ تأكد أن اللي بيطلب لازم يكون Admin
    if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "⛔ مسموح فقط للـ Admin" });
    }

    // ✅ هات المستخدمين اللي عندهم isPremium = true
    const users = await Usermodel.find({ isPremium: true })
        .select("username isPremium premiumUntil");

    if (!users.length) {
        return res.status(200).json({ message: "⚠️ لا يوجد مستخدمين مشتركين حالياً" });
    }

    // ✅ تنسيق التاريخ بالعربي
    const formattedUsers = users.map(u => ({
        userId: u._id,
        username: u.username,
        حالة_الاشتراك: u.isPremium ? "بريميوم ✅" : "عادي ❌",
        تاريخ_انتهاء_الاشتراك: u.premiumUntil
            ? new Date(u.premiumUntil).toLocaleString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
            : "غير محدد"
    }));

    return res.status(200).json({
        message: "✅ قائمة المشتركين البريميوم",
        count: formattedUsers.length,
        data: formattedUsers,
    });
});
export const getMyPremiumStatus = asyncHandelr(async (req, res, next) => {
    // ✅ جلب بيانات المستخدم من التوكن
    const user = await Usermodel.findById(req.user._id)
        .select("username isPremium premiumUntil");

    if (!user) {
        return res.status(404).json({ message: "❌ المستخدم غير موجود" });
    }

    return res.status(200).json({
        message: "✅ حالة الاشتراك الخاصة بك",
        data: {
            userId: user._id,
            username: user.username,
            حالة_الاشتراك: user.isPremium ? "بريميوم ✅" : "عادي ❌",
            تاريخ_انتهاء_الاشتراك: user.premiumUntil
                ? new Date(user.premiumUntil).toLocaleString("ar-EG", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })
                : "غير محدد"
        }
    });
});


export const createWithdrawal = async (req, res) => {
    try {
        const { amount, serviceType ,phone} = req.body;

        if (!amount || !serviceType) {
            return res.status(400).json({ message: "❌ amount & serviceType required" });
        }

        if (req.user.balance < amount) {
            return res.status(400).json({ message: "❌ Insufficient balance" });
        }

        // خصم الرصيد
        req.user.balance -= amount;
        await req.user.save();

        // حفظ الطلب
        const withdrawal = await withdrawalSchemaModel.create({
            userId: req.user._id,
            amount,
            phone,
            serviceType,
        });

        res.json({
            message: "✅ Withdrawal request created successfully",
            data: withdrawal,
        });
    } catch (error) {
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
};



export const createRoom = async (req, res) => {
    try {
        const { name, resetDay } = req.body;

        if (!name) {
            return res.status(400).json({ message: "❌ يجب إدخال اسم الروم" });
        }

        const room = new RoomModell({
            name,
            resetDay: resetDay ?? 6, // الافتراضي السبت
        });

        await room.save();

        res.status(201).json({
            message: "✅ تم إنشاء الروم بنجاح",
            room,
        });
    } catch (err) {
        console.error("❌ خطأ في إنشاء الروم:", err);
        res.status(500).json({ message: "❌ خطأ في إنشاء الروم", error: err.message });
    }
};



// utils/week.js
// احسب weekKey بناءً على resetDay للـ Room والمنطقة الزمنية Africa/Cairo
export function getWeekKey(resetDay = 6, now = new Date()) {
    // هنحوّل توقيت السيرفر لتوقيت القاهرة (تقريبي بدون مكتبات خارجية)
    // لو عايز دقة أعلى استخدم luxon أو moment-timezone.
    const cairoOffsetMs = 2 * 60 * 60 * 1000; // UTC+2 (بدون DST تعقيد)
    const cairo = new Date(now.getTime() + cairoOffsetMs);

    // اليوم: 0=Sunday..6=Saturday
    const day = cairo.getUTCDay();
    const diffToReset = (7 + (day - resetDay)) % 7;

    // بداية الأسبوع الحالي (الـ reset) بتوقيت "تقريبي" القاهرة
    const startOfWeek = new Date(cairo);
    startOfWeek.setUTCDate(cairo.getUTCDate() - diffToReset);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    // سنة وأسبوع من السنة (بسيطة/تقريبية)
    const year = startOfWeek.getUTCFullYear();
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const daysFromYearStart = Math.floor((startOfWeek - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.floor(daysFromYearStart / 7) + 1;

    return `${year}-W${String(weekNumber).padStart(2, "0")}`;
}


export const answerQuestion = async (req, res) => {
    try {
        const userId = req.user._id;
        const { classId } = req.user;
        const { roomId } = req.params;
        const { questionId, answer } = req.body;

        if (!roomId) return res.status(400).json({ message: "❌ roomId مطلوب" });
        if (!questionId) return res.status(400).json({ message: "❌ questionId مطلوب" });
        if (typeof answer === "undefined") return res.status(400).json({ message: "❌ answer مطلوب" });

        const room = await RoomModell.findById(roomId);
        if (!room) return res.status(404).json({ message: "❌ الروم غير موجود" });

        const question = await BankQuestionModel.findOne({ _id: questionId, roomId, classId });
        if (!question) return res.status(404).json({ message: "❌ السؤال غير موجود في هذا الروم/الصف" });

        // منع تكرار الإجابة مدى الحياة
        const already = await AnsweredModel.findOne({ userId, questionId });
        if (already) {
            return res.status(400).json({ message: "❌ لقد أجبت على هذا السؤال من قبل" });
        }

        const correct = (answer === question.correctAnswer);

        // weekKey الحالي للروم
        const weekKey = getWeekKey(room.resetDay);

        // جيب/أنشئ رصيد الأسبوع
        let weekly = await WeeklyScoreModel.findOne({ userId, roomId, weekKey });
        if (!weekly) {
            weekly = await WeeklyScoreModel.create({
                userId, roomId, weekKey, points: 0, answeredQuestions: []
            });
        }

        // تأكد مايحاولش يكرر نفس السؤال خلال نفس الأسبوع (احتياط)
        if (weekly.answeredQuestions.some(id => id.toString() === questionId)) {
            return res.status(400).json({ message: "❌ تم احتساب هذا السؤال ضمن نقاط هذا الأسبوع بالفعل" });
        }

        // حدّث النقاط
        if (correct) {
            weekly.points += question.mark;
        }
        weekly.answeredQuestions.push(question._id);
        await weekly.save();

        // سجّل الإجابة (History lifetime)
        await AnsweredModel.create({
            userId,
            roomId,
            questionId,
            correct
        });

        res.status(200).json({
            message: "✅ تم تسجيل الإجابة",
            correct,
            gained: correct ? question.mark : 0,
            weekKey,
            weeklyPoints: weekly.points
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ خطأ أثناء تسجيل الإجابة", error: err.message });
    }
};



export const getWeeklyRank = async (req, res) => {
    try {
        const userId = req.user._id;      // من التوكن
        const classId = req.user.classId; // من التوكن
        const { roomId } = req.params;

        if (!roomId) {
            return res.status(400).json({ message: "❌ roomId مطلوب" });
        }

        // جيب بيانات الروم
        const room = await RoomModell.findById(roomId);
        if (!room) return res.status(404).json({ message: "❌ الروم غير موجود" });

        // weekKey الحالي
        const weekKey = getWeekKey(room.resetDay);

        // جيب نقاط الطالب هذا الأسبوع
        const myScore = await WeeklyScoreModel.findOne({ userId, roomId, weekKey });

        // لو معندوش نقاط
        if (!myScore) {
            return res.json({
                success: true,
                message: "✅ لا يوجد بيانات لهذا الأسبوع بعد",
                data: {
                    weekKey,
                    points: 0,
                    rank: null,
                    expiresIn: getRemainingTime(room.resetDay),
                    previousWeeks: []
                }
            });
        }

        // جيب كل الطلاب في الروم والأسبوع الحالي
        const allScores = await WeeklyScoreModel.find({ roomId, weekKey })
            .sort({ points: -1, updatedAt: 1 });

        // احسب ترتيبي
        const rank = allScores.findIndex(s => s.userId.toString() === userId.toString()) + 1;

        // جيب الأسابيع السابقة لنفس الطالب
        const previousWeeks = await WeeklyScoreModel.find({
            userId,
            roomId,
            weekKey: { $lt: weekKey }
        }).sort({ weekKey: -1 });

        res.json({
            success: true,
            message: "✅ تم جلب ترتيب الطالب",
            data: {
                weekKey,
                points: myScore.points,
                rank,
                expiresIn: getRemainingTime(room.resetDay),
                previousWeeks: previousWeeks.map(w => ({
                    weekKey: w.weekKey,
                    points: w.points
                }))
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ خطأ أثناء جلب الترتيب", error: err.message });
    }
};

// 🕒 احسب الوقت المتبقي لانتهاء الأسبوع الحالي
function getRemainingTime(resetDay, now = new Date()) {
    const cairoOffsetMs = 2 * 60 * 60 * 1000;
    const cairo = new Date(now.getTime() + cairoOffsetMs);

    const day = cairo.getUTCDay();
    const diffToReset = (7 + (resetDay - day)) % 7;

    const endOfWeek = new Date(cairo);
    endOfWeek.setUTCDate(cairo.getUTCDate() + diffToReset);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const diffMs = endOfWeek - cairo;
    const duration = moment.duration(diffMs);

    return `${duration.days()}d ${duration.hours()}h ${duration.minutes()}m`;
}