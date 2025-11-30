import "dotenv/config";

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import profileRoutes from "./routes/profile.route.js"
import cartRoutes from "./routes/cart.route.js"
import checkoutRoutes from "./routes/checkout.route.js"
import ordersRoutes from "./routes/orders.route.js"
import productsRoutes from "./routes/products.route.js"
import sellerRoutes from "./routes/seller.route.js"

const app = express();
const PORT = process.env.PORT;
const CLIENT_ORIGIN = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/checkout", checkoutRoutes);

app.use("/api/orders", ordersRoutes);

app.use("/api/products", productsRoutes);

app.use("/api/seller", sellerRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});


