const http = require('http');

// إنشاء خادم ويب بسيط لإبقاء الاستضافة تعمل مع UptimeRobot
http.createServer((req, res) => {
  res.write("Bot is Online 24/7!");
  res.end();
}).listen(8080);

const mineflayer = require('mineflayer');
const readline = require('readline');

// ===== إعدادات السيرفر الخاصة بك =====
const SERVER_HOST     = 'MM2BXS3.aternos.me';
const SERVER_PORT     = 45379;
const BOT_USERNAME    = 'NoTmeowl1';
const MC_VERSION      = '1.21.1'; // تم تصحيح الإصدار
const DEFAULT_COMMAND = '/register ajjubai94 ajjubai94'; // تسجيل الدخول التلقائي

const ENABLE_RANDOM_CHAT = true; 
const OWNER_NAME      = 'NoTmeowl';
// ============================================

function createBot () {
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_USERNAME,
    version: MC_VERSION,
    auth: 'offline' // ضروري جداً لسيرفرات أترنوس (Cracked)
  });

  // التحكم في البوت من خلال Terminal في Replit
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.on('line', (input) => {
    const msg = input.trim();
    if (msg) bot.chat(msg);
  });

  bot.on('spawn', () => {
    console.log('✅ تم دخول البوت للسيرفر بنجاح!');

    // تنفيذ أمر التسجيل بعد الدخول بـ 3 ثوانٍ
    setTimeout(() => {
      bot.chat(DEFAULT_COMMAND);
      bot.chat('/login ajjubai94'); // تحسباً إذا كان مسجلاً مسبقاً
    }, 3000);

    // حركة عشوائية كل 10 ثوانٍ لمنع الطرد (AFK Kick)
    setInterval(() => {
      const actions = ['jump', 'forward', 'back', 'left', 'right'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      bot.setControlState(randomAction, true);
      setTimeout(() => bot.setControlState(randomAction, false), 1000);
    }, 10000);

    // شات عشوائي إذا كان مفعل
    if (ENABLE_RANDOM_CHAT) {
      setInterval(() => {
        const messages = ['I am AFK', 'Still here!', 'Working 24/7', 'NoTmeowl Bot'];
        bot.chat(messages[Math.floor(Math.random() * messages.length)]);
      }, 60000); // كل دقيقة
    }
  });

  // إدارة الأخطاء وإعادة الاتصال التلقائي
  bot.on('kicked', (reason) => {
    console.log('❌ تم طرد البوت. السبب:', reason);
  });

  bot.on('error', (err) => {
    console.log('⚠️ حدث خطأ في الاتصال:', err.message);
  });

  bot.on('end', () => {
    console.log('🔄 انقطع الاتصال.. سأحاول العودة بعد 10 ثوانٍ');
    setTimeout(createBot, 10000);
  });
}

// تشغيل البوت لأول مرة
createBot();
