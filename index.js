
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = "6847760986:AAHrNP1khJI227ZTbrZKM68EOYM_RuKldJs";

const bot = new TelegramBot(token, { polling: true });

// Guruh chat ID ni o'rnating
const groupChatId = '@sovolar_kelgan_soff_uz_sivolar';  // Guruh chat ID sini shu yerda kiriting

let questionCounter = 0;  // Savollarni hisoblash uchun o'zgaruvchi
const userStates = {};
const questions = {};  // Savollarni saqlash uchun

const bootstrap = () => {
    bot.setMyCommands([
        { command: '/start', description: 'Boshlash' },
        { command: '/help', description: 'Savolim bor' },
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
        } else if (data === 'video_qollanma') {
            const imageUrl = 'https://img.youtube.com/vi/eIq-wUHWP_0/0.jpg'; // Videoning thumbnail URL manzili
            const caption = 'Bu rasm sizning tekstingiz bilan birga';

            try {
                await bot.sendPhoto(msg.chat.id, imageUrl, { caption: caption });
            } catch (error) {
                console.error('Xatolik:', error);
                await bot.sendMessage(msg.chat.id, 'Rasmni yuborishda xatolik yuz berdi.');
            }
        } else if (data === 'help') {
            const responseText = "Qanday savolingiz bor?";
            await bot.sendMessage(msg.chat.id, responseText);
            userStates[msg.chat.id] = 'awaiting_question';
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
