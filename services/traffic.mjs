import axios from "axios";
import * as cheerio from "cheerio";
// import fs from "fs";

const url = "http://localhost/traffic/get/wan";

async function parseHtmlFromUrl() {
  try {
    const response = await axios.get(url, { responseType: "text" });
    const html = response.data.trim();
    const $ = cheerio.load(html);

    const results = [];

    $(".box").each((i, el) => {
      const h3Text = $(el).find("h3").text().trim().replace(/"/g, "");
      const category = h3Text.split(" ")[0];
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

    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Gagal mengambil HTML:", error.message);
  }
}

parseHtmlFromUrl();
