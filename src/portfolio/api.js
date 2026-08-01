const axios = require("axios");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

const jar = new CookieJar();

const api = wrapper(
  axios.create({
    baseURL: "https://portify-backend-5xiz.onrender.com/api/admin",
    timeout: 120000,
    jar,
    withCredentials: true,
  })
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("\n========== API ERROR ==========");
    console.error(
      "Request:",
      error.config?.method?.toUpperCase(),
      error.config?.url
    );
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    console.error("===============================\n");

    return Promise.reject(error);
  }
);

module.exports = api;