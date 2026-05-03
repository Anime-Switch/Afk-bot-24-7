const mineflayer = require("mineflayer");

const config = {
  host: "MM2BXS3.aternos.me",
  port: 45379,
  username: "AFKBot_04",
  password: "mmmnnn",
  version: false,
  connectTimeout: 30000, // زيادة وقت انتظار الاتصال لـ 30 ثانية
};

function createBot() {
  console.log("[bot] Attempting to connect...");
  
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    connectTimeout: config.connectTimeout
  });

  bot.on("login", () => {
    console.log(`[bot] Connected to ${config.host}`);
  });

  bot.on("spawn", () => {
    setTimeout(() => {
      bot.chat(`/register ${config.password} ${config.password}`);
      setTimeout(() => bot.chat(`/login ${config.password}`), 1000);
    }, 3000);
  });

  bot.on("end", (reason) => {
    console.log(`[bot] Disconnected: ${reason}. Reconnecting in 10s...`);
    setTimeout(createBot, 10000); // زيادة وقت إعادة المحاولة
  });

  bot.on("error", (err) => {
    if (err.code === 'ETIMEDOUT') {
      console.log("[bot] Error: Connection Timed Out. Is the server Online?");
    } else {
      console.log("[bot] Error:", err.message);
    }
  });
}

createBot();
