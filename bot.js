const mineflayer = require("mineflayer");
const http = require("http");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- 1. إعداد ذكاء Gemini ---
// استبدل KEY_هنا بمفتاحك الخاص من Google AI Studio
const genAI = new GoogleGenerativeAI("AIzaSyDBObUJ2dV54xp-Vo8IXLutIrfqAwBftOA");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// خادم الويب لـ Railway
http.createServer((req, res) => {
    res.write("AFK Bot: Gemini AI + Infinite Action Mode");
    res.end();
}).listen(process.env.PORT || 3000);

const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "AFK_RIO_Bot",
    password: "mmmnnn"
};

const walkTime = 22000; 

// وظيفة الحصول على رد من Gemini
async function askGemini(prompt) {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "عذراً، نظام الذكاء الاصطناعي مشغول حالياً.";
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

    // --- نظام الرد الذكي عند وجود كلمة Ai ---
    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;

        // التحقق من وجود كلمة Ai في الجملة
        if (message.toLowerCase().includes('ai')) {
            console.log(`[سؤال من ${username}]: ${message}`);
            const reply = await askGemini(message);
            
            // الرد في الشات (أول 200 حرف لتجنب قوانين ماينكرافت)
            bot.chat(reply.substring(0, 200));
        }
    });

    async function startInfiniteAction(bot) {
        while (true) {
            for (let i = 0; i < 4; i++) {
                if (!bot.entity) return;

                bot.setControlState('forward', true);
                const actionTimer = setInterval(() => {
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
           
