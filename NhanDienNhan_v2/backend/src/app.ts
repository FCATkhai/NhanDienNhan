import express from "express";
import cors from "cors";
import imageRoutes from "./routes/imageRoutes";

const app = express();

app.use(
  cors({
    origin: true, // Cho phép tất cả các origin
    // Chỉ cho phép frontend origin, ai agent origin
    // origin: ["http://localhost:3000", "http://localhost:8000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true, // Cho phép cookies/sessions cross-origin
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Image processing routes
app.use("/api/image", imageRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the Image Analysis API");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

export default app;
