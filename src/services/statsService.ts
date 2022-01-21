import axios from "axios";
import * as moment from "moment";
import { User } from "../models/user";
import { isAddress } from "web3-utils";

export const totalFarmingPower = async () => {
  try {
    const { data } = await axios.get(
      "https://node2.duxplorer.com/farming/json"
    );
    const res = data.farmData.reduce(
      (acc, { farmingPower }) => acc + farmingPower,
      0
    );
    return `💪 Total farming power: *${res}*`;
  } catch (e) {
    console.log("totalFarmingPower", e);
    return "";
  }
};

export const checkWalletAddress = async (address: string): Promise<boolean> =>
  address != null && typeof address === "string" && isAddress(address);

export async function getMostFrequentInfluencers() {
  const todayDate = moment().startOf("day").toISOString();
  const userAddedToday = await User.find({
    createdAt: {
      $gte: todayDate,
    },
    ref: { $exists: true },
  });
  const invitorsRawMap = userAddedToday
    .reduce((acc, { ref }) => {
      const index = acc.findIndex((item) => item.ref === ref);
      if (index === -1) {
        acc.push({ ref, count: 1 });
      } else {
        acc[index].count += 1;
      }
      return acc;
    }, [] as Array<{ ref: number; count: number }>)
    .sort((a, b) => (a.count > b.count ? 1 : b.count < a.count ? -1 : 0));
  const influencers = await User.find({
    id: { $in: invitorsRawMap.map(({ ref }) => ref) },
  }).exec();
  return invitorsRawMap
    .map(({ count, ref }) => ({
      count,
      user: influencers.find(({ id }) => id === ref),
    }))
    .filter(
      ({ user, count }) =>
        user != null && count >= Number(process.env.MIN_INVITATIONS_COUNT)
    );
}
