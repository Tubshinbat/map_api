const axios = require("axios");
const { getToken } = require("./qpaytoken");
const QPAY_API_BASE_URL = "https://merchant.qpay.mn/v2";
const QPAY_INVOICE_CODE = "";

const createQPayInvoice = async (order) => {
  const token = await getToken();

  const data = {
    invoice_code: QPAY_INVOICE_CODE,
    sender_invoice_no: order.orderNumber,
    invoice_receiver_code: "RECEIVER_CODE",
    invoice_date: new Date().toISOString(),
    amount: order.amount,
    callback_url: process.env.BASE_URL + "/qpay/callback",
    invoice_description: order.description,
    items: [
      {
        name: order.description,
        quantity: 1,
        unit_price: order.amount,
      },
    ],
  };

  const response = await axios.post(`${QPAY_API_BASE_URL}/invoice`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

module.exports = {
  createQPayInvoice,
};
