import {
  getChat,
  //   createChat,
  //   sendMessage,
  //   markSeen,
} from "../service/chatService.js";

export const getChatByCase = async (req, res) => {
  try {
    const caseId = req.params.id;
    const chat = await getChat(caseId);
    res.json(chat || {});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// export async function createChatController(req, res) {
//   try {
//     const { caseId } = req.params;
//     const chat = await createChat(caseId);
//     res.status(201).json(chat);
//   } catch (error) {
//     if (error.message === "Chat already exists") {
//       return res.status(400).json({ message: error.message });
//     }
//     if (error.message === "Case not found") {
//       return res.status(404).json({ message: error.message });
//     }
//     res.status(500).json({ message: error.message });
//   }
// }

// export const sendMessageController = async (req, res) => {
//   try {
//     const { caseId } = req.params;
//     const { message } = req.body;
//     const userId = req.user._id;

//     const newMessage = await sendMessage(caseId, userId, message);

//     res.json(newMessage);
//   } catch (error) {
//     const status = error.message === "Unauthorized" ? 403 : 500;
//     res.status(status).json({ message: error.message });
//   }
// };

// export const markSeenController = async (req, res) => {
//   try {
//     const { caseId } = req.params;

//     const result = await markSeen(caseId);

//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
