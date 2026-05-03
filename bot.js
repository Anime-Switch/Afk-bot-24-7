const mineflayer = require("mineflayer");
const http = require("http");

// 1. خادم ويب مصغر لإبقاء الخدمة حية في Railway
http.createServer((req, res) => {
    res.write("AFK Bot is Running 24/7");
    res.end();
}).listen(process.env.PORT || 3000);

// 2. إعدادات الاتصال بالسيرفر
const config = {
    host: "MM2BXS3.aternos.me", // عنوان سيرفرك
    port: 45379,               // المنفذ (تأكد منه دائماً من أترنوس)
    username: "AFKBot_04",      // اسم البوت
    password: "mmmnnn"          // كلمة مرور البوت
};

function createBot() {
    console.log(`[Railway] Connecting to ${config.host}:${config.port}...`);
    
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: false, 
        checkTimeoutInterval: 60000 
    });

    // 3. عند الدخول الناجح للسيرفر
    bot.on("spawn", () => {
        console.log("✅ Joined the server successfully!");
        
        // أوامر التسجيل والدخول التلقائي
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            setTimeout(() => bot.chat(`/login ${config.password}`), 1500);
        }, 3000);
        
        // 4. نظام الحركة AFK لمنع الطرد (قفز + حركة جانبية)
        setInterval(() => {
            if (bot.entity) {
                // القفز
                bot.setControlState('jump', true);
                setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500);

                // حركة بسيطة لليمين واليسار
                setTimeout(() => {
                    bot.setControlState('left', true);
                    setTimeout(() => {
                        if (bot.entity) {
                            bot.setControlState('left', false);
                            bot.setControlState('right', true);
                            setTimeout(() => {
                                if (bot.entity) bot.setControlState('right', false);
                            }, 500);
                        }
                    }, 500);
                }, 1000);
            }
        }, 15000); // تكرار الحركة كل 15 ثانية
    });

    // 5. في حال انقطع الاتصال (إعادة محاولة تلقائية)
    bot.on("end", (reason) => {
        console.log(`Disconnected: ${reason}. Reconnecting in 10s...`);
        setTimeout(createBot, 10000);
    });

    // 6. التعامل مع الأخطاء
    bot.on("error", (err) => console.log(`⚠️ Error: ${err.message}`));
}

createBot();
