import api from "./axios";

export async function getQuickReplies(botId) {
    const { data } = await api.get(`/bots/${botId}/quick-replies/`);
    return data;
}

export async function createQuickReply(botId, text) {
    const { data } = await api.post(`/bots/${botId}/quick-replies/`, { text });
    return data;
}

export async function deleteQuickReply(botId, id) {
    const { data } = await api.delete(`/bots/${botId}/quick-replies/${id}/`);
    return data;
}