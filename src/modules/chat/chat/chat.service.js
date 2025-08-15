
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import * as dbservice from "../../../DB/dbservice.js"
import { ChatModel } from "../../../DB/models/chaatmodel.js";
import ChatModell from "../../../DB/models/chat2.model.js";

import mongoose from "mongoose";




 


export const findGroupChat = asyncHandelr(async (req, res, next) => {
    const chat = await ChatModel.findOne().populate([
        {
            path: "participants",
            select: "_id username profilePic"
        },
        {
            path: "messages.senderId",
            select: "_id username profilePic"
        }
    ]);

    if (!chat) {
        return successresponse(res, { messages: [] });
    }

    successresponse(res, {
        participants: chat.participants,
        messages: chat.messages
    });
});
  



// export const findGroupChat = asyncHandelr(async (req, res, next) => {
//     const chat = await ChatModel.findOne().populate([
//         {
//             path: "participants",
//             select: "_id username"
//         },
//         {
//             path: "messages.senderId",
//             select: "_id username"
//         }
//     ]);

//     if (!chat) {
//         return successresponse(res, { messages: [] });
//     }

//     successresponse(res, {
//         participants: chat.participants,
//         messages: chat.messages
//     });
// });


export const findonechat2 = asyncHandelr(async (req, res, next) => {
    const { destId } = req.params;

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const destObjectId = new mongoose.Types.ObjectId(destId);

    const chat = await ChatModell.findOne({
        $or: [
            { mainUser: userId, subpartisipant: destObjectId },
            { mainUser: destObjectId, subpartisipant: userId }
        ]
    })
        .populate("mainUser")
        .populate("subpartisipant")
        .populate("messages.senderId");

    if (!chat) {
        console.log("🚫 لم يتم العثور على محادثة بين:", userId, "و", destObjectId);
        return successresponse(res, { chat: null });
    }

    // استخراج الرسائل بالشكل المطلوب مع التوقيت والـ id
    const simplifiedMessages = chat.messages.map(msg => ({
        _id: msg._id,
        message: msg.message,
        senderId: msg.senderId._id,
        createdAt: msg.createdAt
    }));

    successresponse(res, simplifiedMessages);
});

