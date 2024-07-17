const axios = require("axios");
const QpayToken = require("../models/QpayToken");
const QPAY_API_BASE_URL = "https://merchant.qpay.mn/v2";

const getToken = async (userId) => {
  const user = await QpayToken.findOne();

  if (!user) throw new Error("Хэрэглэгч олдсонгүй");

  if (user.accessToken && user.tokenExpiresIn > new Date()) {
    return user.accessToken;
  }

  if (user.refreshToken) {
    const newToken = await refreshToken(user.refreshToken, user._id);
    return newToken.accessToken;
  }

  const newToken = await requestNewToken(
    user.username,
    user.password,
    user._id
  );
  return newToken.accessToken;
};

const requestNewToken = async (username, password, id) => {
  const auth =
    "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  const response = await axios.post(
    `${QPAY_API_BASE_URL}/auth/token`,
    {},
    {
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
    }
  );

  const newToken = {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
    tokenExpiresIn: new Date(Date.now() + response.data.expires_in * 1000),
  };

  await QpayToken.findByIdAndUpdate(id, newToken);
  return newToken;
};

const refreshToken = async (refreshToken, id) => {
  const response = await axios.post(`${QPAY_API_BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });

  const newToken = {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
    tokenExpiresIn: new Date(Date.now() + response.data.expires_in * 1000),
  };

  await User.findByIdAndUpdate(id, newToken);
  return newToken;
};

module.exports = {
  getToken,
};
