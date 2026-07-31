import api from "./axios";

export async function getLeads(botId) {
    const { data } = await api.get(`/bots/${botId}/leads/`)
    return data;
}