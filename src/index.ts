import telegramService from "./services/telegramService";
import {
  createUser,
  getUserById,
  setWalletAddress,
  updateUserActivityInfo,
} from "./controllers/userController";
import langs from "./messages_lib";
import { initMongo } from "./services/mongo";
import { watchOnInfluencers } from "./services/crons";
import { rewardInfluencers } from "./controllers/statsController";
import sendLangSelectMsg from "./messages/sendLangSelectMsg";
import sendWelcomeMsg from "./messages/sendWelcomeMsg";
import sendWhatGetTokensForMessage from "./messages/sendWhatGetTokensForMessage";
import sendLearMoreMsg from "./messages/sendLearMoreMsg";
import sendLotteryMsg from "./messages/sendLotteryMsg";
import sendMyRefsListMsg from "./messages/sendMyRefsListMsg";
import sendTopInfluencersMsg from "./messages/sendTopInfluencersMsg";
import sendFirstRefLinkMsg from "./messages/sendFirstRefLinkMsg";
import sendAffiliateLinkMsg from "./messages/sendAffiliateLinkMsg";
import sendJoinToCommunityMsg from "./messages/sendJoinToCommunityMsg";
import sendAccountMsg from "./messages/sendAccountMsg";
import { sleep } from "./utils";
import { createMessage } from "./controllers/messageController";
import sendTranslatedMessage from "./messages/sendTranslatedMessage";
import sendCaptcha from "./messages/sendCaptcha";
import sendNeedJoinToCommunityMsg from "./messages/sendNeedJoinToCommunityMsg";

const { telegram: bot } = telegramService;
const schedule = require("node-schedule");
initMongo().then();

bot.on("message", async (msg) => {
  const user = await getUserById(msg.from.id);
  if (/\/start[ \t]*(.*)/.test(msg.text)) return;
  if (user == null) {
    await bot
      .sendMessage(msg.from.id, langs.ENG.message.hasNoUserError, {
        parse_mode: "HTML",
      })
      .catch(() => console.log(`❗️cannot send message to ${msg.from.id}`));

    return;
  }
  switch (msg.text) {
    //LANGUAGES
    case langs.ENG.button.enLngButton:
      await user.updateOne({ lang: "ENG" }).exec();
      await sendWelcomeMsg(user, "ENG");
      await sendJoinToCommunityMsg(user, "ENG");
      break;
    case langs.ENG.button.ruLngButton:
      await user.updateOne({ lang: "RUS" }).exec();
      await sendWelcomeMsg(user, "RUS");
      await sendJoinToCommunityMsg(user, "RUS");
      break;
    case langs.ENG.button.esLngButton:
      await user.updateOne({ lang: "SPA" }).exec();
      await sendWelcomeMsg(user, "SPA");
      await sendJoinToCommunityMsg(user, "SPA");
      break;

    //ALREADY WITH YOU BUTTON
    case langs.ENG.button.alreadyWithYou:
    case langs.RUS.button.alreadyWithYou:
    case langs.SPA.button.alreadyWithYou:
      //todo check chat
      const res = await Promise.all([
        telegramService.telegram
          .getChatMember(
            `@${langs[user.lang].link.telegramChannelLink.split("/").pop()}`,
            String(user.id)
          )
          .catch(() => ({ status: "Лох цветочный сиськастый" })),
        // telegramService.telegram.getChatMember(
        //   `@${langs[user.lang].link.telegramChatLink.split("/").pop()}`,
        //   String(user.id)
        // ),
      ]);
      if (
        res.every(
          (r) =>
            r.status === "member" ||
            r.status === "administrator" ||
            r.status === "creator"
        )
      ) {
        await sendWhatGetTokensForMessage(user);
      } else {
        await sendNeedJoinToCommunityMsg(user);
      }
      break;

    // LEARN MORE
    case langs.ENG.button.learnMore:
    case langs.RUS.button.learnMore:
    case langs.SPA.button.learnMore:
      await sendLearMoreMsg(user);
      break;

    // GET REF LINK
    case langs.ENG.button.getRefLink:
    case langs.RUS.button.getRefLink:
    case langs.SPA.button.getRefLink:
      await sendFirstRefLinkMsg(user);
      break;

    //my account button
    case langs.ENG.button.account:
    case langs.RUS.button.account:
    case langs.SPA.button.account:
      await sendAccountMsg(user);
      break;

    //affiliate button
    case langs.ENG.button.affiliateBtn:
    case langs.RUS.button.affiliateBtn:
    case langs.SPA.button.affiliateBtn:
      await sendAffiliateLinkMsg(user);
      break;

    //statistics button
    case langs.ENG.button.lottery:
    case langs.RUS.button.lottery:
    case langs.SPA.button.lottery:
      await sendLotteryMsg(user);
      break;

    //resources button
    case langs.ENG.button.resources:
    case langs.RUS.button.resources:
    case langs.SPA.button.resources:
      await sendTranslatedMessage(user, "resources");
      break;

    //refs button
    case langs.ENG.button.myReferals:
    case langs.RUS.button.myReferals:
    case langs.SPA.button.myReferals:
      await sendMyRefsListMsg(user);
      break;

    //influencers button
    case langs.ENG.button.influencers:
    case langs.RUS.button.influencers:
    case langs.SPA.button.influencers:
      await sendTopInfluencersMsg(user);
      break;

    //FAQ button
    case langs.ENG.button.faq:
    case langs.RUS.button.faq:
    case langs.SPA.button.faq:
      await sendTranslatedMessage(user, "faqMsg");
      break;

    //chat button
    case langs.ENG.button.chat:
    case langs.RUS.button.chat:
    case langs.SPA.button.chat:
      await sendTranslatedMessage(user, "chatMsg");
      break;
  }

  switch (user.state) {
    case keys.enterAddress:
      const success = await setWalletAddress(user, msg.text);
      if (!success) {
        await sleep(1000);
        await sendTranslatedMessage(user, "wrongWalletAddress");
      }
      await sendAccountMsg(await getUserById(msg.from.id));
      break;
  }

  await updateUserActivityInfo(user);
  await createMessage(msg);
});

