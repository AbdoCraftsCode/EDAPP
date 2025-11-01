import { Router } from "express";
import { validation } from "../../middlewere/validation.middlewere.js";
import  * as validators from "../auth/auth.validate.js"
import { addQuestion, adduser, confirmOTP, generateShareLink,createFile, createImages,   getAllImages, getAllRanks, GetFriendsList, getMyRank, Getprofiledata, getQuestionsByClassAndSubject, getSharedFile,  getUserFiles, getUserRoleById, getUserStorageUsage, resendOTP, shareFile, signup, signupwithGmail, submitAnswer, incrementFileView, getShareLinkAnalytics, getUserAnalytics, updateProfile, getUserEarnings, deleteFile, updateFileName, getUserFriends, getAllUsers, sendFriendRequest, acceptFriendRequest, getFriendData, getNotifications } from "./service/regestration.service.js";
import { addComment, answerDailyQuestion, answerQuestion, bankCreateGeneralQuestions, bulkCreateGeneralQuestions, createChapter, createClass, createDailyExam, createDailyQuestion, createExam, createLesson, createPost, createRoom, createSubject, createWithdrawal, forgetpassword,   getActiveDailyExam,   getAllChapters,   getAllClasses,   getAllLessons,   getAllMaterials,   getAllPosts,   getAllPremiumUsers,   getAllSubjects,   getBankQuestionsByClass,   getChaptersBySubject,   getCommentsByPost,   getDailyRank,   getExamQuestions,   getExamQuestionsById,   getLessonsByChapter,   getMyExamResults,   getMyExamStats,   getMyPremiumStatus,   getRandomQuestionsByClass,   getResultByLesson,   getTopStudentsOverall,   getUserPosts,   getWeeklyRank,   login, loginwithGmail, reactToPost, refreshToken, resetpassword, setUserPremium, submitExam, submitMatchingExam, subscribeToExam, updateLessonImage, updateUserSelf, uploadChatAttachment, uploadLessonResource, uploadMaterial } from "./service/authontecation.service.js";
import { authentication } from "../../middlewere/authontcation.middlewere.js";
import { fileValidationTypes, uploadCloudFile } from "../../utlis/multer/cloud.multer.js";
import { findGroupChat, findonechat2 } from "../chat/chat/chat.service.js";
import { ChatModel } from "../../DB/models/chaatmodel.js";


import mongoose, { Schema, Types, model } from "mongoose";
const routr = Router()




routr.post("/signup", signup)

routr.post("/createImages",
   
  
    uploadCloudFile(fileValidationTypes.image).single("image"),
    createImages
)
routr.post(
    '/createFile',
    authentication(),
    uploadCloudFile([
        ...fileValidationTypes.image,
        ...fileValidationTypes.document,
        ...fileValidationTypes.video,
        // تم دمج zip ضمن document فلا داعي لها هنا
    ]).single('file'),
    createFile
);



routr.post(
    "/uploadLessonResource",
    authentication(),
    uploadCloudFile([
        ...fileValidationTypes.video,
        ...fileValidationTypes.document,
    ]).fields([
        { name: "video", maxCount: 1 },
        { name: "document", maxCount: 1 },
    ]),
    (req, res, next) => {
        // تحديد الملف المرفوع سواء فيديو أو PDF
        req.file = req.files.video?.[0] || req.files.document?.[0];
        next();
    },
    uploadLessonResource
);
  
  
routr.post(
    "/uploadChatAttachment",
    authentication(),
    uploadCloudFile([
        ...fileValidationTypes.image,
        ...fileValidationTypes.audio,
        ...fileValidationTypes.video,
        ...fileValidationTypes.document,
    ]).fields([
        { name: "file", maxCount: 1 }, // تسمية الحقل "file" كـ standard
    ]),
    (req, res, next) => {
        // حدد الملف المرفوع أياً كان نوعه
        req.file =
            req.files.file?.[0] || null;

        next();
    },
    uploadChatAttachment
  );


  routr.post(
      "/uploadMaterial",
      authentication(),
  
    uploadCloudFile([
        ...fileValidationTypes.image,
        ...fileValidationTypes.document,
    ]).fields([
        { name: "image", maxCount: 1 },
        { name: "pdf", maxCount: 1 },
    ]),
    (req, res, next) => {
        req.imageFile = req.files.image?.[0] || null;
        req.pdfFile = req.files.pdf?.[0] || null;
        next();
    },
   uploadMaterial
);
  


routr.post(
    "/createPost",
    authentication(),

    uploadCloudFile([...fileValidationTypes.image]).single("image"), // ⬅️ استخدم .single بدل .fields

    (req, res, next) => {
        // ✅ multer بيحط الصورة داخل req.file لما نستخدم single()
        if (req.file) {
            req.imageFile = req.file;
        } else {
            req.imageFile = null;
        }
        next();
    },

    createPost
);




    routr.post('/uploadChatAttachment', uploadCloudFile(fileValidationTypes.image).single("file"), authentication(), uploadChatAttachment);


routr.post("/resendOTP", resendOTP)
routr.post("/createRoom", createRoom)
routr.post("/createDailyQuestion", createDailyQuestion)
routr.post("/createDailyExam", createDailyExam)
routr.post("/createClass", createClass)
routr.post("/bankCreateGeneralQuestions", bankCreateGeneralQuestions)
routr.get("/getAllMaterials", getAllMaterials)
routr.get("/getAllPosts", getAllPosts)
routr.post("/createChapter", authentication(), createChapter)
routr.post("/createLesson", authentication(), createLesson)
routr.post("/answerDailyQuestion", authentication(), answerDailyQuestion)
routr.get("/getDailyRank", authentication(), getDailyRank)
routr.get("/getActiveDailyExam", authentication(), getActiveDailyExam)
routr.get("/getWeeklyRank/:roomId", authentication(), getWeeklyRank)

