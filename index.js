const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const token = "6847760986:AAHrNP1khJI227ZTbrZKM68EOYM_RuKldJs"; // Tokeningizni kiriting

const bot = new TelegramBot(token, { polling: true });

// Guruh chat ID ni o'rnating
const groupChatId = '@sovolar_kelgan_soff_uz_sivolar';  // Guruh chat ID sini shu yerda kiriting

let questionCounter = 0;  // Savollarni hisoblash uchun o'zgaruvchi
const userStates = {};
const questions = {};  // Savollarni saqlash uchun

const bootstrap = () => {
    bot.setMyCommands([
        { command: '/start', description: 'Boshlash' },
        { command: '/help', description: 'Savollaringiz bormi ?' },
        { command: '/dating', description: 'Tanlang' },
    ]);

    bot.on('message', async msg => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text === '/start') {
            await bot.sendMessage(
                chatId,
                "Bizni Soff.uz ga kirish uchun pasdagi tugmani bosing va darmat qiling",
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "Saytni ko'rish",
                                    web_app: {
                                        url: "https://soff.uz/"
                                    }
                                }
                            ]
                        ]
                    }
                }
            );
        } else if (text === '/ishga_tushirish') {
            await bot.sendMessage(
                chatId,
                "Botni ishga tushirissh",
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "tushirish",
                                    web_app: {
                                        url: "https://soff-telegram-web.onrender.com"
                                    }
                                }
                            ]
                        ]
                    }
                }
            );
        } else if (text === '/help') {
            const responseText = "Qanday savolingiz bor?";
            await bot.sendMessage(chatId, responseText);
            userStates[chatId] = 'awaiting_question';  // Foydalanuvchi javobini kutamiz
        } else if (userStates[chatId] === 'awaiting_question') {
            console.log(`Foydalanuvchidan savol: ${text}`);  // Savolni logga chiqarish
            questionCounter++;  // Savolni hisoblash

            // Foydalanuvchining profil havolasini aniqlash
            const username = msg.from.username ? `@${msg.from.username}` : `user${msg.from.id}`;

            // Savolni saqlash
            const questionId = questionCounter;
            questions[questionId] = { chatId, text };

            // Foydalanuvchidan kelgan savolni guruhga yuborish
            await bot.sendMessage(
                groupChatId,
                `Savol #${questionId}\nFoydalanuvchining nomi: ${msg.from.first_name}\nProfil havolasi: ${username}\nFoydalanuvchidan savol: ${text}`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "Javob berish",
                                    callback_data: `answer_${questionId}`
                                }
                            ]
                        ]
                    }
                }
            );

            // Foydalanuvchi javobini qabul qilindi
            await bot.sendMessage(chatId, "Savolingiz qabul qilindi.");

            // Holatni qayta boshlash
            userStates[chatId] = null;
        } else if (text === '/dating') {
            const responseText = "Tanlang:";
            await bot.sendMessage(
                chatId,
                responseText,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Soff.uz nima?", callback_data: 'soff_uz_nima' }],
                            [{ text: "Video qo'llanma", callback_data: 'video_qollanma' }],
                            [{ text: "Sotuvchiga aylaning", callback_data: 'sotuvchiga_aylaning' }],
                            [{ text: "Savol-javoblar", callback_data: 'savol_javoblar' }]
                        ]
                    }
                }
            );
        } else {
            console.log(`Foydalanuvchidan xabar: ${text}`);  // Boshqa xabarlarni logga chiqarish
        }
    });

    bot.on('callback_query', async callbackQuery => {
        const msg = callbackQuery.message;
        const data = callbackQuery.data;

        if (data === 'soff_uz_nima') {
            const responseText = `Soff.uz nima?
Soff.uz - Intellektual mulk marketi, Intellektual mahsulotlarini soting va xarid qiling.

Intellektual mulk - ijodiy aqliy faoliyat mahsuli. Ixtirochilik va mualliflik obʼyekti huquqi majmuiga kiruvchi, fan, adabiyot, sanʼat va ishlab chiqarish sohasida ijodiy faoliyatning boshqa turlari, adabiy, badiiy, ilmiy asarlar, ijrochi aktyorlik sanʼati, jumladan ovoz yozish, radio, televideniye asarlari, kashfiyotlar, ixtirolar, ratsionalizatorlik takliflari, sanoat namunalari, kompyuterlar uchun dasturlar, maʼlumotlar bazasi, nou-xauning ekspert tizimlari, tovar belgilari, firma atamalari va boshqa aqliy mulk obʼyektlariga kiradi.

Endilikda siz Soff Marketi orqali o'z intellektual mulklaringizni joylab daromad topishingiz mumkin.`;

            await bot.sendMessage(msg.chat.id, responseText);
        } else if (data === 'sotuvchiga_aylaning') {
            const textmeniger1 = `Sotuvchiga aylaning`
            const textmeniger2 = `O'z Intellektual mulklaringizni Soff Marketga joylab, daromadga ega bo‘lishingiz uchun Sotuvchi bo'lib ro'yxatdan o'ting! Uning uchun quyidagi 5 qadamni amalga oshiring.`
            const textmeniger3 = `1) Ro'yxatdan o'tish oynasiga o'ting`
            const imageUrl1 = 'https://soff.uz/static/img/soff/soff%20market%20asosiy%20oynasi.png';
            const textmeniger4 = `2) "Sotuvchi" tugmasiga bosing.`
            const imageUrl2 = 'https://soff.uz/static/img/soff/soff%20marketdan%20adminkaga%20kirish%20oynasi.png';
            const textmeniger5 = `3) Maydonlarni to'ldiring, shartlar bilan tanishib chiqganingizdan so'ng "Ro'yxatdan o'tish" tugmasini bosing.`
            const imageUrl3 = `https://soff.uz/static/img/soff/soff%20marketdan%20ro'yxatdan%20o'tish%20oynasi.png`;
            const textmeniger6 = `4) Nomeringiz yoki Pochtangizga yuborilgan tasqilash kodini ko'rsatilgan maydonga kiriting, so'ng "Yuborish" tugamsini bosing.`
            const textmeniger7 = `Agar pochtangizga kod kelmagan bo'lsa, iltimos pochtangizning "Spam" oynasiga o'tib tekshirib ko'ring.`
            const imageUrl4 = `https://soff.uz/static/img/soff/soff%20market%20kod%20tasdiqlash%20oynasi.png`;
            const textmeniger8 = `5) Siz muvaffaqiyatli ro'yxatdan o'tdingiz! Tabriklaymiz! :)`
            const imageUrl5 = `https://soff.uz/static/img/soff/soff%20market%20admin%20oyansi.png`;


            try {
                await bot.sendMessage(msg.chat.id, textmeniger1);
                await bot.sendMessage(msg.chat.id, textmeniger2);
                await bot.sendMessage(msg.chat.id, textmeniger3);
                await bot.sendPhoto(msg.chat.id, imageUrl1);
                await bot.sendMessage(msg.chat.id, textmeniger4);
                await bot.sendPhoto(msg.chat.id, imageUrl2);
                await bot.sendMessage(msg.chat.id, textmeniger5);
                await bot.sendPhoto(msg.chat.id, imageUrl3);
                await bot.sendMessage(msg.chat.id, textmeniger6);
                await bot.sendMessage(msg.chat.id, textmeniger7);
                await bot.sendPhoto(msg.chat.id, imageUrl4);
                await bot.sendMessage(msg.chat.id, textmeniger8);
                await bot.sendPhoto(msg.chat.id, imageUrl5);

            } catch (error) {
                console.error('Xatolik:', error);
                await bot.sendMessage(msg.chat.id, 'Rasim yuborishda xatolik yuz berdi.');
            }
        } else if (data === 'video_qollanma') {
            const videoUrl1 = 'https://youtu.be/R65_8d6ETnA?si=c_BeVqKnZH2_Wlmu,                                       1. Soff.uz - bu qanday startup loyiha?';
            const videoUrl2 = 'https://youtu.be/rwqluwYKEPw?si=Um1guxc_eA1AWJmM,                                       2. Soff.uz platformasidan qanday qilib sotuvchi bo`lib ro`yxatdan o`tish mumkin ? ';
            const videoUrl3 = 'https://youtu.be/VwmlvXKVeGI?si=uOcyQoFAfk00KMa9,                                       3. Soff.uz platformasida sotuvchining barcha funksiyalari bilan qisqacha tanishib chiqmaiz.';
            const videoUrl4 = 'https://youtu.be/eIq-wUHWP_0?si=pevV0JkxPORlQzEN,                                       4. Soff.uz platformasiga qanday qilib o`z mahsulotimni yuklashim mumkin?';

            try {
                // Videoni yuborish
                await bot.sendMessage(msg.chat.id, videoUrl1);
                await bot.sendMessage(msg.chat.id, videoUrl2);
                await bot.sendMessage(msg.chat.id, videoUrl3);
                await bot.sendMessage(msg.chat.id, videoUrl4);

            } catch (error) {
                console.error('Xatolik:', error);
                await bot.sendMessage(msg.chat.id, 'Videoni yuborishda xatolik yuz berdi.');
            }
        } else if (data === 'savol_javoblar') {
            const responseText = "Savol-javoblar bo'limiga xush kelibsiz! Quyidagi bo'limlardan birini tanlang:";
            await bot.sendMessage(
                msg.chat.id,
                responseText,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Savdo", callback_data: 'savdo' }],
                            [{ text: "Umumiy savollar", callback_data: 'umumiy_savollar' }],
                            [{ text: "Ro'yxatdan o'tish bo'yicha", callback_data: 'ro_yxatdan_otish' }]
                        ]
                    }
                }
            );
        } else if (data === 'savdo') {
            await bot.sendMessage(
                msg.chat.id,
                "*Soff Marketda nimalar sotish mumkin*\nSoff Marketi orqali o'z intellektual mulklaringizni joylab daromad topishingiz mumkin. Sizda mavjud bo'lgan taqdimotlar, kurs ishlari, diplom ishlari, dissertatsiya ishlari, kitoblar, biznes rejalar, referatlar, o'quv qo'llanmalar, dars ishlanmalari v.k Soff Marketda bo'lgan barcha kategoriyadagi intellektual mulklaringizni yuklab sotishingiz mumkin!",
                { parse_mode: 'Markdown' }
            );
            await bot.sendMessage(
                msg.chat.id,
                "*Yuklagan mahsulotim, usha zahoti saytda chiqmayapti, nega?*\nSizning yuklagan mahsulotingiz 24 soat ichida saytda paydo bo'ladi. Mahsulot marketda paydo bo'lishida \"Moderatsiya\" statusidan o'tishi kerak. Ya'ni biz Moderatorlarimiz sizning yuklagan mahsulotingiz sotuvga yaroqligi va kamchiliklar yo'qligi tekshiriladi. Hammasi joyida bo'lgandan so'ng Moderator mahsulotingizga \"Tasdiqlangan\" statusini beradi va siz mahsulotingizni marketda ko'rishingiz mumkin bo'ladi. Agar \"Bekor qilingan\" status siz qabul qilsangiz bilingki sizning mahsulotingizda qandaydir kamchilik borligidan dalolat beradi. Bunday vaziyatda mahsulotingizni qayta tahrirlab, yana bir bor yuklab ko'rishingiz mumkin bo'ladi.",
                { parse_mode: 'Markdown' }
            );

        } else if (data === 'umumiy_savollar') {
            await bot.sendMessage(
                msg.chat.id,
                "*Balansimdagi pulni qanday yechib olishim mumkin*\nBalansingizdagi pulni yechib olishingiz uchun \"Arizalar\" bo'limidan ariza jo'natishingiz kerak bo'ladi. Arizangizda siz kartangizni va pul miqdorini kiritishingiz kerak bo'ladi. 24 soat ichida Soff Market Adminlari sizning arizangizda hech qanday kamchiliklar yo'qligida amin bo'lganlaridan so'ng ko'rsatgan pul miqdoringizni o'tkazib beradilar.",
                { parse_mode: 'Markdown' }
            );
        } else if (data === 'ro_yxatdan_otish') {
            await bot.sendMessage(
                msg.chat.id,
                "*Sotuvchi bo'lmoqchiman, qayerdan ro'yxatdan o'tishim kerak?*\n\"Sotuvchiga aylaning\" deb nomlangan menyuni bosing, batafsil ma'lumotni usha yerdan olishingiz mumkin.",
                { parse_mode: 'Markdown' }
            );
        } else if (data.startsWith('answer_')) {
            const questionId = data.split('_')[1];
            const question = questions[questionId];

            if (question) {
                await bot.sendMessage(
                    msg.chat.id,
                    `Savol #${questionId} ga javob yozing:`
                );

                userStates[msg.chat.id] = {
                    state: 'awaiting_answer',
                    questionId
                };
            }
        }
    });

    bot.on('message', async msg => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (userStates[chatId] && userStates[chatId].state === 'awaiting_answer') {
            const questionId = userStates[chatId].questionId;
            const question = questions[questionId];

            if (question) {
                await bot.sendMessage(
                    question.chatId,
                    `Savolingizga javob keldi: ${text}`
                );

                await bot.sendMessage(
                    chatId,
                    `Savol #${questionId} ga javobingiz yuborildi.`
                );

                // Javob berilgandan keyin holatni qayta boshlash
                userStates[chatId] = null;
            }
        }
    });
};

bootstrap();

// Express serverni sozlash
app.get('/', (req, res) => {
    res.send('Telegram bot ishlamoqda');
});

app.listen(port, () => {
    console.log(`Server ${port} portda ishlamoqda`);
});