//COMMANDS
bot.onText(/\/start[ \t]*(.*)/, async ({ chat, from }, match) => {
  let user = await getUserById(from.id);
  if (user == null) {
    await sendCaptcha(from.id, match ? String(match[1]) : null);
  } else {
    await updateUserActivityInfo(user);
    await sendLangSelectMsg(user);
  }
});

bot.onText(/\/id/, async ({ chat: { id } }) => {
  await bot
    .sendMessage(id, String(id))
    .catch(() => console.log(`❗️cannot send message to ${id}`));
});

export enum keys {
  enterAddress = "enterAddress",
  withdraw = "withdraw",
  changeAddress = "changeAddress",
  withdrawApprove = "withdrawApprove",
  withdrawReject = "withdrawReject",
  captcha = "captcha",
}

bot.on("callback_query", async ({ from, message, data: raw }) => {
  try {
    const { key, data } = JSON.parse(raw);
    //CAPTCHA VERIFY
    if (key === keys.captcha) {
      if (data.valid) {
        let user = await getUserById(from.id);
        if (user == null) user = await createUser(from, data.match);
        await updateUserActivityInfo(user);
        await sendLangSelectMsg(user);
      } else {
        await bot
          .sendMessage(from.id, langs.ENG.message.incorrectCaptcha)
          .catch(() => console.log(`❗️cannot send message to ${from.id}`));
        await sendCaptcha(from.id, data.match);
      }
      await bot.deleteMessage(from.id, String(message.message_id));
      return;
    }

    //Trying to find user
    const user = await getUserById(from.id);
    if (user == null) {
      await bot
        .sendMessage(from.id, langs.ENG.message.hasNoUserError)
        .catch(() => console.log(`❗️cannot send message to ${from.id}`));
      return;
    }
    switch (key) {
      case keys.enterAddress:
      case keys.changeAddress:
        await user.updateOne({ state: keys.enterAddress }).exec();
        await sendTranslatedMessage(user, "enterWalletAddress");
        break;
      case keys.withdraw:
        await telegramService.telegram
          .sendMessage(user.id, "Coming soon")
          .catch(() => console.log(`❗️cannot send message to ${user.id}`));
        // if (new BigNumber(user.balance).gt(process.env.MAX_WITHDRAW)) {
        //   await sendTranslatedMessage(user, "waitingForAdminConfirm");
        //   await sendRequestApproveMsgToAdmins(user);
        //   return;
        // } else {
        //   await sendTranslatedMessage(user, "withdrawProcess");
        //   const res = await withdraw(user);
        //   if (res == null) return;
        //   if (res.applicationStatus.includes("succeed")) {
        //     await user.updateOne({ balance: "0" }).exec();
        //     await sendSuccessWithdrawMsg(user, res.id);
        //     await sendAccountMsg(await getUserById(from.id));
        //   } else {
        //     await sendTranslatedMessage(user, "somethingWrong");
        //   }
        // }
        break;
      // case keys.withdrawApprove:
      //   const targetUser = await getUserById(data.id);
      //   if (targetUser == null) break;
      //   if (Number(targetUser.balance) === 0) {
      //     await bot.deleteMessage(
      //       process.env.CONFIRM_GROUP_ID,
      //       String(message.message_id)
      //     );
      //     break;
      //   }
      //   await editApproveRequestMessage(message.message_id);
      //   const res = await withdraw(targetUser);
      //   await editApproveRequestMessage(message.message_id, {
      //     text: "✅ Approved",
      //     url: getTxLink(res.id),
      //   });
      //   if (res == null) return;
      //   if (res.applicationStatus.includes("succeed")) {
      //     await targetUser.updateOne({ balance: "0" }).exec();
      //     await sendSuccessWithdrawMsg(targetUser, res.id);
      //   } else {
      //     await sendTranslatedMessage(user, "somethingWrong");
      //   }
      //   break;
      // case keys.withdrawReject:
      //   const requestedUser = await getUserById(data.id);
      //   if (requestedUser == null) break;
      //   if (Number(requestedUser.balance) === 0) {
      //     await bot.deleteMessage(
      //       process.env.CONFIRM_GROUP_ID,
      //       String(message.message_id)
      //     );
      //     break;
      //   }
      //   await editApproveRequestMessage(message.message_id, {
      //     text: `❌ Rejected by ${user.first_name}`,
      //     url: `tg://user?id=${user.id}`,
      //   });
      //   await sendTranslatedMessage(
      //     requestedUser,
      //     langs.RUS.message.withdrawRejected
      //   );
      //   break;
    }
  } catch (e) {}
});

(async () => {
  setInterval(async () => {
    await watchOnInfluencers();
  }, 15 * 60 * 1000);
})();

//reward top 10 influeners
schedule.scheduleJob("50 23 * * *", rewardInfluencers);

process.stdout.write("Bot has been started ✅ ");
