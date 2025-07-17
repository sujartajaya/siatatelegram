import TelegramBot from "node-telegram-bot-api";
import convertGifToJpg from "./services/gif2jpg.js";

const token = "6528575565:AAESksJ7VohEb1gq9hBUCVH45CLYtvrM6Eo";

const bot = new TelegramBot(token, { polling: true });

const menu1 = [
  [{ text: "Traffic Wan", callback_data: "waniface" }],
  [{ text: "Traffic WiFi", callback_data: "wifiiface" }],
];

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || "Teman";

  bot.sendMessage(
    chatId,
    `Hallo ${name}\nSelamat datang di SIATA (sitem informasi aplikasi telegram)`,
    {
      reply_markup: {
        inline_keyboard: menu1,
      },
    }
  );
});

bot.on("callback_query", async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  if (data === "waniface") {
    await convertGifToJpg(
      "http://222.165.249.230/graphs/iface/ether1/daily.gif",
      "output.jpg"
    );
    const waniface = "output.jpg";

    bot.sendPhoto(msg.chat.id, waniface, {
      caption: "Traffic Interface WAN.",
    });
  }

  if (data === "wifiiface") {
    await convertGifToJpg(
      "http://222.165.249.230/graphs/iface/VLAN%2D50/daily.gif",
      "output.jpg"
    );
    const waniface = "output.jpg";

    bot.sendPhoto(msg.chat.id, waniface, {
      caption: "Traffic Interface LAN WIFI.",
    });
  }

  bot.answerCallbackQuery(callbackQuery.id);
});
