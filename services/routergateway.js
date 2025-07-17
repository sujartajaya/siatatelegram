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

export { downloadCSV };
