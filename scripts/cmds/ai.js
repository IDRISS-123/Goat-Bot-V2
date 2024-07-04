 const axios = require('axios');

const services = [
    { url: 'https://markdevs-last-api.onrender.com/gpt4', params: { prompt: '', uid: 'your-uid-here' } },
    { url: 'http://markdevs-last-api.onrender.com/api/v2/gpt4', params: { query: '' } },
    { url: 'https://markdevs-last-api.onrender.com/api/v3/gpt4', params: { ask: '' } }
];

async function fetchFromAI(url, params) {
    try {
        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getAIResponse(input, userId, messageID) {
    let response = "𝗕𝗢𝗧 𝗜𝗦 𝗔𝗟𝗜𝗩𝗘 .";
    let currentIndex = 0;

    for (let i = 0; i < services.length; i++) {
        const service = services[currentIndex];
        service.params.prompt = input; // Met à jour le paramètre de la requête avec l'input actuel

        const data = await fetchFromAI(service.url, service.params);
        if (data && (data.gpt4 || data.reply || data.response)) {
            response = data.gpt4 || data.reply || data.response;
            break;
        }
        currentIndex = (currentIndex + 1) % services.length; // Passe au service suivant dans le cycle
    }

    return { response, messageID };
}

module.exports = {
    config: {
        name: 'ai',
        author: 'Pharouk',
        role: 0,
        category: 'ai',
        shortDescription: 'AI to ask anything',
    },
    onStart: async function ({ api, event, usersData, threadsData }) {
        try {
            const loadingMessage = "𝗟𝗢𝗔𝗗𝗜𝗡𝗚 🔂 Veuillez patienter pendant que nous collectons les statistiques...";
            await api.sendMessage(loadingMessage, event.threadID);

            const input = event.body.trim(); // Utilise directement le message d'événement pour l'entrée
            if (!input) {
                api.sendMessage(`𝗜𝗗𝗥𝗜𝗦𝗦✅\n━━━━━━━━━━━━━━━━\nVeuillez fournir une question ou une déclaration.`, event.threadID, event.messageID);
                return;
            }

            const { response, messageID } = await getAIResponse(input, event.senderID, event.messageID);
            api.sendMessage(`𝗜𝗦𝗥𝗜𝗦𝗦✅ \n━━━━━━━━━━━━━━━━\n${response}`, event.threadID, messageID);
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la commande AI onStart:', error);
            api.sendMessage('Une erreur s\'est produite lors du traitement de votre demande. Veuillez réessayer plus tard.', event.threadID);
        }
    },
    onChat: async function ({ event, message }) {
        const messageContent = event.body.trim().toLowerCase();
        if (messageContent.startsWith("ai")) {
            const input = messageContent.replace(/^ai\s*/, "").trim();
            const { response, messageID } = await getAIResponse(input, event.senderID, message.messageID);
            message.reply(`𝗜𝗗𝗥𝗜𝗦𝗦✅\n━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━`, messageID);
        }
    }
};
