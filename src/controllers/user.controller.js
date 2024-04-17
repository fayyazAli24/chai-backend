import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
