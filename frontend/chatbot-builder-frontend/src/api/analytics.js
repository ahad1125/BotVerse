import api from "./axios"
export const getAnalyticsSummary = async (botId) => {
    const { data } = await api.get(`/bots/${botId}/analytics/summary/`);
    return data;
}