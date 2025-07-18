import { addMacBinding } from "./routergateway.js";
import { getUser } from "./usertelegram.js";

export const macbinding = (bot) => {
  const userStates = {};

  bot.onText(/\/macbind/, async (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name || "Teman";
    const user = await getUser(chatId);
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
    } else if (user.exist === true && user.user.rule === "admin") {
      userStates[chatId] = { step: "ask_mac", data: {} };
      bot.sendMessage(
        chatId,
        "Masukkan mac address format(XX:XX:XX:XX:XX:XX):"
      );
    }
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    // Abaikan jika belum mulai dengan /start
    if (!userStates[chatId]) return;

    const state = userStates[chatId];

    switch (state.step) {
      case "ask_mac":
        state.data.mac = text;
        state.step = "done";
        const datamac = {
          mac: text,
          type: "bypassed",
          comment: `From telegram by ${msg.chat.first_name}`,
        };
        delete userStates[chatId];
        // const summary = `
        //     ✅ *Mac Add yang diinput:*
        //     🏢 Mac Add: ${state.data.mac}
        // `;
        // bot.sendMessage(chatId, summary, { parse_mode: "Markdown" });

        const macbinding = await addMacBinding(datamac);
        // console.log(macbinding);
        bot.sendMessage(chatId, macbinding.msg);
        break;

      default:
        bot.sendMessage(
          chatId,
          "Silakan mulai dengan perintah /macbind untuk mac binding."
        );
    }
  });

  bot.on("polling_error", (error) => {
    console.log(`[polling_error] ${error.code}: ${error.message}`);
  });
};
