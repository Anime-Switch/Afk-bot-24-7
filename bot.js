const mineflayer = require("mineflayer");
const Groq = require("groq-sdk");
const http = require("http");

// إعداد مفتاح API الخاص بـ Groq لردود الذكاء الاصطناعي
const groq = new Groq({ apiKey: process.env.GROQ_KEY });

// سيرفر ويب بسيط لبقاء البوت نشطاً 24/7 على Railway
http.createServer((req, res) => {
    res.write("Dragon SMP: Bot Status Online[span_2](start_span)[span_2](end_span)");
    res.end();
}).listen(process.env.PORT || 3000);

const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "RIO_BOT_AFK",
    password: "mmmnnn",
    owners: ["oma_gamer8309", "x4tra", ".oma_gamer8309"], // قائمة الأونرية[span_3](start_span)[span_3](end_span)
    admins: ["Museb_RG"]
};

function createBot() {
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: "1.21.1"
    });

    // --- نظام Anti-AFK (التحرك التلقائي لمنع الطرد) ---[span_4](start_span)[span_4](end_span)
    let afkInterval;
    function startAFK() {
        if (afkInterval) clearInterval(afkInterval);
        afkInterval = setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
            bot.look(Math.random() * Math.PI * 2, 0);
        }, 15000); // يتحرك ويقفز كل 15 ثانية[span_5](start_span)[span_5](end_span)
    }

    bot.on("spawn", () => {
        console.log("🛡️ RIO_BOT تم تسجيل الدخول بنجاح[span_6](start_span)[span_6](end_span)!");
        
        // تنفيذ أوامر التسجيل والدخول تلقائياً بعد 3 ثوانٍ من الدخول[span_7](start_span)[span_7](end_span)
        setTimeout(() => { 
            bot.chat(`/register ${config.password} ${config.password}`); // للتسجيل أول مرة[span_8](start_span)[span_8](end_span)
            bot.chat(`/login ${config.password}`); // لتسجيل الدخول إذا كان مسجلاً[span_9](start_span)[span_9](end_span)
            startAFK(); // تفعيل التحرك[span_10](start_span)[span_10](end_span)
        }, 3000);
    });

    // --- نظام الترحيب بالأونر عند الدخول ---[span_11](start_span)[span_11](end_span)
    bot.on('playerJoined', (player) => {
        if (config.owners.includes(player.username)) {
            setTimeout(() => {
                bot.chat(`⚠️ تسجيل دخول الاونر: ${player.username} ⚠️[span_12](start_span)[span_12](end_span)`);
            }, 2000);
        }
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;

        const msg = message.toLowerCase();
        const isOwner = config.owners.includes(username);
        
        // 1. نظام الرد على الإساءة والتهديد[span_13](start_span)[span_13](end_span)
        const toxicWords = ["كلب", "حمار", "غبي", "تفو", "يلعن", "يا ورع", "كول خرا", "حيوان"];
        if (toxicWords.some(word => msg.includes(word))) {
            bot.chat("صورت المحادثة.. تعال مسنجر تعال أوريك، بخلي الأونر يبهدلك[span_14](start_span)[span_14](end_span)!");
            bot.chat(`/msg .oma_gamer8309 اللاعب ${username} قام بالسب: ${message}[span_15](start_span)[span_15](end_span)`);
            return;
        }

        // 2. أمر !opme للأونر فقط[span_16](start_span)[span_16](end_span)
        if (msg === "!opme" && isOwner) {
            bot.chat(`/op ${username}`);
            bot.chat(`تفضل يا زعيم، تم إعطاؤك الـ OP! ✅[span_17](start_span)[span_17](end_span)`);
            return;
        }

        // 3. التفاعل عبر الذكاء الاصطناعي (كلمة بوت أو ريو أو ai)[span_18](start_span)[span_18](end_span)
        if (msg.includes("بوت") || msg.includes("ai") || msg.includes("ريو")) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: "أنت RIO_BOT، حارس سيرفر Dragon SMP. أسلوبك لطيف جداً ومحترم. ردودك بالعامية العربية وقصيرة.[span_19](start_span)[span_19](end_span)" },
                        { role: "user", content: message }
                    ],
                    model: "llama-3.3-70b-versatile",
                });
                const reply = completion.choices[0]?.message?.content || "هلا بيك!";
                bot.chat(reply.substring(0, 150));
            } catch (err) {
                bot.chat("يا هلا فيك[span_20](start_span)[span_20](end_span)!");
            }
        }
    });

    // معالجة الأخطاء وإعادة الاتصال التلقائي[span_21](start_span)[span_21](end_span)
    bot.on("error", (err) => console.log("خطأ في البوت: ", err));
    bot.on("end", () => {
        console.log("انقطع الاتصال، يتم إعادة المحاولة بعد 15 ثانية...[span_22](start_span)[span_22](end_span)");
        setTimeout(createBot, 15000);
    });
}

createBot();
