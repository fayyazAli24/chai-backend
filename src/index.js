import dotenv from "dotenv";
import connectDB from "./db/connect.js"
import { app } from "./app.js";

dotenv.config(
    {
        path:"./env"
    }
)

connectDB()
.then(()=>{
    app.on("ERROR", ()=>{
        console.log("error occured while communicating with server in app.on method in index.js");
    })

    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is running ${process.env.PORT}`);
    });
})
.catch((error)=>{
    console.log("MONGO_DB connection failed in index.js",error);
});