const mineflayer = require("mineflayer");
const Groq = require("groq-sdk");

// إعداد المفتاح من Railway
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
            model: "llama-3.3-70b-versatile", 
        });
        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Groq Error:", error);
        // إذا طلع خطأ في الموديل، بيعطيك تنبيه بسيط في اللعبة
        return "⚠️ عذراً، الذكاء الاصطناعي مشغول حالياً.";
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
        // تسجيل الدخول التلقائي
        setTimeout(() => {
            bot.chat(`/login ${config.password}`);
        }, 2000);
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;

        // نظام التحقق من كلمة ai
        const aiRegex = /\bai\b/i; 
        if (aiRegex.test(message)) {
            const cleanMessage = message.replace(aiRegex, '').trim();
            const reply = await askAI(cleanMessage || "مرحباً");
            
            // تقسيم الرد إذا كان طويل جداً عشان ماينكرافت ما ترفضه
            bot.chat(reply.substring(0, 200));
        }
    });

    // إعادة الاتصال التلقائي في حال الفصل
    bot.on("end", () => {
        console.log("فصل البوت.. جاري إعادة الاتصال بعد 15 ثانية");
        setTimeout(createBot, 15000);
    });

    bot.on("error", (err) => console.log("خطأ في البوت: ", err));
}

createBot();
