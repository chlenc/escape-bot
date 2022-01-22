import telegramService from "../services/telegramService";
import langs from "../messages_lib";
import { createInlineButton, diffDays } from "../utils";
import { keys } from "../index";
import { checkWalletAddress } from "../services/statsService";
import centerEllipsis from "../utils/centerEllipsis";

const { telegram: bot } = telegramService;

const sendAccountMsg = async (user) => {
  const lng = langs[user.lang];
  const days = diffDays(new Date(user.createdAt), new Date());

  const isValidAddress = await checkWalletAddress(user.walletAddress);

  const changeValues = {
    "{{daysWithUs}}": days,
    "{{balance}}": user.balance,
  };
  isValidAddress &&
    (changeValues["{{address}}"] = centerEllipsis(user.walletAddress, 16));
  const msg = lng.message[
    isValidAddress ? "loggedInAccountInfo" : "accountInfo"
  ].replace(
    new RegExp(Object.keys(changeValues).join("|"), "gi"),
    (matched) => changeValues[matched]
  );

  const inline_keyboard = isValidAddress
    ? [
        [createInlineButton(lng.button.withdraw, keys.withdraw)],
        [createInlineButton(lng.button.changeAddress, keys.changeAddress)],
        [
          {
            text: lng.button.howToCreateWallet,
            url: lng.link.howTocreateWalletLink,
          },
        ],
      ]
    : [
        [createInlineButton(lng.button.enterWalletAddress, keys.enterAddress)],
        [
          {
            text: lng.button.howToCreateWallet,
            url: lng.link.howTocreateWalletLink,
          },
        ],
      ];
  await bot
    .sendMessage(user.id, msg, { reply_markup: { inline_keyboard } })
    .catch(() => console.log(`❗️cannot send message to ${user.id}`));
};
export default sendAccountMsg;
