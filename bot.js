const mineflayer = require("mineflayer");
const Groq = require("groq-sdk");
const http = require("http");
const arabicReshaper = require("arabic-reshaper");

const groq = new Groq({
    apiKey: process.env.GROQ_KEY
});

// =========================
// WEB SERVER
// =========================

http.createServer((req, res) => {
    res.write("RIO BOT ONLINE");
    res.end();
}).listen(process.env.PORT || 3000);

// =========================
// CONFIG
// =========================

const config = {
    host: "ATOMIC_SMPP.aternos.me",
    port: 61003,
    username: "RIO_BOT_AFK",
    password: "mmmnnn"
};

// =========================
// MEMORY
// =========================

const memory = {};

// =========================
// SPAM + MUTE
// =========================

const spamData = {};
const mutedPlayers = {};

// =========================
// BAD WORDS
// =========================

// مسبات قوية = ميوت ساعة
const hardBadWords = [

    "كس",
    "كسمك",
    "كس امك",
    "كس اختك",
    "يلعن دينك",
    "يلعن ربك",
    "شرموطة",
    "قحبة",
    "متناك",
    "نيك",
    "سكس",
    "porn",
    "sex",
    "xnxx",
    "xvideos",
    "xxnx",
    "nude"
];

// مسبات عادية = ميوت 5 دقائق
const normalBadWords = [

    "حمار",
    "كلب",
    "غبي",
    "وصخ",
    "زق",
    "خرا",
    "تفو",
    "عرص",
    "تافه",
    "قذر",
    "احا",
    "shit",
    "fuck",
    "bitch",
    "asshole"
];

// =========================
// FIX ARABIC
// =========================

function fixArabic(text) {

    try {

        const reshaped =
            arabicReshaper.reshape(text);

        return reshaped
            .split("")
            .reverse()
            .join("");

    } catch {

        return text;
    }
}

// =========================
// CREATE BOT
// =========================

