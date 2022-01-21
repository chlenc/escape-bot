import { Transaction } from "@waves/ts-types";
import { TUserDocument } from "./models/user";

export const prettifyNums = (x: number) => {
  const parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const createInlineButton = (
  text: string,
  key: string | number,
  callback_data?: any
) => ({
  text,
  callback_data: JSON.stringify({ key, data: callback_data }),
});

export const diffDays = (date, otherDate) =>
  Math.ceil(Math.abs(date - otherDate) / (1000 * 60 * 60 * 24));

// export const getSponsorAccountBalance = (): Promise<BigNumber> =>
//   assetBalance(
//     process.env.TOKEN_ADDRESS,
//     address(process.env.SEED, process.env.CHAIN_ID),
//     NODE_URL_MAP[process.env.CHAIN_ID]
//   ).then((b) => new BigNumber(b));

export const withdraw = async (
  user: TUserDocument
): Promise<
  Transaction & {
    applicationStatus?:
      | "succeed"
      | "succeeded"
      | "scriptExecutionFailed"
      | "script_execution_failed";
  } & {
    id: string;
  }
> => {
  return null;
  // const recipient = user.walletAddress;
  // const amount = new BigNumber(user.balance).times(1e8).toString();
  //
  // const isAddressValid = await checkWalletAddress(user.walletAddress);
  // if (!isAddressValid) {
  //   await sendTranslatedMessage(user, "wrongWalletAddress");
  //   return null;
  // }
  //
  // const rawBalance = await getSponsorAccountBalance();
  // const isEnoughMoney = rawBalance.gt(amount);
  // if (!isEnoughMoney) {
  //   await telegramService.telegram
  //     .sendMessage(process.env.CONFIRM_GROUP_ID, "❌ There is leak of money")
  //     .catch(() =>
  //       console.log(`❗️cannot send message to ${process.env.CONFIRM_GROUP_ID}`)
  //     );
  //   throw "There is leak of money";
  // }
  // const ttx = transfer(
  //   {
  //     recipient,
  //     amount,
  //     assetId: process.env.TOKEN_ADDRESS,
  //     chainId: process.env.CHAIN_ID,
  //   },
  //   process.env.SEED
  // );
  //
  // await sleep(30000);
  // const { balance } = await getUserById(user.id);
  // if (Number(balance) === 0) {
  //   await sendTranslatedMessage(user, "noFundsToWithdraw");
  //   return null;
  // }
  //
  // const tx = await broadcast(ttx, NODE_URL_MAP[process.env.CHAIN_ID]);
  // const res = await waitForTx(tx.id, {
  //   apiBase: NODE_URL_MAP[process.env.CHAIN_ID],
  // });
  // return { ...res, id: tx.id };
};

export const getTxLink = (txId: string) => "tx";
// `${EXPLORER_URL_MAP[process.env.CHAIN_ID]}tx/${txId}`;

export const buildHtmlUserLink = (user: TUserDocument) =>
  `<a href="tg://user?id=${user.id}">${
    user.username != null
      ? `@${user.username}`
      : `${user.first_name || ""} ${user.last_name || ""}`
  }</a>`;

export function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

export function getUniqueRandomWinnersFromArray(
  array: Array<number>,
  count: number
): number[] {
  const arr = [];
  const uniqueValues = unique(array.map(String)).length;
  while (arr.length < (uniqueValues < count ? uniqueValues : count)) {
    const index = randomInteger(0, array.length - 1);
    const r = array[index];
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}

function unique(arr: Array<string>) {
  let result = [];

  for (let str of arr) {
    if (!result.includes(str)) {
      result.push(str);
    }
  }

  return result;
}
