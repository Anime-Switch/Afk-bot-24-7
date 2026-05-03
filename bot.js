const mineflayer = require("mineflayer");

// =================== CONFIG ===================
const config = {
  host: "MM2BXS3.aternos.me",
  port: 45379,
  username: "AFKBot_04",
  password: "mmmnnn", // كلمة المرور الخاصة بك
  version: false, 

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
    [span_2](start_span)console.log(`[bot] Logged in as ${bot.username}`);[span_2](end_span)
    startLogLoop(); 
  });

  bot.on("spawn", () => {
    [span_3](start_span)console.log(`[bot] Player spawned in world`);[span_3](end_span)
    
    // نظام التسجيل والدخول التلقائي
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
    [span_4](start_span)console.log("[bot] disconnected, rejoining in 5s...");[span_4](end_span)
    setTimeout(createBot, 5000); 
  });

  [span_5](start_span)bot.on("error", (err) => console.log("[bot] error:", err));[span_5](end_span)
}

// حلقة الرسائل لضمان بقاء الخدمة نشطة 24/7 على Render
function startLogLoop() {
  [span_6](start_span)const messages = ["🔥 Hello!", "⚡ Running in loop...", "✅ Still alive!"];[span_6](end_span)
  let i = 0;
  setInterval(() => {
    [span_7](start_span)console.log(messages[i]);[span_7](end_span)
    [span_8](start_span)i = (i + 1) % messages.length;[span_8](end_span)
  [span_9](start_span)}, 3000);[span_9](end_span)
}

function startAFK() {
  // القفز التلقائي
  setInterval(() => {
    if (!bot || !bot.entity) return;
    bot.setControlState("jump", true);
    setTimeout(() => bot.setControlState("jump", false), 200);
  }, config.jumpInterval);

  // الحركة العشوائية
  setInterval(() => {
    if (!bot || !bot.entity) return;
    [span_10](start_span)const directions = ["forward", "back", "left", "right"];[span_10](end_span)
    [span_11](start_span)directions.forEach((d) => bot.setControlState(d, false));[span_11](end_span)
    [span_12](start_span)const dir = directions[Math.floor(Math.random() * directions.length)];[span_12](end_span)
    [span_13](start_span)bot.setControlState(dir, true);[span_13](end_span)
  }, config.runInterval);

  // تكسير البلوكات
  setInterval(() => {
    if (!bot || !bot.entity) return;
    [span_14](start_span)tryBreakBlock();[span_14](end_span)
  }, config.breakInterval);
  
  [span_15](start_span)// تم حذف نظام الـ rejoinInterval ليبقى متصلاً Always Online[span_15](end_span)
}

function tryBreakBlock() {
  const block = bot.findBlock({
    matching: (b) => {
      [span_16](start_span)if (!b || !b.position) return false;[span_16](end_span)
      [span_17](start_span)if (b.type === 0) return false;[span_17](end_span)
      [span_18](start_span)if (!config.breakOnly.includes(b.name)) return false;[span_18](end_span)
      [span_19](start_span)return bot.entity.position.distanceTo(b.position) <= config.breakScanRadius;[span_19](end_span)
    },
    maxDistance: config.breakScanRadius,
  });

  [span_20](start_span)if (!block) return;[span_20](end_span)
  bot.dig(block).catch(() => {});
}

createBot();
      
