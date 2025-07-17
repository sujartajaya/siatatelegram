import axios from "axios";

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

export { getUser, registerUser };
