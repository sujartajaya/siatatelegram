import {
  getUser,
  downloadGuestsFile,
  validateDateRange,
} from "./usertelegram.js";
import fs from "fs";

export const csvEmail = (bot) => {
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
      /** menambahkan user state untuk input */
      const userStates = {};

      userStates[chatId] = { step: "ask_start_date", data: {} };

      bot.sendMessage(chatId, "Masukkan tanggal awal format (YYYY-MM-DD)");

      bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!userStates[chatId]) return;
        const state = userStates[chatId];

        switch (state.step) {
          case "ask_start_date":
            state.data.start_date = text;
            state.step = "ask_end_date";
            bot.sendMessage(
              chatId,
              "Masukkan tanggal akhir format (YYYY-MM-DD)"
            );
            break;
          case "ask_end_date":
            state.data.end_date = text;
            state.step = "done";
            const start_date = state.data.start_date;
            const end_date = state.data.end_date;

            /** lakukan pengecekkan tanggal awal dan tanggal akhir format valid dan tanggal awal lebih kecil dari tanggal akhir */
            const valid_date = validateDateRange(start_date, end_date);
            if (valid_date.valid === true) {
              /** proses download boleh dilakukan */
              bot.sendMessage(
                chatId,
                "Proses download file sedang dilakukan....."
              );
              try {
                const filePath = await downloadGuestsFile(start_date, end_date);
                await bot.sendDocument(chatId, filePath, {
                  caption: "Berikut file CSV guest data.",
                });
                // Optional: Hapus file setelah dikirim
                fs.unlinkSync(filePath);
              } catch (error) {
                console.error(
                  "Gagal mengunduh atau mengirim file:",
                  error.message
                );
                bot.sendMessage(
                  chatId,
                  "Gagal mengunduh atau mengirim file.\nFile tidak bisa dibuat karena kosong.\n/start - untuk menampilkan menu awal.\n/guest2csv  - untuk download file guest`"
                );
              }
            } else {
              bot.sendMessage(
                chatId,
                `Data tanggal yang diinput:\n${valid_date.message}\n/start - untuk menampilkan menu awal.\n/guest2csv  - untuk download file guest`
              );
            }
            delete userStates[chatId];
            break;
          default:
            bot.sendMessage(
              chatId,
              "Silakan mulai dengan perintah /start untuk mac binding."
            );
            break;
        }
      });
      bot.on("polling_error", (error) => {
        console.log(`[polling_error] ${error.code}: ${error.message}`);
      });
    } else {
      bot.sendMessage(
        chatId,
        `Maaf ${name} anda tidak bisa melakukan permintaan ini hubungi admin.\n/start  - untuk menampilkan menu.`
      );
    }
  });
};
