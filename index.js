const http = require('http');

// خادم الويب لـ UptimeRobot
http.createServer((req, res) => {
  res.write("Bot Status: Active");
  res.end();
}).listen(8080);

const mineflayer = require('mineflayer');

// ===== إعدادات السيرفر =====
const config = {
  host: 'MM2BXS3.aternos.me',
  port: 45379,          // ⚠️ تأكد أن هذا هو الرقم الحالي في صفحة أترنوس بعد الريستارت
  username: 'AFK_RIO',
  version: '1.21.1',    
  auth: 'offline'       
};

function createBot() {
  const bot = mineflayer.createBot(config);

  bot.on('spawn', () => {
    console.log('✅ تم الاتصال بنجاح! البوت الآن داخل السيرفر.');
    
    // تنفيذ أوامر التسجيل والولوج
    setTimeout(() => {
      bot.chat('/register ajjubai94 ajjubai94');
      bot.chat('/login ajjubai94');
    }, 3000);

    // الحل الجديد: حركة "النظر" فقط لمنع الطرد (تجنب القفز والمشي)
    setInterval(() => {
      const yaw = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * Math.PI;
      bot.look(yaw, pitch, false);
      console.log('🔄 البوت حرك رأسه لتجنب الخمول');
    }, 15000); 
  });

  // طباعة سبب المشكلة بالضبط في الـ Console
  bot.on('kicked', (reason) => {
    console.log('❌ تم الطرد بسبب:', reason);
  });

  bot.on('error', (err) => {
    console.log('⚠️ خطأ في الاتصال:', err.message);
    if(err.message.includes('ECONNREFUSED')) {
      console.log('--- تأكد أن السيرفر يعمل (Online) وأن البورت صحيح في الكود ---');
    }
  });

  bot.on('end', () => {
    console.log('🔄 انقطع الاتصال.. محاولة جديدة بعد 10 ثوانٍ');
    setTimeout(createBot, 10000);
  });
}

createBot();
