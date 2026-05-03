const mineflayer = require("mineflayer");

// =================== CONFIG ===================
const config = {
  host: "MM2BXS3.aternos.me", 
  port: 45379, 
  username: "AFKBot_04", 
  password: "mmmnnn", // كلمة المرور التي اخترتها
  version: false, 

  jumpInterval: 3000, 
  runInterval: 1000,  
  breakInterval: 6000, 
  breakScanRadius: 4,
  breakOnly: ["dirt", "grass_block", "stone"],
};

let bot;

function createBot() {
  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
  });

  bot.on("spawn", () => {
    [span_0](start_span)console.log(`[bot] spawned on ${config.host}[span_0](end_span)`);
    
    // إرسال أوامر التسجيل والدخول تلقائياً
    setTimeout(() => {
        // يحاول التسجيل أولاً (في حال كان الحساب جديداً)
        bot.chat(`/register ${config.password} ${config.password}`);
        
        // ثم يحاول تسجيل الدخول بعد ثانية واحدة
        setTimeout(() => {
            bot.chat(`/login ${config.password}`);
            console.log(`[bot] Auth commands sent.`);
        }, 1000);
        
    }, 2000); 

    startAFK();
  });

  bot.on("login", () => {
    [span_1](start_span)console.log(`[bot] Logged in as ${bot.username}[span_1](end_span)`);
    startLogLoop();
  });

  bot.on("end", () => {
    [span_2](start_span)console.log("[bot] disconnected, rejoining in 5s...[span_2](end_span)");
    setTimeout(createBot, 5000); 
  });

  [span_3](start_span)bot.on("error", (err) => console.log("[bot] error:", err)); //[span_3](end_span)
}

[span_4](start_span)// وظيفة الرسائل الدورية لضمان بقاء السكريبت نشطاً[span_4](end_span)
function startLogLoop() {
  const messages = ["🔥 Bot is Active!", "⚡ Stay Always Online...", "✅ Still alive!"]; [span_5](start_span)//[span_5](end_span)
  let i = 0;
  setInterval(() => {
    [span_6](start_span)console.log(messages[i]); //[span_6](end_span)
    i = (i + 1) % messages.length;
  }, 5000);
}

function startAFK() {
  [span_7](start_span)// القفز التلقائي[span_7](end_span)
  setInterval(() => {
    if (!bot || !bot.entity) return;
    bot.setControlState("jump", true);
    setTimeout(() => bot.setControlState("jump", false), 200);
  }, config.jumpInterval);

  [span_8](start_span)// الحركة العشوائية[span_8](end_span)
  setInterval(() => {
    if (!bot || !bot.entity) return;
    const directions = ["forward", "back", "left", "right"];
    directions.forEach((d) => bot.setControlState(d, false));
    const dir = directions[Math.floor(Math.random() * directions.length)];
    bot.setControlState(dir, true);
  }, config.runInterval);

  [span_9](start_span)// تكسير البلوكات[span_9](end_span)
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
      const dist = bot.entity.position.distanceTo(b.position);
      return dist <= config.breakScanRadius;
    },
    maxDistance: config.breakScanRadius,
  });

  if (!block) {
    return; [span_10](start_span)//[span_10](end_span)
  }
  
  bot.dig(block).catch((err) => {}); [span_11](start_span)//[span_11](end_span)
}

createBot();
