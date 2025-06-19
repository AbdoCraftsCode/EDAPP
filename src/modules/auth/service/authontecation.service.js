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


    let user = await dbservice.findOne({
        model: Usermodel,
        filter: { email },
    });

    if (user?.provider === providerTypes.system) {
        return next(new Error("Invalid account. Please login using your email/password", { cause: 403 }));
    }

    
    if (!user) {
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
                userId, // ✅ Add generated userId here
                gender: "Male", // لو تقدر تجيبه من جوجل أو تخليه undefined
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

    return successresponse(res, "Done", 200, { access_Token, refreshToken, user });
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
        const { title, description } = req.body;
        const userId = req.user._id;

        const chapter = await chapterModel.create({
            title,
            description,
            createdBy: userId
        });

        res.status(201).json({ message: "✅ تم إنشاء الفصل بنجاح", chapter });
    } catch (error) {
        res.status(500).json({ message: "❌ خطأ أثناء إنشاء الفصل", error: error.message });
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

        // لكل درس، نجيب الملفات المرتبطة بيه (PDF أو فيديو)
        const populatedLessons = await Promise.all(
            lessons.map(async (lesson) => {
                const resources = await  LessonResourceModel.find({ lessonId: lesson._id });

                return {
                    _id: lesson._id,
                    title: lesson.title,
                    description: lesson.description,
                    files: resources.map((res) => ({
                        type: res.fileType.startsWith("video") ? "video" : "pdf",
                        url: res.url,
                        description: res.description,
                        fileName: res.fileName,
                        fileSize: res.fileSize,
                    })),
                };
            })
        );

        res.status(200).json({ message: "✅ الدروس والملفات", lessons: populatedLessons });
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

        const exam = await ExamModel.findOne({ lessonId });

        if (!exam) {
            return res.status(404).json({ message: "❌ لا يوجد امتحان لهذا الدرس" });
        }

        const questions = exam.questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            mark: q.mark
        }));
        

        res.status(200).json({ questions });
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
            totalScore: result.totalScore,
            maxScore: result.maxScore,
            questionsCount: result.answers.length,
            percentage: `${Math.round((result.totalScore / result.maxScore) * 100)}%`,
            createdAt: result.createdAt
        }));

        res.status(200).json({
            message: "✅ تم جلب نتائج الطالب",
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