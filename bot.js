const mineflayer = require("mineflayer");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "AFK_RIO_Bot",
    password: "mmmnnn"
};

async function askAI(prompt) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-8b-8192", // موديل قوي وسريع جداً
        });
        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        return "⚠️ خطأ: " + error.message.substring(0, 50);
    }
}

function createBot() {
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: "1.21.1"
    });

    bot.on("spawn", () => {
        console.log("✅ البوت اشتغل بنظام Groq المجاني!");
        bot.chat(`/login ${config.password}`);
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;
        const aiRegex = /\bai\b/i; 
        if (aiRegex.test(message)) {
            const reply = await askAI(message.replace(aiRegex, ''));
            bot.chat(reply.substring(0, 200));
        }
    });

    bot.on("end", () => setTimeout(createBot, 15000));
}

createBot();
