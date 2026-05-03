const mineflayer = require("mineflayer");
const http = require("http");

// 1. خادم ويب مصغر لإبقاء Railway نشطاً (لأن Railway يطلب Port حي)
http.createServer((req, res) => {
    res.write("AFK Bot is Online - Sneaking & Jumping");
    res.end();
}).listen(process.env.PORT || 3000);

// 2. بيانات السيرفر (تأكد من الـ Port دائماً من أترنوس)
const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379, // غيره إذا تغير الرقم في أترنوس
    username: "AFKBot_04",
    password: "mmmnnn"
};

function createBot() {
    console.log(`[Railway] Connecting to server...`);
    
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: false, // يكتشف النسخة تلقائياً
        checkTimeoutInterval: 60000 
    });

    // 3. عند الدخول (التسجيل والحركة)
    bot.on("spawn", () => {
        console.log("✅ Joined! Starting Sneak & Jump system...");
        
        // أوامر الدخول التلقائي (AuthMe)
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            setTimeout(() => bot.chat(`/login ${config.password}`), 1500);
        }, 3000);
        
        // 4. الحركة السحرية (يشفت وينط) لمنع الحظر
        setInterval(() => {
            if (bot.entity) {
                // يبدأ يشفت
                bot.setControlState('sneak', true);
                
                setTimeout(() => {
                    // ينط وهو مشفت
                    bot.setControlState('jump', true);
                    
                    setTimeout(() => {
                        bot.setControlState('jump', false);
                        // يفك التشفيت
                        bot.setControlState('sneak', false);
                        
                        // يغير زاوية وجهه بشكل عشوائي (عشان الحماية ما تصيده)
                        const yaw = bot.entity.yaw + (Math.random() * 0.6 - 0.3);
                        bot.look(yaw, 0);
                    }, 500); 
                }, 300);
            }
        }, 10000); // يكرر الحركة كل 10 ثوانٍ
    });

    // 5. إعادة الاتصال التلقائي إذا طُرد أو فصل السيرفر
    bot.on("end", (reason) => {
        console.log(`Disconnected: ${reason}. Reconnecting in 15s...`);
        setTimeout(createBot, 15000);
    });

    bot.on("error", (err) => console.log(`⚠️ Error: ${err.message}`));
}

createBot();
