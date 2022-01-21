import telegramService from "../services/telegramService";
import { TUserDocument } from "../models/user";
import langs from "../messages_lib";
import { getStatisticFromDB, STATISTIC } from "../controllers/statsController";

const { telegram: bot } = telegramService;

const sendLotteryMsg = async (user: TUserDocument) => {
  await bot
    .sendMessage(user.id, "Coming soon", { parse_mode: "Markdown" })
    .catch(() => console.log(`❗️cannot send message to ${user.id}`));
};
export default sendLotteryMsg;
