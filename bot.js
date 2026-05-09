const mineflayer = require("mineflayer");
const Groq = require("groq-sdk");
const http = require("http");
const arabicReshaper = require('arabic-reshaper'); // المكتبة البديلة المضمونة

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

// سيرفر ويب لضمان استمرارية العمل على Railway
http.createServer((req, res) => {
    res.write("Dragon SMP: Secure Bot Online");
    res.end();
}).listen(process.env.PORT || 3000);

const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "RIO_BOT_AFK",
    password: "mmmnnn",
    owners: ["x4tra", ".oma_gamer8309"]
};

function createBot() {
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: "1.21.1"
    });

    // دالة إصلاح اللغة العربية الجديدة (تعالج الحروف المقطعة والمقلوبة)
    function fixArabic(text) {
        try {
            const reshaped = arabicReshaper.reshape(text);
            return reshaped.split('').reverse().join('');
        } catch (e) {
            return text;
        }
    }

    let moveInterval;
    function startAdvancedMovement() {
        let direction = 'forward';
        let distanceTraveled = 0;

        moveInterval = setInterval(() => {
            bot.swingArm('right');
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 200);

            bot.setControlState(direction, true);
            distanceTraveled++;

            if (distanceTraveled >= 60) {
                bot.setControlState(direction, false);
                direction = (direction === 'forward') ? 'back' : 'forward';
                distanceTraveled = 0;
            }
        }, 500);
    }

    bot.on("spawn", () => {
        console.log("🛡️ RIO_BOT المتطور متصل الآن!");
        setTimeout(() => { 
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
            startAdvancedMovement(); 
        }, 3000);
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;
        
        const msg = message.toLowerCase();
        const isOwner = config.owners.includes(username);

        // نظام الحماية من الأوامر لغير الأونر
        if (msg.includes("/") || msg.includes("gamemode") || msg.includes("kick") || msg.includes("op")) {
            if (!isOwner) {
                bot.chat(fixArabic(`يا ${username}، هذي الصلاحيات مخصصة للأونر فقط! ✋`));
                return;
            }
        }

        // تنفيذ الأوامر للأونر فقط
        if (isOwner && message.startsWith("/")) {
            bot.chat(message); 
            return;
        }

        // تفاعل الذكاء الاصطناعي
        if (msg.includes("بوت") || msg.includes("ai") || msg.includes("ريو")) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: "أنت RIO_BOT حارس Dragon SMP. أسلوبك محترم ولطيف." },
                        { role: "user", content: message }
                    ],
                    model: "llama-3.3-70b-versatile",
                });
                const reply = completion.choices[0]?.message?.content || "هلا بك";
                bot.chat(fixArabic(reply.substring(0, 100)));
            } catch (err) {
                bot.chat(fixArabic("هلا بك!"));
            }
        }
    });

    bot.on("error", (err) => console.log("Error: ", err));
    bot.on("end", () => {
        if (moveInterval) clearInterval(moveInterval);
        setTimeout(createBot, 15000);
    });
}

createBot();
