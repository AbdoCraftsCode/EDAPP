
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import * as dbservice from "../../../DB/dbservice.js"
import { ChatModel } from "../../../DB/models/chaatmodel.js";






 


export const findGroupChat = asyncHandelr(async (req, res, next) => {
    const chat = await ChatModel.findOne().populate([
        {
            path: "participants",
            select: "_id username"
        },
        {
            path: "messages.senderId",
            select: "_id username"
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
    const chat = await dbservice.findOneAndUpdate({
        model: ChatModel,

        filter: {

            $or: [
                {
                    mainUser: req.user._id,
                    subpartisipant: destId,


                },
                {
                    mainUser: destId,
                    subpartisipant: req.user._id,

                }


            ]
        },
        populate: [
            {
                path: "mainUser"
            },
            {
                path: "subpartisipant"
            },

            {
                path: "messages.senderId"
            }

        ]

    })

    successresponse(res, { chat })


})