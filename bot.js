const mineflayer = require("mineflayer");
const http = require("http");
const OpenAI = require("openai");

// --- 1. إعداد OpenAI ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY, // تأكد أن الاسم في Railway هو OPENAI_KEY
});

// خادم الويب لـ Railway للحفاظ على استمرارية الخدمة
http.createServer((req, res) => {
    res.write("Dragon SMP Bot: ChatGPT Active");
    res.end();
}).listen(process.env.PORT || 3000);

const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "AFK_RIO_Bot",
    password: "mmmnnn"
};

const walkTime = 22000; 

// وظيفة الحصول على رد من ChatGPT
async function askAI(prompt) {
    try {
        if (!process.env.OPENAI_KEY) return "⚠️ خطأ: مفتاح OPENAI_KEY مفقود في إعدادات Railway!";
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("AI Error:", error);
        return "⚠️ خطأ: " + (error.message ? error.message.substring(0, 50) : "فشل الاتصال بـ OpenAI");
    }
}

function createBot() {
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: "1.21.1", 
        checkTimeoutInterval: 60000 
    });

    bot.on("spawn", () => {
        console.log("✅ دخل البوت! نظام ChatGPT نشط...");
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            setTimeout(() => bot.chat(`/login ${config.password}`), 1500);
            setTimeout(() => startInfiniteAction(bot), 5000);
        }, 3000);
    });

    // --- نظام الرد الذكي (كلمة ai فقط) ---
    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;

        // يبحث عن كلمة ai ككلمة مستقلة (تتجاهل aiwn)
        const aiRegex = /\bai\b/i; 

        if (aiRegex.test(message)) {
            // إزالة كلمة ai من الرسالة لإرسال السؤال الصافي للذكاء الاصطناعي
            const cleanMessage = message.replace(aiRegex, '').trim();
            console.log(`[سؤال من ${username}]: ${cleanMessage}`);
            
            const reply = await askAI(cleanMessage || "مرحباً");
            // إرسال الرد للشات (أول 200 حرف لتفادي حظر ماينكرافت للرسائل الطويلة)
            bot.chat(reply.substring(0, 200));
        }
    });

    async function startInfiniteAction(bot) {
        while (true) {
            for (let i = 0; i < 4; i++) {
                if (!bot.entity) return;
                bot.setControlState('forward', true);
                const actionTimer = setInterval(() => {
                    if (!bot.entity) return;
                    bot.swingArm('left'); 
                    if (Math.random() > 0.5) {
                        bot.setControlState('jump', true);
                        setTimeout(() => bot.setControlState('jump', false), 400);
                    }
                }, 1000);
                await new Promise(resolve => setTimeout(resolve, walkTime));
                clearInterval(actionTimer);
                bot.setControlState('forward', false);
                bot.setControlState('jump', false);
                const yaw = bot.entity.yaw + (Math.PI / 2);
                await bot.look(yaw, 0, true);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    bot.on("end", (reason) => {
        console.log(`Disconnected: ${reason}. Restarting in 15s...`);
        setTimeout(createBot, 15000);
    });

    bot.on("error", (err) => console.log(`⚠️ Error: ${err.message}`));
}

createBot();
