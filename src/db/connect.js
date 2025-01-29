import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";
import express from "express";


const app = express();
const connectDB = async ()=>{

    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`monogDB connection established !! DB host: ${connectionInstance.connection.host}`);

    }catch(e){
        console.log("ERROR IS ",e);
        process.exit(1);
    }
}

export default connectDB;