const mineflayer = require("mineflayer");
const http = require("http");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// إعداد Gemini - الاعتماد الكلي على المتغير السري في Railway
const apiKey = process.env.GEMINI_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// خادم الويب لـ Railway
http.createServer((req, res) => {
    res.write("AFK Bot: Gemini AI Active");
    res.end();
}).listen(process.env.PORT || 3000);

const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "AFK_RIO_Bot",
    password: "mmmnnn"
};

const walkTime = 22000; 

// --- وظيفة الرد المعدلة لكشف الخطأ ---
async function askGemini(prompt) {
    try {
        if (!apiKey) return "⚠️ خطأ: مفتاح GEMINI_KEY غير مضاف في Railway!";
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        // التعديل هنا ليعطيك السبب الحقيقي في شات ماينكرافت
        return "⚠️ خطأ: " + (error.message ? error.message.substring(0, 50) : "مشكلة في الاتصال");
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
        console.log("✅ دخل البوت! نظام الـ AI والأكشن نشط...");
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            setTimeout(() => bot.chat(`/login ${config.password}`), 1500);
            setTimeout(() => startInfiniteAction(bot), 5000);
        }, 3000);
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;

        const aiRegex = /\bai\b/i; 

        if (aiRegex.test(message)) {
            console.log(`[سؤال من ${username}]: ${message}`);
            const reply = await askGemini(message);
            // تقصير الرد ليتناسب مع شات ماينكرافت
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
