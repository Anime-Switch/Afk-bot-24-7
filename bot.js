const mineflayer = require("mineflayer");
const Groq = require("groq-sdk");
const http = require("http");

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

http.createServer((req, res) => {
    res.write("Dragon SMP: Admin System & Advanced Movement Active");
    res.end();
}).listen(process.env.PORT || 3000);

const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "AFK_RIO_Bot",
    password: "mmmnnn",
    owner: "OMA_gamer8309" 
};

let moveActive = true; 

async function askAI(prompt) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "أنت حارس Dragon SMP. اسمك AFK_RIO_Bot. خبير في بلوقنات السيرفر. ردودك قصيرة وبالعربي." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile", 
        });
        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) { return "⚠️ مشغول!"; }
}

function createBot() {
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: "1.21.1"
    });

    bot.on("spawn", () => {
        console.log("✅ البوت نشط بنظام الحركة المطور!");
        setTimeout(() => {
            bot.chat(`/login ${config.password}`);
            setTimeout(() => { if(moveActive) startAdvancedMovement(bot); }, 5000);
        }, 3000);
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;

        // --- أوامر الإدارة ---
        if (username === config.owner) {
            if (message === "!stop") {
                moveActive = false;
                bot.clearControlStates();
                bot.chat("🚫 أبشر، وقفت الحركة والضرب والنط.");
                return;
            }
            if (message === "!start") {
                if(!moveActive) {
                    moveActive = true;
                    bot.chat("🏃 تم تفعيل نظام الـ 10 بلوكات والضرب.");
                    startAdvancedMovement(bot);
                }
                return;
            }
        }

        // --- الذكاء الاصطناعي ---
        const aiRegex = /\bai\b/i; 
        if (aiRegex.test(message)) {
            const reply = await askAI(message.replace(aiRegex, ''));
            bot.chat(reply.substring(0, 200));
        }
    });

    // --- نظام الحركة المطور (10 بلوكات ذهاب وإياب + ضرب ونط) ---
    async function startAdvancedMovement(bot) {
        while (moveActive) {
            try {
                // المرحلة 1: الذهاب 10 بلوكات (تقريباً 4 ثواني مشي)
                await performMove(bot, 'forward', 4000);
                
                if (!moveActive) break;

                // الدوران للخلف (180 درجة)
                const yaw = bot.entity.yaw + Math.PI;
                await bot.look(yaw, 0, true);

                // المرحلة 2: العودة 10 بلوكات
                await performMove(bot, 'forward', 4000);

                await new Promise(r => setTimeout(r, 1000));
            } catch (err) { break; }
        }
    }

    // وظيفة مساعدة للمشي مع الضرب والنط
    async function performMove(bot, control, duration) {
        const startTime = Date.now();
        bot.setControlState(control, true);

        while (Date.now() - startTime < duration && moveActive) {
            bot.swingArm('left'); // يضرب
            if (Math.random() > 0.7) { // ينط بشكل عشوائي
                bot.setControlState('jump', true);
                await new Promise(r => setTimeout(r, 200));
                bot.setControlState('jump', false);
            }
            await new Promise(r => setTimeout(r, 500));
        }
        bot.setControlState(control, false);
    }

    bot.on("end", () => setTimeout(createBot, 15000));
}

createBot();