function createBot() {

    const bot = mineflayer.createBot({

        host: config.host,
        port: config.port,
        username: config.username,
        version: "1.21.11",
        auth: "offline"
    });

    let movementInterval;

    // =========================
    // MOVEMENT
    // =========================

    function startMovement() {

        if (movementInterval)
            clearInterval(movementInterval);

        movementInterval = setInterval(() => {

            if (!bot.entity) return;

            // حركة
            bot.setControlState("forward", true);
            bot.setControlState("sprint", true);

            // ضرب
            bot.swingArm("right");

            // قفز
            if (Math.random() < 0.35) {

                bot.setControlState("jump", true);

                setTimeout(() => {

                    bot.setControlState("jump", false);

                }, 300);
            }

        }, 700);

        // دوران واقعي
        setInterval(() => {

            if (!bot.entity) return;

            bot.look(
                Math.random() * Math.PI * 2,
                (Math.random() - 0.5) * 0.5,
                true
            );

            // crouch
            bot.setControlState(
                "sneak",
                Math.random() < 0.3
            );

        }, 5000);
    }

    // =========================
    // SPAWN
    // =========================

    bot.on("spawn", () => {

        console.log("✅ BOT CONNECTED");

        setTimeout(() => {

            // دخول
            bot.chat(
                `/register ${config.password} ${config.password}`
            );

            bot.chat(
                `/login ${config.password}`
            );

            startMovement();

        }, 3000);
    });

    // =========================
    // ESCAPE SYSTEM
    // =========================

    bot.on("physicsTick", () => {

        if (!bot.entity) return;

        const player = bot.nearestEntity(entity =>

            entity.type === "player" &&
            entity.username !== bot.username
        );

        if (!player) return;

        const distance =
            bot.entity.position.distanceTo(
                player.position
            );

        // يهرب
        if (distance < 4) {

            bot.setControlState("back", true);
            bot.setControlState("sprint", true);

            setTimeout(() => {

                bot.setControlState("back", false);

            }, 1500);
        }
    });

    // =========================
    // CHAT SYSTEM
    // =========================

    bot.on("chat", async (username, message) => {

        if (username === bot.username)
            return;

        const msg =
            message.toLowerCase().trim();

        // =========================
        // MEMORY
        // =========================

        if (!memory[username]) {
            memory[username] = [];
        }

        memory[username].push(message);

        if (memory[username].length > 10) {
            memory[username].shift();
        }

        // =========================
        // CHECK MUTE
        // =========================

        if (mutedPlayers[username]) {

            if (
                Date.now() <
                mutedPlayers[username]
            ) {
                return;
            }

            delete mutedPlayers[username];
        }

        // =========================
        // CLEAN MESSAGE
        // =========================

        const cleanMsg = msg
            .replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, "")
            .replace(/\s+/g, "");

        // =========================
        // HARD BAD WORDS
        // =========================

        const containsHardBadWord =
            hardBadWords.some(word => {

                const cleanWord =
                    word.replace(/\s+/g, "");

                return cleanMsg.includes(cleanWord);
            });

        if (containsHardBadWord) {

            mutedPlayers[username] =
                Date.now() + (60 * 60 * 1000);

            bot.chat(
                `🔇 ${username} تم إعطاؤك ميوت ساعة بسبب كلام غير لائق`
            );

            return;
        }

        // =========================
        // NORMAL BAD WORDS
        // =========================

        const containsNormalBadWord =
            normalBadWords.some(word => {

                const cleanWord =
                    word.replace(/\s+/g, "");

                return cleanMsg.includes(cleanWord);
            });

        if (containsNormalBadWord) {

            mutedPlayers[username] =
                Date.now() + (5 * 60 * 1000);

            bot.chat(
                `⚠ ${username} تحذير بسبب الألفاظ`
            );

            setTimeout(() => {

                bot.chat(
                    `🔇 ${username} تم إعطاؤك ميوت 5 دقائق`
                );

            }, 1000);

            return;
        }

        // =========================
        // SPAM SYSTEM
        // =========================

        if (!spamData[username]) {

            spamData[username] = {

                messages: [],
                warnings: 0,
                punishedBefore: false
            };
        }

        const data =
            spamData[username];

        data.messages.push({

            text: msg,
            time: Date.now()
        });

        // حذف الرسائل الأقدم من 30 ثانية
        data.messages =
            data.messages.filter(

                m =>
                    Date.now() -
                    m.time <=
                    30000
            );

        // عد التكرار
        const sameMessages =
            data.messages.filter(

                m => m.text === msg
            );

        if (sameMessages.length >= 3) {

            data.messages = [];

            // تحذير أول
            if (data.warnings === 0) {

                data.warnings++;

                bot.chat(
                    `⚠ ${username} هاذي التحذير لك بسبب السبام`
                );

                return;
            }

            // تحذير ثاني
            if (data.warnings === 1) {

                data.warnings++;

                bot.chat(
                    `⚠ ${username} هذا اخر تحذير لك`
                );

                return;
            }

            // ميوت 10 دقائق
            if (!data.punishedBefore) {

                data.punishedBefore = true;

                mutedPlayers[username] =
                    Date.now() +
                    (10 * 60 * 1000);

                bot.chat(
                    `🔇 ${username} تم إعطاؤك ميوت 10 دقائق`
                );

                return;
            }

            // ميوت 30 دقيقة
            mutedPlayers[username] =
                Date.now() +
                (30 * 60 * 1000);

            bot.chat(
                `🔇 ${username} تم إعطاؤك ميوت 30 دقيقة`
            );

            return;
        }

        // =========================
        // BLOCK COMMANDS
        // =========================

        const blockedWords = [

            "/",
            "op",
            "deop",
            "gamemode",
            "ban",
            "kick",
            "tp",
            "execute",
            "sudo",
            "stop",
            "restart"
        ];

        const tryingCommand =
            blockedWords.some(word =>
                msg.includes(word)
            );

        if (tryingCommand) {

            console.log(
                `🚫 BLOCKED COMMAND FROM ${username}`
            );

            return;
        }

        // =========================
        // AI SYSTEM
        // =========================

        if (

            msg.includes("بوت") ||
            msg.includes("ريو") ||
            msg.includes("rio") ||
            msg.includes("ai")

        ) {

            try {

                const previousMessages =
                    memory[username].join("\n");

                const completion =
                    await groq.chat.completions.create({

                        messages: [

                            {
                                role: "system",

                                content:
                                    "أنت RIO_BOT حارس سيرفر ذكي. ممنوع كتابة أو تنفيذ أو شرح أي أوامر ماين كرافت. تكلم بشكل طبيعي وتذكر محادثات اللاعب السابقة."
                            },

                            {
                                role: "user",

                                content:
                                    `محادثات اللاعب السابقة:\n${previousMessages}\n\nرسالة اللاعب الحالية:\n${message}`
                            }
                        ],

                        model:
                            "llama-3.3-70b-versatile"
                    });

                let reply =
                    completion.choices[0]
                        ?.message?.content || "";

                // حماية إضافية
                if (
                    reply.includes("/") ||
                    reply.includes("op") ||
                    reply.includes("gamemode")
                ) {

                    reply =
                        "ما أقدر أساعد بهذا.";
                }

                bot.chat(
                    fixArabic(
                        reply.substring(0, 90)
                    )
                );

            } catch {

                console.log("AI ERROR");
            }
        }
    });

    // =========================
    // AUTO RECONNECT
    // =========================

    function reconnect() {

        console.log(
            "🔄 RECONNECT AFTER 15s"
        );

        if (movementInterval)
            clearInterval(
                movementInterval
            );

        setTimeout(() => {

            createBot();

        }, 15000);
    }

    bot.on("end", reconnect);

    bot.on("kicked", reason => {

        console.log(
            "❌ KICKED:",
            reason
        );

        reconnect();
    });

    bot.on("error", err => {

        console.log(
            "⚠ ERROR:",
            err.message
        );
    });
}

createBot();
