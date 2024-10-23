require('dotenv').config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000; // You can choose any available port

// Zoho OAuth token endpoint details
const tokenUrl = "https://accounts.zoho.com/oauth/v2/token";
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET_KEY;
const refreshToken = process.env.REFRESH_TOKEN;

console.log(refreshToken,"refreshToken")
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Define the POST route to handle lead submission
app.post("/api/submit-lead", async (req, res) => {
  const { name, phone } = req.body;

  // Prepare data to send to Zoho CRM
  const leadData = {
    data: [
      {
        Last_Name: name,
        Phone: phone,
      },
    ],
  };

  try {
    const params = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    });
    const responseToken = await axios.post(`${tokenUrl}?${params}`);

    // Make a request to Zoho CRM
    const response = await axios.post(
      "https://www.zohoapis.com/crm/v2/Leads",
      leadData,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${responseToken.data.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // If the request is successful, send back the response to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error submitting lead to Zoho:", error);
    // Send an error response to the client
    res
      .status(500)
      .json({ message: "Error submitting lead", error: error.response.data });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
