// ============================================================
//  AFK Bot — Mineflayer  |  Rewritten Clean Version
//  نسخة محسّنة ونظيفة من بوت AFK لـ Minecraft
// ============================================================

const mineflayer = require("mineflayer");

// =================== CONFIG ===================
const config = {
  host: "MM2BXS3.aternos.me",
  port: 45379,
  username: "AFKBot_RIO",
  version: false, // auto-detect

  // AFK Behavior
  jumpInterval:   3000,  // ms بين كل قفزة
  moveInterval:   1500,  // ms بين كل تغيير اتجاه
  breakInterval:  8000,  // ms بين كل محاولة كسر بلوك
  breakRadius:    4,     // نصف قطر البحث عن البلوكات
  breakOnly: ["dirt", "grass_block", "stone", "sand", "gravel"],

  // Auth (AuthMe plugin)
  password:       "mmmnnn",
  authDelay:      2000,  // انتظر قبل إرسال /register و /login

  // Reconnect
  reconnectDelay: 5000,
  maxRetries:     0,
};
// ==============================================

let bot = null;
let intervals = [];
let retryCount = 0;
let isConnecting = false;

// ─── Logger ───────────────────────────────────
const log = {
  info:  (msg) => console.log(`\x1b[36m[INFO]\x1b[0m  ${timestamp()} ${msg}`),
  ok:    (msg) => console.log(`\x1b[32m[OK]\x1b[0m    ${timestamp()} ${msg}`),
  warn:  (msg) => console.log(`\x1b[33m[WARN]\x1b[0m  ${timestamp()} ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${timestamp()} ${msg}`),
};

function timestamp() {
  return new Date().toLocaleTimeString("en-GB");
}

// ─── Clear All Intervals ──────────────────────
function clearIntervals() {
  intervals.forEach(clearInterval);
  intervals = [];
}

// ─── Create Bot ───────────────────────────────
function createBot() {
  if (isConnecting) return;
  isConnecting = true;

  log.info(`Connecting to ${config.host}:${config.port} as "${config.username}"...`);

  bot = mineflayer.createBot({
    host:     config.host,
    port:     config.port,
    username: config.username,
    version:  config.version,
  });

  // ── Events ──
  bot.once("spawn", () => {
    isConnecting = false;
    retryCount = 0;
    log.ok(`Spawned as ${bot.username}`);

    const pass = config.password;
    const registerCmd = `/register ${pass} ${pass}`;
    const loginCmd    = `/login ${pass}`;

    setTimeout(() => {
      bot.chat(registerCmd);
      log.info("Sent: " + registerCmd);

      setTimeout(() => {
        bot.chat(loginCmd);
        log.info("Sent: " + loginCmd);

        setTimeout(startAFK, 1500);
      }, 1500);
    }, config.authDelay);
  });

  bot.on("kicked", (reason) => {
    log.warn(`Kicked: ${reason}`);
  });

  bot.on("error", (err) => {
    // تجاهل أخطاء ECONNRESET الشائعة في Aternos
    if (err.code !== "ECONNRESET") {
      log.error(`Error: ${err.message}`);
    }
  });

  bot.on("end", () => {
    isConnecting = false;
    clearIntervals();
    log.warn("Disconnected.");
    scheduleReconnect();
  });
}

// ─── Reconnect ────────────────────────────────
function scheduleReconnect() {
  retryCount++;
  if (config.maxRetries > 0 && retryCount > config.maxRetries) {
    log.error(`Max retries (${config.maxRetries}) reached. Stopping.`);
    process.exit(1);
  }

  log.info(`Reconnecting in ${config.reconnectDelay / 1000}s... (attempt #${retryCount})`);
  setTimeout(createBot, config.reconnectDelay);
}

// ─── AFK Logic ────────────────────────────────
function startAFK() {
  log.info("AFK behaviors started.");

  // 1. Jump loop
  const jumpLoop = setInterval(() => {
    if (!isAlive()) return;
    bot.setControlState("jump", true);
    setTimeout(() => {
      if (bot && bot.entity) bot.setControlState("jump", false);
    }, 250);
  }, config.jumpInterval);

  // 2. Random movement loop
  const moveLoop = setInterval(() => {
    if (!isAlive()) return;
    const dirs = ["forward", "back", "left", "right"];
    dirs.forEach((d) => bot.setControlState(d, false));
    const picked = dirs[Math.floor(Math.random() * dirs.length)];
    bot.setControlState(picked, true);
    log.info(`Moving: ${picked}`);
  }, config.moveInterval);

  // 3. Block break loop
  const breakLoop = setInterval(() => {
    if (!isAlive()) return;
    tryBreakBlock();
  }, config.breakInterval);

  intervals.push(jumpLoop, moveLoop, breakLoop);
}

// ─── isAlive check ────────────────────────────
function isAlive() {
  return bot && bot.entity && bot.health > 0;
}

// ─── Break Block ──────────────────────────────
function tryBreakBlock() {
  const block = bot.findBlock({
    matching: (b) => {
      if (!b || !b.position || b.type === 0) return false;
      if (!config.breakOnly.includes(b.name)) return false;
      return bot.entity.position.distanceTo(b.position) <= config.breakRadius;
    },
    maxDistance: config.breakRadius,
  });

  if (!block) {
    log.info("No breakable block nearby.");
    return;
  }

  log.info(`Breaking: ${block.name} @ ${block.position}`);
  bot.dig(block).catch((err) => log.warn(`Dig failed: ${err.message}`));
}

// ─── Start ────────────────────────────────────
createBot();
