const mineflayer = require("mineflayer");

const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "AFKBot_04",
    password: "mmmnnn"
};

function createBot() {
    console.log(`Connecting to ${config.host}...`);
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: false
    });

    bot.on("spawn", () => {
        console.log("✅ Bot joined successfully!");
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            setTimeout(() => bot.chat(`/login ${config.password}`), 1000);
        }, 3000);
    });

    bot.on("end", () => {
        console.log("Disconnected. Reconnecting in 10s...");
        setTimeout(createBot, 10000);
    });

    bot.on("error", (err) => console.log("Error: " + err.message));
}

createBot();
