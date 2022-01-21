import { getMostFrequentInfluencers } from "./statsService";
import { buildHtmlUserLink } from "../utils";
import { STATISTIC, updateStats } from "../controllers/statsController";

export const watchOnInfluencers = async () => {
  const inf = await getMostFrequentInfluencers();
  inf.length > 10 && inf.slice(10);
  const value = inf.reduce(
    (acc, v, index) => acc + `${index + 1}. ${buildHtmlUserLink(v.user)}\n`,
    ""
  );
  await updateStats({ value }, STATISTIC.INFLUENCERS);
};
