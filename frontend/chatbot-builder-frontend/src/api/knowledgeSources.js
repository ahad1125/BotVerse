import api from "./axios";


export const getKnowledgeSources = async (botId) => {
    const { data } = await api.get(`/bots/${botId}/knowledge-sources/`)
    return data;

}

export const createKnowledgeSource = async (botId, formData) => {
    const { data } = await api.post(`/bots/${botId}/knowledge-sources/`, formData, {

        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return data;
}

export const deleteKnowledgeSource = async (botId, id) => {
    const { data } = await api.delete(`/bots/${botId}/knowledge-sources/${id}/`)
    return data;
}

export const retryKnowledgeSource = async (botId, sourceId) => {
    const { data } = await api.post(
        `/bots/${botId}/knowledge-sources/${sourceId}/retry/`
    );
    return data;
};