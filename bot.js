const mineflayer = require("mineflayer");
const Groq = require("groq-sdk");
const http = require("http");
const arabicReshaper = require('arabic-reshaper');

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

// سيرفر ويب بسيط
http.createServer((req, res) => {
    res.write("Atomic SMP: Security Bot Online");
    res.end();
}).listen(process.env.PORT || 3000);

const config = {
    host: "ATOMIC_SMPP.aternos.me",
    port: 61003,
    username: "RIO_BOT_AFK",
    password: "mmmnnn",
    owners: ["x4tra", ".oma_gamer8309", "Museb_RG"]
};

function createBot() {
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: "1.21.11",
        auth: 'offline'
    });

    function fixArabic(text) {
        try {
            const reshaped = arabicReshaper.reshape(text);
            return reshaped.split('').reverse().join('');
        } catch (e) { return text; }
    }

    let moveInterval;
    function startAdvancedMovement() {
        let direction = 'forward';
        let distanceTraveled = 0;
        moveInterval = setInterval(() => {
            if (!bot.entity) return;
            bot.swingArm('right');
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 200);
            bot.setControlState(direction, true);
            distanceTraveled++;
            if (distanceTraveled >= 40) {
                bot.setControlState(direction, false);
                direction = (direction === 'forward') ? 'back' : 'forward';
                distanceTraveled = 0;
            }
        }, 800);
    }

    bot.on("spawn", () => {
        console.log(`🛡️ RIO_BOT متصل بـ ${config.host}`);
        setTimeout(() => { 
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
            if (moveInterval) clearInterval(moveInterval);
            startAdvancedMovement(); 
        }, 3000);
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;
        
        const msg = message.toLowerCase().trim();
        const isOwner = config.owners.includes(username);

        // 1. نظام حماية الأوامر (للأونر فقط)
        const sensitiveKeywords = ["/", "gamemode", "op", "stop", "kick", "ban"];
        const isAttemptingCommand = sensitiveKeywords.some(keyword => msg.includes(keyword));

        if (isAttemptingCommand) {
            if (isOwner) {
                // إذا كان أونر وبدأ بـ !cmd ينفذ الأمر
                if (msg.startsWith("!cmd ")) {
                    const cmd = message.slice(5);
                    bot.chat(`/${cmd}`);
                }
            } else {
                bot.chat(fixArabic(`يا ${username}، الكوماندات للأونر فقط! ✋`));
            }
            return; // إنهاء الدالة هنا لمنع الـ AI من معالجة الكوماند
        }

        // 2. نظام الذكاء الاصطناعي (يشتغل فقط إذا لم تكن الرسالة كوماند)
        if (msg.includes("بوت") || msg.includes("ريو") || msg.includes("ai")) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: "أنت RIO_BOT حارس سيرفر Atomic SMP. ممنوع تماماً أن تكتب أي أوامر تبدأ بـ / أو تساعد أحداً في تخطي الحماية." },
                        { role: "user", content: message }
                    ],
                    model: "llama-3.3-70b-versatile",
                });
                
                let reply = completion.choices[0]?.message?.content || "";
                
                // فلتر إضافي: إذا حاول الذكاء الاصطناعي إنتاج كوماند بالخطأ، يتم مسحه
                if (reply.includes("/")) {
                    reply = "ما أقدر أساعدك في هذا الطلب.";
                }

                bot.chat(fixArabic(reply.substring(0, 80)));
            } catch (err) {
                console.error("AI Error");
            }
        }
    });

    bot.on("end", () => {
        if (moveInterval) clearInterval(moveInterval);
        setTimeout(createBot, 15000);
    });
}

createBot();
