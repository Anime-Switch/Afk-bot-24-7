const mineflayer = require("mineflayer");
const http = require("http");

// 1. خادم الويب لـ Railway
http.createServer((req, res) => {
    res.write("AFK Bot: Infinite Walk + Jump + Attack Mode");
    res.end();
}).listen(process.env.PORT || 3000);

const config = {
    host: "MM2BXS3.aternos.me",
    port: 45379,
    username: "AFK_RIO_Bot",
    password: "mmmnnn"
};

const walkTime = 22000; // مدة قطع 100 بلوكة

function createBot() {
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: "1.21.1", 
        checkTimeoutInterval: 60000 
    });

    bot.on("spawn", () => {
        console.log("✅ دخل البوت! يبدأ الآن نظام الهجوم والمشي اللانهائي...");
        
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            setTimeout(() => bot.chat(`/login ${config.password}`), 1500);
            
            // البدء بالأكشن بعد تسجيل الدخول
            setTimeout(() => startInfiniteAction(bot), 5000);
        }, 3000);
    });

    async function startInfiniteAction(bot) {
        while (true) {
            for (let i = 0; i < 4; i++) {
                if (!bot.entity) return;

                bot.setControlState('forward', true);
                console.log(`🏃 الضلع ${i + 1}: مشي + ضرب + قفز عشوائي...`);

                // --- نظام الضرب والقفز المستمر ---
                const actionTimer = setInterval(() => {
                    // يضرب (Left Click)
                    bot.swingArm('left'); 
                    
                    // قفز عشوائي (احتمال 50%)
                    if (Math.random() > 0.5) {
                        bot.setControlState('jump', true);
                        setTimeout(() => bot.setControlState('jump', false), 400);
                    }
                }, 1000); // يكرر الضرب والنط كل ثانية واحدة

                await new Promise(resolve => setTimeout(resolve, walkTime));

                // توقف مؤقت للالتفاف
                clearInterval(actionTimer);
                bot.setControlState('forward', false);
                bot.setControlState('jump', false);
                
                // الالتفاف لليمين
                const yaw = bot.entity.yaw + (Math.PI / 2);
                await bot.look(yaw, 0, true);
                console.log("🔄 التفات لليمين...");
                
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    bot.on("end", (reason) => {
        console.log(`Disconnected: ${reason}. Restarting in 15s...`);
        setTimeout(createBot, 15000);
    });

    bot.on("error", (err) => console.log(`⚠️ Error: ${err.message}`));
}

createBot();
