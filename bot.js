const mineflayer = require("mineflayer");
const http = require("http");

// 1. إنشاء خادم ويب وهمي لإرضاء Render ومنع الـ Timeout
http.createServer((req, res) => {
    res.write("Bot is running!");
    res.end();
}).listen(10000); // Render سيتعرف على هذا المنفذ

const config = {
    host: "MM2BXS3.aternos.me", // استخدم العنوان النصي دائماً
    port: 45379,               // تأكد من تحديث هذا الرقم من أترنوس حالاً
    username: "AFKBot_04",
    password: "mmmnnn"
};

function createBot() {
    console.log("[bot] Attempting to connect to " + config.host);
    
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        hideErrors: true
    });

    bot.on("login", () => {
        console.log("✅ Connected successfully!");
    });

    bot.on("spawn", () => {
        console.log("Joined world. Sending Auth...");
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            setTimeout(() => bot.chat(`/login ${config.password}`), 1500);
        }, 3000);
    });

    bot.on("end", (reason) => {
        console.log("Disconnected. Reconnecting in 15s...");
        setTimeout(createBot, 15000);
    });

    bot.on("error", (err) => {
        console.log("⚠️ Connection Error: " + err.message);
    });
}

createBot();

// حلقة رسائل لمنع Render من إيقاف الخدمة
setInterval(() => {
    console.log("Keep-alive: " + new Date().toISOString());
}, 20000);
