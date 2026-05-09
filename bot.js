const mineflayer = require("mineflayer");
const Groq = require("groq-sdk");
const http = require("http");
const { reshape } = require('arabic-persian-rescaler');

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

http.createServer((req, res) => {
    res.write("Dragon SMP: Secure Bot with Advanced Movement Online");
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

    function fixArabic(text) {
        return reshape(text);
    }

    // --- نظام الحركة المتقدم (30 بلوكة + ضرب + قفز) ---
    let moveInterval;
    function startAdvancedMovement() {
        let direction = 'forward';
        let distanceTraveled = 0;

        moveInterval = setInterval(() => {
            // 1. الضرب والقفز المستمر
            bot.swingArm('right');
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 200);

            // 2. التحكم في اتجاه المشي (30 بلوكة)
            bot.setControlState(direction, true);
            distanceTraveled++;

            if (distanceTraveled >= 60) { // تقريباً 30 بلوكة بناءً على سرعة التحديث
                bot.setControlState(direction, false);
                direction = (direction === 'forward') ? 'back' : 'forward';
                distanceTraveled = 0;
            }
        }, 500); // تحديث الحركة كل نصف ثانية
    }

    bot.on("spawn", () => {
        console.log("🛡️ RIO_BOT المتطور متصل الآن!");
        setTimeout(() => { 
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
            startAdvancedMovement(); // بدء نظام الحركة والضرب[span_1](start_span)[span_1](end_span)
        }, 3000);
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;
        
        const msg = message.toLowerCase();
        const isOwner = config.owners.includes(username);

        // نظام الحماية من الأوامر[span_2](start_span)[span_2](end_span)
        if (msg.includes("/") || msg.includes("gamemode") || msg.includes("kick") || msg.includes("op")) {
            if (!isOwner) {
                bot.chat(fixArabic(`يا ${username}، هذي الصلاحيات مخصصة للأونر فقط! ✋`));[span_3](start_span)[span_3](end_span)
                return;
            }
        }

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
        clearInterval(moveInterval);
        setTimeout(createBot, 15000);
    });
}

createBot();
