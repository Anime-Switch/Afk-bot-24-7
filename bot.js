const mineflayer = require("mineflayer");

// =================== الإعدادات الجديدة ===================
const config = {
  host: "MM2BXS3.aternos.me", // السيرفر الجديد
  port: 45379,                // المنفذ الجديد
  username: "AFKBot_04", 
  password: "mmmnnn",         // كلمة المرور
  version: false,             // فحص تلقائي للإصدار

  jumpInterval: 3000, 
  runInterval: 1000,  
  breakInterval: 6000, 
  breakScanRadius: 4,
  breakOnly: ["dirt", "grass_block", "stone"]
};

let bot;

function createBot() {
  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
  });

  bot.on("login", () => {
    console.log(`[bot] Logged in to ${config.host}`);
    startLogLoop(); 
  });

  bot.on("spawn", () => {
    console.log(`[bot] Player spawned in world`);
    
    // إرسال أوامر التسجيل والدخول تلقائياً
    setTimeout(() => {
        bot.chat(`/register ${config.password} ${config.password}`);
        setTimeout(() => {
            bot.chat(`/login ${config.password}`);
            console.log(`[bot] Auth commands sent.`);
        }, 1000);
    }, 2000);

    startAFK(); 
  });

  bot.on("end", () => {
    console.log("[bot] disconnected, rejoining in 5s...");
    setTimeout(createBot, 5000); // إعادة اتصال تلقائية ليبقى Always Online
  });

  bot.on("error", (err) => console.log("[bot] error:", err));
}

// حلقة رسائل لضمان بقاء خدمة Render نشطة
function startLogLoop() {
  const messages = ["🔥 Bot is active", "⚡ Moving...", "✅ Connection stable"];
  let i = 0;
  setInterval(() => {
    console.log(messages[i]);
    i = (i + 1) % messages.length;
  }, 3000);
}

function startAFK() {
  // القفز
  setInterval(() => {
    if (!bot || !bot.entity) return;
    bot.setControlState("jump", true);
    setTimeout(() => bot.setControlState("jump", false), 200);
  }, config.jumpInterval);

  // الحركة العشوائية
  setInterval(() => {
    if (!bot || !bot.entity) return;
    const directions = ["forward", "back", "left", "right"];
    directions.forEach((d) => bot.setControlState(d, false));
    const dir = directions[Math.floor(Math.random() * directions.length)];
    bot.setControlState(dir, true);
  }, config.runInterval);

  // تكسير بلوكات بسيطة حوله
  setInterval(() => {
    if (!bot || !bot.entity) return;
    tryBreakBlock();
  }, config.breakInterval);
}

function tryBreakBlock() {
  const block = bot.findBlock({
    matching: (b) => {
      if (!b || !b.position) return false;
      if (b.type === 0) return false;
      if (!config.breakOnly.includes(b.name)) return false;
      return bot.entity.position.distanceTo(b.position) <= config.breakScanRadius;
    },
    maxDistance: config.breakScanRadius,
  });
  if (!block) return;
  bot.dig(block).catch(() => {});
}

createBot();
