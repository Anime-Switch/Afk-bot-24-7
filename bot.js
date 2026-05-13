process.setMaxListeners(20);

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
const spamData = {};
const mutedPlayers = {};

let reconnecting = false;

// =========================
// BAD WORDS
// =========================

const hardBadWords = [

    "كس",
    "كسمك",
    "كس امك",
    "يلعن دينك",
    "شرموطة",
    "قحبة",
    "نيك",
    "سكس",
    "porn",
    "sex",
    "xnxx",
    "xvideos"
];

const normalBadWords = [

    "حمار",
    "كلب",
    "غبي",
    "وصخ",
    "زق",
    "خرا",
    "تفو",
    "قذر",
    "shit",
    "fuck"
];

// =========================
// JOKES
// =========================

const jokes = [

    "مرة مدرس علوم خلف توأم سماهم موجب وسالب 😂",
    "مرة واحد اشترى قلم رصاص كتب المستقبل 😂",
    "مرة دجاجة دخلت مطعم طلبت بيض 😂",
    "مرة واحد فتح الباب للهواء دخل البرد 😂",
    "مرة واحد دخل امتحان رياضيات حسب عمره بالغلط 😂",
    "مرة قطة نجحت بالمدرسة لأنها تركز عالسبورة 😂",
    "مرة واحد أكل ساعة صار وقته ثمين 😂",
    "مرة واحد راح السوق اشترى كيس ورجع 😂",
    "مرة واحد نام متأخر صحي مبارح 😂",
    "مرة واحد راح الحديقة يدور واي فاي 😂",
    "مرة واحد لعب شطرنج خسر الحصان بالحقيقة 😂",
    "مرة واحد راح الجيم صور المراية ورجع 😂",
    "مرة واحد شرب شاي صار هادي 😂",
    "مرة واحد راح البحر ومعه صابون يغسل الأمواج 😂",
    "مرة واحد اشترى كتاب طبخ أكل الورق 😂",
    "مرة واحد نام بالحصة حلم بالجرس 😂",
    "مرة واحد اشترى سماعة يسمع أفكاره 😂",
    "مرة واحد دخل الامتحان قال للورقة بالتوفيق 😂",
    "مرة واحد راح للبنك يودع نفسه 😂",
    "مرة واحد دخل السينما ومعه مخدة 😂",
    "مرة واحد شرب موية كثيرة صار نبع 😂",
    "مرة واحد اشترى دفتر ونسيه 😂",
    "مرة واحد اشترى آيفون يصور الفاتورة 😂",
    "مرة واحد فتح اللابتوب طلعله واجبات سكره بسرعة 😂",
    "مرة واحد اشترى باب وما لقى جدار 😂",
    "مرة واحد راح للفضاء يسأل عن الواي فاي 😂",
    "مرة واحد دخل المصعد نزل مستواه 😂",
    "مرة واحد اشترى كرسي وقف عليه احترام 😂",
    "مرة واحد شرب قهوة صار سريع جدًا 😂",
    "مرة واحد لعب كرة مع الجدار الجدار فاز 😂"
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

            bot.setControlState(
                "forward",
                true
            );

            bot.setControlState(
                "sprint",
                true
            );

            bot.swingArm("right");

            if (Math.random() < 0.3) {

                bot.setControlState(
                    "jump",
                    true
                );

                setTimeout(() => {

                    bot.setControlState(
                        "jump",
                        false
                    );

                }, 250);
            }

        }, 1000);
    }

    // =========================
    // SPAWN
    // =========================

    bot.on("spawn", () => {

        console.log("✅ BOT CONNECTED");

        reconnecting = false;

        setTimeout(() => {

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

        const player =
            bot.nearestEntity(entity =>

                entity.type === "player" &&
                entity.username !== bot.username
            );

        if (!player) return;

        const distance =
            bot.entity.position.distanceTo(
                player.position
            );

        if (distance < 4) {

            bot.setControlState(
                "back",
                true
            );

            setTimeout(() => {

                bot.setControlState(
                    "back",
                    false
                );

            }, 1000);
        }
    });

    // =========================
    // CHAT
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

        // تقليل استهلاك الرام
        if (memory[username].length > 5) {

            memory[username].shift();
        }

        // =========================
        // CHECK MUTE
        // =========================

        if (mutedPlayers[username]) {

            if (
                Date.now() <
                mutedPlayers[username]
            ) return;

            delete mutedPlayers[username];
        }

        // =========================
        // CLEAN MESSAGE
        // =========================

        const cleanMsg = msg
            .replace(
                /[^a-zA-Z0-9\u0600-\u06FF ]/g,
                ""
            )
            .replace(/\s+/g, "");

        // =========================
        // HARD BAD WORDS
        // =========================

        const hard =
            hardBadWords.some(word =>

                cleanMsg.includes(
                    word.replace(/\s+/g, "")
                )
            );

        if (hard) {

            mutedPlayers[username] =
                Date.now() +
                (60 * 60 * 1000);

            bot.chat(
                `🔇 ${username} تم إعطاؤك ميوت ساعة`
            );

            return;
        }

        // =========================
        // NORMAL BAD WORDS
        // =========================

        const normal =
            normalBadWords.some(word =>

                cleanMsg.includes(
                    word.replace(/\s+/g, "")
                )
            );

        if (normal) {

            mutedPlayers[username] =
                Date.now() +
                (5 * 60 * 1000);

            bot.chat(
                `⚠ ${username} تحذير بسبب الألفاظ`
            );

            setTimeout(() => {

                bot.chat(
                    `🔇 ${username} ميوت 5 دقائق`
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

        data.messages =
            data.messages.filter(

                m =>
                    Date.now() -
                    m.time <=
                    30000
            );

        const sameMessages =
            data.messages.filter(

                m => m.text === msg
            );

        if (sameMessages.length >= 3) {

            data.messages = [];

            if (data.warnings === 0) {

                data.warnings++;

                bot.chat(
                    `⚠ ${username} هذا تحذير بسبب السبام`
                );

                return;
            }

            if (data.warnings === 1) {

                data.warnings++;

                bot.chat(
                    `⚠ ${username} هذا آخر تحذير`
                );

                return;
            }

            if (!data.punishedBefore) {

                data.punishedBefore = true;

                mutedPlayers[username] =
                    Date.now() +
                    (10 * 60 * 1000);

                bot.chat(
                    `🔇 ${username} ميوت 10 دقائق`
                );

                return;
            }

            mutedPlayers[username] =
                Date.now() +
                (30 * 60 * 1000);

            bot.chat(
                `🔇 ${username} ميوت 30 دقيقة`
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
            "stop"
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
        // JOKE COMMAND
        // =========================

        if (msg === "ai نكتة") {

            const joke =
                jokes[
                    Math.floor(
                        Math.random() *
                        jokes.length
                    )
                ];

            bot.chat(joke);

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
                    memory[username]
                        .join("\n");

                const completion =
                    await groq.chat.completions.create({

                        messages: [

                            {
                                role: "system",

                                content:
                                    "أنت RIO_BOT حارس سيرفر ذكي. ممنوع كتابة أوامر ماين كرافت."
                            },

                            {
                                role: "user",

                                content:
                                    `الرسائل السابقة:\n${previousMessages}\n\nالرسالة الحالية:\n${message}`
                            }
                        ],

                        model:
                            "llama-3.3-70b-versatile"
                    });

                let reply =
                    completion.choices[0]
                        ?.message?.content || "";

                if (
                    reply.includes("/") ||
                    reply.includes("op")
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

                console.log(
                    "AI ERROR"
                );
            }
        }
    });

    // =========================
    // RECONNECT
    // =========================

    function reconnect() {

        if (reconnecting) return;

        reconnecting = true;

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
