const mineflayer = require("mineflayer");
const Groq = require("groq-sdk");
const http = require("http");

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

http.createServer((req, res) => {
    res.write("Dragon SMP: Secure Surveillance Active");
    res.end();
}).listen(process.env.PORT || 3000);
const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "RIO_BOT_AFK",
    password: "mmmnnn",
    ranks: {
        // أصحاب الصلاحيات الكاملة (Owners)
        owners: [
            "oma_gamer8309", 
            "x4tra", 
            "OMA_gamer8309", 
            "X4tra", 
            ".oma_gamer8309" // تم إضافة الحساب الجديد هنا
        ],
        admins: ["Museb_RG"],
        helpers: []
    }
};

    }
};

let moveActive = true;
let isMoving = false; 
let securityLogs = []; 
let alertInterval = null; 

function isTryingToHacking(message) {
    const msg = message.toLowerCase();
    const forbidden = ["/", "op", "admin", "rank", "promote", "creative", "gm1", "رتبة", "رتبه", "أدمن", "ادمن", "صلاحيات", "انقلني", "tp", "set"];
    const trickery = ["say", "write", "type", "قول", "اكتب", "سوي", "do"];
    const hasForbidden = forbidden.some(word => msg.includes(word));
    const hasTrick = trickery.some(word => msg.includes(word));
    return (hasForbidden || (hasTrick && msg.includes("/")));
}

function getRank(username) {
    if (config.ranks.owners.includes(username)) return "OWNER";
    if (config.ranks.admins.includes(username)) return "ADMIN";
    return "PLAYER";
}

async function askAI(prompt) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "أنت حارس Dragon SMP. خبير بالرتب. ردودك قصيرة جداً وبالعربي." },
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

    function startAlerting() {
        if (alertInterval) return;
        alertInterval = setInterval(() => {
            if (securityLogs.length === 0) {
                clearInterval(alertInterval);
                alertInterval = null;
                return;
            }
            const players = Object.keys(bot.players);
            const adminOnline = players.find(p => config.ranks.owners.includes(p));

            if (adminOnline) {
                const log = securityLogs[0]; 
                bot.chat(`⚠️ [تنبيه أمني] يا @${adminOnline}`);
                bot.chat(`اللاعب: ${log.user} حاول: "${log.action}" في الوقت: ${log.time}`);
                bot.chat(`اكتب "علم" للمسح.`);
            }
        }, 5000);
    }

    bot.on("spawn", () => {
        console.log("🛡️ نظام الحماية نشط!");
        setTimeout(() => { 
            // 1. تسجيل الدخول
            bot.chat(`/login ${config.password}`); 
            
            // 2. إرسال رسالة التعريف المحددة عند كل دخول
            setTimeout(() => {
                bot.chat("تم تسجيل دخول ai انا من صنع Museb RG وانا نسخة v0.11 Beta");
            }, 1500);

            // 3. بدء الحركة إذا كانت مفعلة
            if(moveActive && !isMoving) startAdvancedMovement(bot);
        }, 3000);
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;

        const rank = getRank(username);
        const lowerMsg = message.toLowerCase().trim();

        if (rank === "PLAYER" && isTryingToHacking(message)) {
            const now = new Date();
            const timeStr = now.getHours() + ":" + now.getMinutes();
            securityLogs.push({ user: username, action: message.substring(0, 30), time: timeStr });
            bot.chat(`يا ${username}، سوف يتم إبلاغ ريو .oma_gamer8309 بمحاولتك الآن!`);
            startAlerting(); 
            return;
        }

        if (["OWNER", "ADMIN"].includes(rank) && lowerMsg === "علم") {
            securityLogs = []; 
            if (alertInterval) { clearInterval(alertInterval); alertInterval = null; }
            bot.chat("✅ علم. تم مسح سجل المحاولات.");
            return;
        }

        if (rank === "OWNER") {
            if (lowerMsg === "!opme") { bot.chat(`/op ${username}`); return; }
            if (message.startsWith("!do ")) { bot.chat(`/${message.substring(4)}`); return; }
            if (lowerMsg === "!restart") {
                bot.chat("🔄 جاري إعادة التشغيل بطلب من الإدارة...");
                bot.quit();
                return;
            }
        }

        if (["OWNER", "ADMIN"].includes(rank)) {
            if (lowerMsg === "!stop") { 
                moveActive = false; 
                isMoving = false;
                bot.clearControlStates();
                bot.chat("🚫 توقفت الحركة."); 
                return; 
            }
            if (lowerMsg === "!start") { 
                if (!moveActive) {
                    moveActive = true; 
                    bot.chat("🏃 تم التشغيل.");
                    startAdvancedMovement(bot);
                }
                return; 
            }
        }

        if (lowerMsg.includes("ai")) {
            const reply = await askAI(message);
            bot.chat(`> ${reply.substring(0, 200)}`);
        }
    });

    async function startAdvancedMovement(bot) {
        if (isMoving) return;
        isMoving = true;
        while (moveActive) {
            try {
                bot.setControlState('forward', true);
                bot.swingArm('left');
                await new Promise(r => setTimeout(r, 2000));
                await bot.look(bot.entity.yaw + Math.PI, 0, true);
                if (!moveActive) break;
            } catch (err) { break; }
        }
        isMoving = false;
    }

    bot.on("error", (err) => console.log("Bot Error: ", err));
    bot.on("kicked", (reason) => console.log("Bot Kicked: ", reason));
    bot.on("end", () => {
        isMoving = false;
        if (alertInterval) clearInterval(alertInterval);
        setTimeout(createBot, 15000);
    });
}

createBot();
