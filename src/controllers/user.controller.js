import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req, res) => {
  
  // get user detail from frontend
  // validation - empty
  // check if user already exist through email
  // check for images , check for avatar
  // upload them to cloudinary , avatar
  // create user object -create entry in DB
  // remove password and refresh token in user response
  // check for user creation
  // return response



  // getting the parameters from the req body 
  const { userName, email, fullName, password } = req.body;

  console.log("email : ", email);

  // for (const prop in req.body) {
  //   if (Object.hasOwnProperty.call(req.body, prop)) {
  //     const field = req.body[prop].toString().trim();

  //     if (field == "") {
  //       throw new ApiError(400, is`${field} is required`);
  //     }
  //   }
  // }

  // converting them into string
  if([fullName,email,userName,password].some(
      (field) => field?.toString().trim() == ""
  )){
      throw new ApiError(400, is`${field} is required`);
  }

  // checking for existed user if user exists gives error
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email or username already exist");
  }

  // checking for avatar local path
  const localAvatarPath = req.files?.avatar[0]?.path;
  console.log("the path of cover image is ",localAvatarPath);

  // checking for cover image local path and adding condidition since it is not required
  let localCoverImagePath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    localCoverImagePath = req.files.coverImage[0].path;
    console.log(`this ${localCoverImagePath}`);
    
  }

  if (!localAvatarPath) {
    throw ApiError(400, "Avatar image is required");
  }

  // uploading on cloudinary
    const avatar =await uploadOnCloudinary(localAvatarPath);
    const coverImage = await uploadOnCloudinary(localCoverImagePath);



    if(!avatar){
        throw new ApiError(400,"Avatar image is required");
    }

    // inserting into database
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    
    // removing the password and refresh token and sending it to the response
    const createdUser =await User.findById(user._id).select(
    "-password -refreshToken"
    )

    if(!createdUser){
    throw new ApiError(500, "something went wrong while registering a user");
    }   

    res.status(201).json(
        new ApiResponse(200,createdUser,"user successfully registered")
    );
});

const loginUser = asyncHandler(async (req,res)=>{
  // req body -> data
  // username email
  // find user
  // check password
  // access token and refresh token
  // send cookie

  const {email,userName,password} = req.body;

  console.log("the email is ",email);

  if(!userName && !email){
    throw new ApiError(400,"password and email is required")
  }

  const user = await User.findOne({
    $or: [{email} ,{userName}]
  })

  if(!user){
    throw new ApiError(404,"User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(404,"invalid user credentials");
  }

  const { accessToken , refreshToken } =await generateAccessAndRefreshToken(user._id);


  // either we get the updated user from DB whose refresh token is updated
  // or we can update the old object it all depends on you
  const loggedInUser = await User.findById(user._id).
  select("-password -refreshToken");

  // now configuring the cookie behaviour
  // now this cookie can only be modified by the server not the frontend
  const option = {
    httpOnly:true,
    secure:true
  }

  return res.status(200)
  .cookie("accessToken",accessToken,option)
  .cookie("refreshToken",refreshToken,option)
  .json(
    new ApiResponse(
      200,
      {
       user: loggedInUser,accessToken,refreshToken
      },
      "User logged In successfully"
    )
  )

});

const logoutUser = asyncHandler(async (req,res)=>{
  // first i want to find the user who i want to log out
  // i made a custom middleware and injected it in my req

  console.log("the user in the logout is ",req.user.email);
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken : undefined
      }
    },
    {
      new:true
    }
  );

  const option = {
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .clearCookie("accessToken",option)
  .clearCookie("refreshToken",option)
  .json(
    new ApiResponse(200,{},"User logged out")
  )
})

const generateAccessAndRefreshToken = async (userID)=>{
  try{
    const user = await User.findById(userID);
    

    // at this point i have my both access and refresh token
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();


    // setting the value of refresh token so no need for password everytime
    user.refreshToken = refreshToken;

    // saved the token in DB
    await user.save({
      validateBeforeSave:false
    });


    return {accessToken,refreshToken};

  }catch(e){
    throw new ApiError(500,"something went wrong while generating the refresh and access token");
  }
}

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request");
  }

  try{
    // now verify incoming token, this will return the user object
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);
  
    if(!user){
      throw new ApiError(401,"Invalid refresh token")
    }
  
    // now match the user incoming token with the user from the database

    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"refresh token is expired");
    }
  
    const option ={
      httpOnly:true,
      secure:true
    }
  
    const {updatedAcessToken,updatedRefreshToken} = await generateAccessAndRefreshToken(user._id);
  
    return res
    .status(200)
    .cookie("accessToken",updatedAcessToken,option)
    .cookie("refreshToken",updatedRefreshToken,option)
    .json(
      new ApiResponse(200,{
        "updatedAccessToken":updatedAcessToken,
        "updatedRefreshToken":updatedRefreshToken,
      },"Access Token refreshed")
    )
  }catch(e){
    throw new ApiError(401,e?.message|| "invalid refresh token")
  }
})


export { 
  registerUser,
  loginUser, 
  logoutUser,
  refreshAccessToken
 };
