import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";
import express from "express";


const app = express();
const connectDB = async ()=>{

    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`monogDB connection established !! DB host: ${connectionInstance.connection.host}`);

        app.on("error",(error)=>{
            console.log("the error while communicating to the database is ",error);
            throw e;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`);
        })
    }catch(e){
        console.log("ERROR IS ",e);
        process.exit(1);
    }
}

export default connectDB;