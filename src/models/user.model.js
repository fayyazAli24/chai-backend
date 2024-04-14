import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true,
        lowercase:true
    },

    userName:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },

    fullName:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    avatar:{
        type:String, // cloudinary service will be used to store the image
        required:true
    },

    coverImage:{
        type:String
    },

    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],

    password:{
        type:String,
        required:[true, "password is required"]
    },
    refreshToken:{
        type:String
    }

},{timestamps:true})

// pre is a middleware method which does something before saving the data 
userSchema.pre("save", async function(next){
    
    // exceypt the password when password field is change othwewise return
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10);
    next();
})

// checking if the encrypted password is equal to the actual user password
userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password,this.password);
}

// generating access token by injecting a custom method 
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        // payload
        {
            _id:this._id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// generating refresh token by injecting a custom method 
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        // payload
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}   
export const User = mongoose.model("User",userSchema);