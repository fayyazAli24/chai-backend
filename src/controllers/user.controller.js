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

  if([fullName,email,userName,password].some(
      (field) => field?.toString().trim() == ""
  )){
      throw new ApiError(400, is`${field} is required`);
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email or username already exist");
  }

  const localAvatarPath = req.files?.avatar[0]?.path;
  const localCoverImagePath = req.files?.coverImage[0]?.path;
  console.log("the path of avatar image is ",localAvatarPath);
  console.log("the path of cover image is ",localCoverImagePath);

  if (!localAvatarPath) {
    throw ApiError(400, "Avatar image is required");
  }


    const avatar =await uploadOnCloudinary(localAvatarPath);
    console.log("the avatar is ",avatar);
    const coverImage =await uploadOnCloudinary(localCoverImagePath);


    if(!avatar){
        throw new ApiError(400,"Avatar image is required");
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

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
