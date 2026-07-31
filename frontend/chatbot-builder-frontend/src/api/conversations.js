import api from "./axios";

export async function getConversations(botId) {
    const { data } = await api.get(`/bots/${botId}/conversations/`);
    return data;
}