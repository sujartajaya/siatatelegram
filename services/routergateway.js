import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

export { downloadCSV, addMacBinding };