routr.post("/answerQuestion/:roomId", authentication(), answerQuestion)

routr.get("/getExamQuestionsById/:examId", getExamQuestionsById)

routr.patch("/updateProfile", authentication(), updateProfile)
routr.delete("/deleteFile/:fileId", authentication(), deleteFile)
routr.post("/subscribeToExam/:examId", authentication(), subscribeToExam)
routr.patch("/updateFileName/:fileId", authentication(), updateFileName)
routr.post("/reactToPost", authentication(), reactToPost)
routr.get("/getBankQuestionsByClass", authentication(), getBankQuestionsByClass)

routr.get("/getUserEarnings", authentication(), getUserEarnings)
routr.post("/addComment", authentication(), addComment)


routr.get("/getUserPosts/:userId", getUserPosts)

routr.post("/sendFriendRequest/:friendId",authentication(),sendFriendRequest)
routr.post("/acceptFriendRequest/:friendId", authentication(), acceptFriendRequest)
routr.get("/getFriendData", authentication(), getFriendData)
routr.get("/getNotifications", authentication(), getNotifications)


routr.get("/getUserFriends", authentication(), getUserFriends)
routr.get("/findonechat2/:destId",authentication()  ,findonechat2)

routr.get("/getCommentsByPost/:postId", authentication(), getCommentsByPost)

// routr.get('/share/:fileId', incrementFileView(), getSharedFile);

routr.post("/generateShareLink",authentication(), generateShareLink)

routr.get("/getShareLinkAnalytics", authentication(), getShareLinkAnalytics)

routr.get("/getAllChapters", getAllChapters)
routr.get("/getAllLessons", getAllLessons)
routr.get("/getLessonsByChapter/:chapterId", getLessonsByChapter)
routr.get("/getUserAnalytics", authentication(), getUserAnalytics)

routr.post("/createExam", authentication(), createExam)

routr.post("/submitExam", authentication(), submitExam)
routr.post("/createWithdrawal", authentication(), createWithdrawal)
routr.get("/getMyPremiumStatus", authentication(), getMyPremiumStatus)
routr.get("/getResultByLesson/:lessonId", authentication(), getResultByLesson)
routr.get("/getMyExamResults", authentication(), getMyExamResults)
routr.get("/getMyExamStats", authentication(), getMyExamStats)

routr.get("/getExamQuestions/:lessonId", authentication() ,getExamQuestions)
routr.get("/getUserRoleById/:_id", getUserRoleById)
routr.get("/getSharedFile/:fileId" ,getSharedFile)
routr.post("/addQuestion", addQuestion)

routr.post("/bulkCreateGeneralQuestions", bulkCreateGeneralQuestions)

routr.post("/submitAnswer", authentication(), submitAnswer)
routr.get("/getMyRank", authentication(), getMyRank)

routr.patch("/setUserPremium/:_id", authentication(), setUserPremium)
routr.get("/getAllPremiumUsers", authentication(), getAllPremiumUsers)
routr.get("/getTopStudentsOverall", getTopStudentsOverall)

routr.get("/getUserFiles", authentication(), getUserFiles)
routr.get("/getAllUsers",authentication() , getAllUsers)
routr.get("/getUserStorageUsage", authentication(), getUserStorageUsage)
routr.get("/findGroupChat",  findGroupChat)
routr.get("/GetFriendsList", authentication(),GetFriendsList)
routr.post("/signupwithGmail", signupwithGmail)
routr.post("/adduser/:friendId", authentication(),adduser)
// routr.post("/createClass", createClass)
routr.post("/createSubject", createSubject)
routr.post("/confirmOTP", confirmOTP)
routr.get("/Getprofiledata",authentication() ,Getprofiledata)
routr.post("/login", login)
routr.post("/shareFile/:id", shareFile)

routr.post("/refreshToken", refreshToken)
routr.post("/updateUserSelf", authentication(), updateUserSelf)

routr.post("/submitMatchingExam", authentication(), submitMatchingExam)
routr.post("/forgetpassword", forgetpassword)
routr.post("/resetpassword", resetpassword)
routr.post("/loginwithGmail", loginwithGmail)
routr.get("/getAllImages", getAllImages)
// routr.get("/getAllClasses", getAllClasses)
routr.get("/getAllRanks", getAllRanks)
routr.get("/getRandomQuestionsByClass/:classId", getRandomQuestionsByClass)

routr.get("/getAllSubjects", getAllSubjects)
routr.get("/getAllClasses", getAllClasses)
routr.get("/getChaptersBySubject/:subjectId", getChaptersBySubject)
routr.get("/getSharedFile/:uniqueId", getSharedFile)

routr.post("/getQuestionsByClassAndSubject", getQuestionsByClassAndSubject)


routr.post("/testsendmessage", authentication(), async (req, res) => {
    try {
        const user = req.user;
        const { message } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({ message: "❌ الرسالة فارغة" });
        }

        let chat = await ChatModel.findOne();

        if (!chat) {
            chat = await ChatModel.create({
                participants: [user._id],
                messages: []
            });
        }

        if (!chat.participants.includes(user._id)) {
            chat.participants.push(user._id);
        }

        const messageDoc = {
            _id: new mongoose.Types.ObjectId(),
            message,
            senderId: user._id
        };

        chat.messages.push(messageDoc);
        await chat.save();

        res.status(200).json({
            message: "✅ تم حفظ الرسالة",
            savedMessage: messageDoc
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ حدث خطأ", error: error.message });
    }
});
  

export default routr



