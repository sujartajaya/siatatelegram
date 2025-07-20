import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

async function getUser(id) {
  const url = "http://localhost/telegram/" + id;
  try {
    const response = await axios({
      url,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Terjadi kesalahan saat mengonversi:", error.message);
  }
}

async function registerUser(data) {
  const url = "http://localhost/telegram/user";
  try {
    const response = await axios.post(url, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);
  }
}

async function getToken() {
  const url = "http://localhost/token";
  try {
    const response = await axios.get(url);
    console.log(`Ini sessionnya = ${response.data}`);
    return response.data;
  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);
  }
}

async function downloadGuestsFile(start_date, end_date) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  try {
    const response = await axios.post(
      "http://localhost/telegram/csv/email",
      {
        start_date: start_date,
        end_date: end_date,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "stream", // ini penting untuk download file
      }
    );

    // Tentukan nama file dan path
    const outputFilePath = path.resolve(__dirname, "guestsdata.csv"); // ganti sesuai kebutuhan

    // Pipe response ke file
    const writer = fs.createWriteStream(outputFilePath);

    // response.data.pipe(writer);

    // writer.on("finish", () => {
    //   console.log("✅ File berhasil diunduh dan disimpan:", outputFilePath);
    // });

    // writer.on("error", (err) => {
    //   console.error("❌ Gagal menulis file:", err.message);
    // });

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on("finish", () => resolve(outputFilePath));
      writer.on("error", reject);
    });
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.error(
        `❌ Bad Request: ${JSON.stringify(error.response, null, 2)}`
      );
      // console.error("Pesan:", error.response.data);
    } else {
      console.error("❌ Terjadi kesalahan:", error.message);
    }
  }
}

export { getUser, registerUser, getToken, downloadGuestsFile };
