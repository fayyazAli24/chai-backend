import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

//app.use() method is used to configure the middleware

// configuring the ip (of the frontend)
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

// limiting the data incoming to 16kb
app.use(express.json({
    limit:"16kb"
}));

// setting up the code to handle the incoming data from url
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}));

// setting up a folder for images in the server
app.use(express.static("public"));

// now setting up the cookie 
app.use(cookieParser());


// routes import 
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"


// routes decleration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/voice",videoRouter)

export { app };