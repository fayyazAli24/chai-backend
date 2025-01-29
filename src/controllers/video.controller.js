import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const voiceMailController = asyncHandler(async (req,res)=>{
    const localMailPath = req.files?.mail[0].path;
    console.log("the path of cover image is ",localMailPath);

    const test = await uploadOnCloudinary(localMailPath);

    console.log("testing",test);

})

export { voiceMailController}