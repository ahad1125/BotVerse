import api from "./axios"

export const getBots = async () => {
    const { data } = await api.get('/bots/')
    return data;
}

export const getBot = async (botId) => {
    const { data } = await api.get(`/bots/${botId}/`)
    return data;
}

export const createBot = async (botData) => {
    const { data } = await api.post('/bots/', botData)
    return data;
}

export const updateBot = async (botId, botData) => {
    const { data } = await api.patch(`/bots/${botId}/`, botData)
    return data;
}

export const deleteBot = async (botId) => {
    const { data } = await api.delete(`/bots/${botId}/`)
    return data;
}

