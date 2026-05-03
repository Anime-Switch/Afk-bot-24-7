const mineflayer = require("mineflayer");
const http = require("http");

// خادم ويب وهمي لمنع توقف الخدمة في Render
http.createServer((req, res) => {
    res.write("Bot is Live!");
    res.end();
}).listen(process.env.PORT || 10000);

const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "AFKBot_04",
    password: "mmmnnn"
};

function createBot() {
    console.log("[bot] Connecting to " + config.host);
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: false
    });

    bot.on("spawn", () => {
        console.log("✅ Joined Successfully!");
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            setTimeout(() => bot.chat(`/login ${config.password}`), 1000);
        }, 3000);
    });

    bot.on("end", () => {
        console.log("Disconnected. Rejoining in 15s...");
        setTimeout(createBot, 15000);
    });

    bot.on("error", (err) => console.log("Error: " + err.message));
}

createBot();
