import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";
import convertGifToJpg from "./gif2jpg.js";

async function downloadCSV(url, filename) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
  });

  const filePath = path.resolve(__dirname, filename);
  const writer = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
}

async function addMacBinding(data) {
  const url = "http://localhost/telegram/mac/binding";
  try {
    const response = await axios.post(url, data);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);
  }
}

async function parseHtmlFromUrl(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;

    // Simpan untuk dicek manual kalau perlu
    // fs.writeFileSync("dump.html", html);

    const $ = cheerio.load(html);
    const boxCount = $(".box").length;
    // console.log(`Jumlah .box ditemukan: ${boxCount}`);

    const results = [];

    $(".box").each((i, el) => {
      const h3Text = $(el).find("h3").text().trim().replace(/"/g, "");
      const category = h3Text.split(" ")[0]; // "Daily", "Weekly", ...
      const img = $(el).find("img").attr("src") || "";
      const description = $(el).find("p").text().trim().replace(/\s+/g, " ");

      // Ekstrak angka menggunakan RegEx
      const maxIn = parseFloat(
        description.match(/Max In: ([\d.]+)Mb/)?.[1] || 0
      );
      const averageIn = parseFloat(
        description.match(/Average In: ([\d.]+)Mb/)?.[1] || 0
      );
      const currentIn = parseFloat(
        description.match(/Current In: ([\d.]+)Mb/)?.[1] || 0
      );

      const maxOut = parseFloat(
        description.match(/Max Out: ([\d.]+)Mb/)?.[1] || 0
      );
      const averageOut = parseFloat(
        description.match(/Average Out: ([\d.]+)Mb/)?.[1] || 0
      );
      const currentOut = parseFloat(
        description.match(/Current Out: ([\d.]+)Mb/)?.[1] || 0
      );

      results.push({
        category,
        title: h3Text,
        image: img,
        data: {
          maxIn,
          averageIn,
          currentIn,
          maxOut,
          averageOut,
          currentOut,
        },
      });
    });
    return results;
    // console.log("Hasil parsing:", JSON.stringify(results[0], null, 2));
  } catch (error) {
    console.error("Gagal mengambil HTML:", error.message);
  }
}

/** iface = wan/guest eth = ethernet category = dayly, weekly .. bo = bot telegram*/
async function getTraffic(bo, chat_id, iface, eth, category) {
  const url = "http://localhost/traffic/get/" + iface;
  const data_traffic = await parseHtmlFromUrl(url);
  const message = `<b>Traffic ${iface}</b>\n<b>${data_traffic[category].title}</b>
      <i>Max In: ${data_traffic[category].data.maxIn}Mb Average In: ${data_traffic[category].data.averageIn}Mb Current In: ${data_traffic[category].data.currentIn}Mb</i>
      <i>Max Out: ${data_traffic[category].data.maxOut}Mb Average Out: ${data_traffic[category].data.averageOut}Mb Current Out: ${data_traffic[category].data.currentOut}Mb</i>
      `;
  const img_traffic = data_traffic[category].image;

  const img_url =
    "http://222.165.249.230/graphs/iface/" + eth + "/" + img_traffic;

  await convertGifToJpg(img_url, "output.jpg");
  const img = "output.jpg";
  /** kirim pesan ke telegram */
  bo.sendPhoto(chat_id, img, {
    caption: `${message}`,
    parse_mode: "HTML",
  });
}

async function menuWanTraffic(bot, id) {
  const menu = [
    [
      { text: "Traffic Daily", callback_data: "wan_daily" },
      { text: "Traffic Weekly", callback_data: "wan_weekly" },
    ],
    [
      { text: "Traffic Monthly", callback_data: "wan_monthly" },
      { text: "Traffic Yearly", callback_data: "wan_yearly" },
    ],
  ];

  bot.sendMessage(id, `Menu Traffic Wan`, {
    reply_markup: {
      inline_keyboard: menu,
    },
  });
}
export {
  downloadCSV,
  addMacBinding,
  parseHtmlFromUrl,
  getTraffic,
  menuWanTraffic,
};
