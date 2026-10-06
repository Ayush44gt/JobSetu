import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import { errorHandler, notFound } from "./middlewares/error.js";

dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions = {
    origin:(process.env.CLIENT_URL || 'http://localhost:5173').split(","),
    credentials:true
}

app.use(cors(corsOptions));

const PORT = process.env.PORT || 8000;


// api's
app.get("/api/v1/health", (req, res) => res.status(200).json({ success: true, message: "ok" }));
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

app.use(notFound);
app.use(errorHandler);

connectDB()
    .then(() => {
        app.listen(PORT,()=>{
            console.log(`Server running at port ${PORT}`);
        })
    })
    .catch((error) => {
        console.error("Could not connect to MongoDB:", error.message);
        process.exit(1);
    });
