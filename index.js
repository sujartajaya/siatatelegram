import TelegramBot from "node-telegram-bot-api";
import convertGifToJpg from "./services/gif2jpg.js";
import { getUser, registerUser } from "./services/usertelegram.js";
import { downloadCSV } from "./services/routergateway.js";
import fs from "fs";
import { macbinding } from "./services/macbinding.js";
import { csvEmail } from "./services/csvemail.js";

const token = "6528575565:AAESksJ7VohEb1gq9hBUCVH45CLYtvrM6Eo";

const bot = new TelegramBot(token, { polling: true });

const menu1 = [
  [
    { text: "Traffic Wan", callback_data: "waniface" },
    { text: "Traffic WiFi", callback_data: "wifiiface" },
  ],
  [
    { text: "Traffic BOH", callback_data: "bohiface" },
    { text: "Mac Binding to csv", callback_data: "mac2csv" },
  ],
  [{ text: "User Actives to csv", callback_data: "activesuser2csv" }],
];

const menu2 = [
  [{ text: "Register", callback_data: "register" }],
  [{ text: "Info", callback_data: "info" }],
];

const menu3 = [[{ text: "Info", callback_data: "info" }]];

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || "Teman";

  const data = await getUser(chatId);

  if (data.exist === false && data.user === null) {
    bot.sendMessage(
      chatId,
      `Hallo ${name}\nSelamat datang di SIATA\n(sitem informasi aplikasi telegram)\nAnda belum terdaftar silakan daftar!`,
      {
        reply_markup: {
          inline_keyboard: menu2,
        },
      }
    );
  } else if (data.exist === true && data.user.verified === "0") {
    bot.sendMessage(
      chatId,
      `Hallo ${name}\nSelamat datang di SIATA\n(sitem informasi aplikasi telegram)\nAccount anda masih direview.`,
      {
        reply_markup: {
          inline_keyboard: menu3,
        },
      }
    );
  } else {
    bot.sendMessage(
      chatId,
      `Hallo ${name}\nSelamat datang di SIATA\n(sitem informasi aplikasi telegram)`,
      {
        reply_markup: {
          inline_keyboard: menu1,
        },
      }
    );
  }
});

macbinding(bot);

csvEmail(bot);

bot.on("callback_query", async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  const id = msg.chat.id;
  const first_name = msg.chat.first_name;
  const last_name = msg.chat.last_name;
  const username = msg.chat.username;
  const phone = msg.chat.phone_number;

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
  if (data === "bohiface") {
    await convertGifToJpg(
      "http://222.165.249.230/graphs/iface/bridge%2Dvlan%2D20/daily.gif",
      "output.jpg"
    );
    const waniface = "output.jpg";

    bot.sendPhoto(msg.chat.id, waniface, {
      caption: "Traffic Interface LAN BOH.",
    });
  }

  if (data === "register") {
    const datauser = {
      telegram_id: id,
      first_name: first_name === "undefined" ? "" : first_name,
      last_name: last_name === "undefined" ? "" : last_name,
      username: username,
      phone: phone === "undefined" ? "" : phone,
    };
    // console.log(datauser);
    const reg = await registerUser(datauser);
    console.log(reg);
    bot.sendMessage(
      id,
      `Hallo ${first_name}\nSelamat datang di SIATA\n(sitem informasi aplikasi telegram)\nTerimakasih sudah mendaftar, mohon menunggu konfirmasi dari admin.`
    );
  }

  if (data === "mac2csv") {
    const csvUrl = "http://localhost/telegram/csv/macbinding";
    bot.sendMessage(id, "Mengunduh file CSV...");
    try {
      const filePath = await downloadCSV(csvUrl, "macbinding.csv");

      await bot.sendDocument(id, filePath, {
        caption: "Berikut file CSV Mac Binding.",
      });

      // Optional: Hapus file setelah dikirim
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Gagal mengunduh atau mengirim file:", error.message);
      bot.sendMessage(id, "Gagal mengunduh atau mengirim file.");
    }
  }

  if (data === "activesuser2csv") {
    const csvUrl = "http://localhost/telegram/csv/useractive";
    bot.sendMessage(id, "Mengunduh file CSV...");

    try {
      const filePath = await downloadCSV(csvUrl, "useractives.csv");
      await bot.sendDocument(id, filePath, {
        caption: "Berikut file CSV User Actives.",
      });

      // Optional: Hapus file setelah dikirim
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Gagal mengunduh atau mengirim file:", error.message);
      bot.sendMessage(id, "Gagal mengunduh atau mengirim file.");
    }
  }

  bot.answerCallbackQuery(callbackQuery.id);
});
