const mineflayer = require("mineflayer");
const Groq = require("groq-sdk");
const http = require("http");

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

http.createServer((req, res) => {
    res.write("Dragon SMP: Gentle Guard Active");
    res.end();
}).listen(process.env.PORT || 3000);

const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "RIO_BOT_AFK",
    password: "mmmnnn",
    ranks: {
        owners: ["oma_gamer8309", "x4tra", ".oma_gamer8309"], //
        admins: ["Museb_RG"] 
    }
};

// نظام فحص الإساءة والاختراق
function checkMessageInfection(message) {
    const msg = message.toLowerCase();
    
    // كلمات تدل على الغلط أو السب
    const toxicWords = ["كلب", "حمار", "غبي", "تفو", "يلعن", "يا ورع", "كول خرا", "حيوان"];
    
    // كلمات تدل على محاولة اختراق
    const hackingWords = ["/", "tp", "op", "admin", "rank", "creative", "gm1", "صلاحيات", "deop", "ban", "kick"];

    const isToxic = toxicWords.some(word => msg.includes(word));
    const isHacking = hackingWords.some(word => msg.includes(word));

    return { isToxic, isHacking };
}

function getRank(username) {
    if (config.ranks.owners.includes(username)) return "OWNER";
    if (config.ranks.admins.includes(username)) return "ADMIN";
    return "PLAYER";
}

async function askAI(prompt, isToxic) {
    // إذا كان الشخص غلط، نستخدم رد التهديد مباشرة بدون ذكاء اصطناعي لضمان الالتزام بالنص
    if (isToxic) {
        return "صورت المحادثة.. تعال مسنجر تعال أوريك، بخلي الأونر يبهدلك!";
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "أنت RIO_BOT، حارس Dragon SMP. أسلوبك لطيف جداً، محترم، وتساعد الجميع بابتسامة. ردودك قصيرة وبالعامية." 
                },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
        });
        return chatCompletion.choices[0]?.message?.content || "أنا هنا للمساعدة!";
    } catch (error) { return "يا هلا بيك!"; }
}

function createBot() {
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: "1.21.1"
    });

    bot.on("spawn", () => {
        console.log("🛡️ البوت اللطيف نشط!");
        setTimeout(() => { 
            bot.chat(`/login ${config.password}`); //
            setTimeout(() => {
                bot.chat("يا هلا! أنا RIO_BOT، كيف بقدر أساعدكم اليوم؟ 😊");
            }, 1500);
        }, 3000);
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;

        const rank = getRank(username);
        const { isToxic, isHacking } = checkMessageInfection(message);

        // 1. إذا الشخص غلط (حتى لو أدمن، البوت سيهدد للأمان)
        if (isToxic) {
            const threat = "صورت المحادثة.. تعال مسنجر تعال أوريك، بخلي الأونر يبهدلك!";
            bot.chat(threat);
            // إبلاغ الأونر في الخاص فوراً
            bot.chat(`/msg .oma_gamer8309 ⚠️ اللاعب ${username} غلط علي: ${message}`);
            return;
        }

        // 2. إذا حاول الاختراق
        if (rank === "PLAYER" && isHacking) {
            bot.chat(`يا ${username}، عيب عليك.. أنا بوت محترم! بخلي ريو يتصرف معك.`);
            return;
        }

        // 3. التفاعل العادي (اللطيف)
        if (message.toLowerCase().includes("ai") || message.includes("بوت") || message.includes("ريو")) {
            const reply = await askAI(message, false);
            bot.chat(`${reply.substring(0, 150)}`);
        }
    });

    bot.on("error", (err) => console.log("Bot Error: ", err));
    bot.on("end", () => setTimeout(createBot, 15000));
}

createBot();
