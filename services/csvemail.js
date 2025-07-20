import { getUser, getToken, downloadGuestsFile } from "./usertelegram.js";
import fs from "fs";

export const csvEmail = (bot) => {
  const userStates = {};
  bot.onText(/\/guest2csv/, async (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name || "Teman";
    const user = await getUser(chatId);
    // console.log(user);
    // bot.sendMessage(chatId, `Hallo ini dari db ${user}`);

    if (user.exist === false && user.user === null) {
      bot.sendMessage(
        chatId,
        `Hallo ${name}\nSelamat userng di SIATA\n(sitem informasi aplikasi telegram)\nAnda belum terdaftar silakan daftar!\nSilakan ketik /start untuk daftar.`
      );
    } else if (user.exist === true && user.user.verified === "0") {
      bot.sendMessage(
        chatId,
        `Hallo ${name}\nSelamat userng di SIATA\n(sitem informasi aplikasi telegram)\nAccount anda masih direview.\nSilakan tunggu confirmasi.`
      );
    } else if (user.exist === true && user.user.role === "admin") {
      bot.sendMessage(chatId, "Proses download sedang dilakukan....");
      try {
        const filePath = await downloadGuestsFile("2024-07-01", "2025-07-30");

        await bot.sendDocument(chatId, filePath, {
          caption: "Berikut file CSV Mac Binding.",
        });

        // Optional: Hapus file setelah dikirim
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Gagal mengunduh atau mengirim file:", error.message);
        bot.sendMessage(chatId, "Gagal mengunduh atau mengirim file.");
      }
    }
  });
};
