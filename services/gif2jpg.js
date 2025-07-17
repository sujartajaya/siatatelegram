import axios from "axios";
import sharp from "sharp";

async function convertGifToJpg(url, outputPath) {
  try {
    // Unduh file GIF dari URL
    const response = await axios({
      url,
      responseType: "arraybuffer",
    });

    const gifBuffer = Buffer.from(response.data);

    // Konversi ke JPG dengan sharp
    await sharp(gifBuffer, { animated: true }).jpeg().toFile(outputPath);

    console.log(`Konversi selesai! File disimpan di: ${outputPath}`);
  } catch (error) {
    console.error("Terjadi kesalahan saat mengonversi:", error.message);
  }
}

export default convertGifToJpg;
