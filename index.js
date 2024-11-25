import express, { json } from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

// Access environment variables
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const siteUrl = process.env.SITE_URL;

const port = process.env.PORT || 3001;

app.get("/getCoupon", async (req, res) => {
  // Define prizes and probabilities
  const prizes = [
    // Tier 1
    {
      name: "30% off 2-Step Challenge",
      probability: 1,
      discountName: "Challenge",
      discountType: "percent",
      discountAmount: 30,
      productId: 846,
    },
    // Tier 2
    {
      name: "25% off 2-Step Challenge",
      probability: 2,
      discountType: "percent",
      discountName: "Challenge",
      discountAmount: 25,
      productId: 846,
    },
    // Tier 3
    {
      name: "20% off 2-Step Challenge",
      probability: 7,
      discountType: "percent",
      discountName: "Challenge",
      discountAmount: 20,
      productId: 846,
    },
    // Tier 4
    {
      name: "15% off 2-Step Challenge",
      probability: 10,
      discountType: "percent",
      discountName: "Challenge",
      discountAmount: 15,
      productId: 846,
    },
    {
      name: "15% off 1-Step Algo",
      probability: 10,
      discountType: "percent",
      discountName: "Algo",
      discountAmount: 15,
      productId: 853,
    },
    // Tier 5
    {
      name: "15% off 1-Step Standard",
      probability: 20,
      discountType: "percent",
      discountName: "Standard",
      discountAmount: 15,
      productId: 830,
    },
    {
      name: "12.5% off 1-Step Algo",
      probability: 20,
      discountType: "percent",
      discountName: "Algo",
      discountAmount: 12.5,
      productId: 853,
    },
    // Tier 6
    {
      name: "10% off 1-Step Algo",
      probability: 30,
      discountType: "percent",
      discountName: "Algo",
      discountAmount: 10,
      productId: 853,
    },
    {
      name: "10% off 1-Step Standard",
      probability: 30,
      discountType: "percent",
      discountName: "Standard",
      discountAmount: 10,
      productId: 830,
    },
  ];

  // Helper function to select a prize based on probability
  const selectPrize = () => {
    const totalProbability = prizes.reduce(
      (sum, prize) => sum + prize.probability,
      0
    );

    const randomMath = Math.random();
    const random = randomMath * totalProbability;
    let cumulative = 0;
    for (const prize of prizes) {
      cumulative += prize.probability;

      if (random < cumulative) return prize;
    }
  };

  const selectedPrize = selectPrize();

  // Generate a unique coupon code
  // const generateUniqueCode = () =>
  //   `COUPON_${Date.now()}_${Math.random()
  //     .toString(36)
  //     .substr(2, 5)
  //     .toUpperCase()}`;
  // const couponCode = generateUniqueCode();

  const couponCode = `${selectedPrize.discountAmount?.toString()}_${
    selectedPrize.discountName
  }_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  // Coupon data payload
  const couponData = {
    code: couponCode,
    discount_type: selectedPrize.discountType,
    amount: selectedPrize.discountAmount?.toString() || 0, // If no discount amount, it's a free product
    product_ids: [selectedPrize.productId],
    individual_use: true,
    usage_limit: 1,
    usage_limit_per_user: 1,
    name: selectedPrize.name,
    expiry_date: "2024-12-31",
  };

  // res.status(200).json({
  //   couponData,
  // });

  try {
    // Send request to WooCommerce REST API
    const response = await fetch(`${siteUrl}/wp-json/wc/v3/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${consumerKey}:${consumerSecret}`
        ).toString("base64")}`,
      },
      body: JSON.stringify(couponData),
    });

    // Handle response
    if (response.ok) {
      const responseData = await response.json();
      res.status(200).json({
        success: true,
        prize: selectedPrize.name,
        coupon: responseData.code,
      });
    } else {
      const errorData = await response.json();
      res.status(400).json({
        success: false,
        error: errorData,
      });
    }
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating coupon.",
    });
  }
});

app.listen(process.env.PORT || 3001, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );

  const port = this.address().port;
  const mode = app.settings.env;
  const host = `http://localhost:${port}`; // Replace with your host if not localhost

  // Logging the full URL
  console.log(`Express server listening on: ${host}`);
});
