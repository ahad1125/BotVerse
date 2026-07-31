import api from './axios';


export const sendChatMessage = async (botId, payload) => {
    const { data } = await api.post(`/bots/${botId}/chat/`, payload)
    return data;
}

export const getConversationMessages = async (botId, conversationId) => {
    const { data } = await api.get(`/bots/${botId}/conversations/${conversationId}/messages/`)
    return data;
}