const http = require('http');

// خادم الويب لـ UptimeRobot
http.createServer((req, res) => {
  res.write("Bot Status: Active");
  res.end();
}).listen(8080);

const mineflayer = require('mineflayer');

// ===== إعدادات السيرفر (تأكد منها بدقة) =====
const config = {
  host: 'MM2BXS3.aternos.me',
  port: 45379,          // ملاحظة: تأكد أن هذا الرقم هو نفسه الموجود في صفحة أترنوس الآن
  username: 'AFK_RIO',
  version: '1.21.1',    // إذا كان سيرفرك 1.21 فقط، جرب كتابة '1.21'
  auth: 'offline'       // ضروري جداً
};

function createBot() {
  const bot = mineflayer.createBot(config);

  bot.on('spawn', () => {
    console.log('✅ تم الاتصال بنجاح! البوت الآن داخل السيرفر.');
    // أمر التسجيل
    bot.chat('/register ajjubai94 ajjubai94');
    bot.chat('/login ajjubai94');
  });

  // لمنع الطرد بسبب الخمول
  bot.on('login', () => {
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 15000); 
  });

  // طباعة سبب المشكلة بالضبط في الـ Console
  bot.on('kicked', (reason) => {
    console.log('❌ تم الطرد بسبب:', reason);
  });

  bot.on('error', (err) => {
    console.log('⚠️ خطأ في الاتصال:', err.message);
    if(err.message.includes('ECONNREFUSED')) {
      console.log('--- نصيحة: تأكد أن السيرفر يعمل (Online) وأن البورت صحيح ---');
    }
  });

  bot.on('end', () => {
    console.log('🔄 انقطع الاتصال.. محاولة جديدة بعد 10 ثوانٍ');
    setTimeout(createBot, 10000);
  });
}

createBot();
