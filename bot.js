const mineflayer = require("mineflayer");

const config = {
    host: "MM2BXS3.aternos.me", //
    port: 45379,               //
    username: "AFKBot_04",
    password: "mmmnnn"
};

function createBot() {
    console.log(`[Railway] محاولة الاتصال بـ ${config.host}:${config.port}`);
    
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: false // فحص تلقائي للإصدار
    });

    bot.on("spawn", () => {
        console.log("✅ تم الانضمام للسيرفر بنجاح!");
        
        // نظام التسجيل والدخول التلقائي
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            setTimeout(() => bot.chat(`/login ${config.password}`), 1500);
        }, 3000);
        
        // حركة AFK بسيطة لمنع الطرد
        setInterval(() => {
            if (bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 200);
            }
        }, 15000);
    });

    bot.on("end", (reason) => {
        console.log(`انقطع الاتصال: ${reason}. إعادة المحاولة خلال 10 ثوانٍ...`);
        setTimeout(createBot, 10000);
    });

    bot.on("error", (err) => console.log(`⚠️ خطأ: ${err.message}`));
}

createBot();
