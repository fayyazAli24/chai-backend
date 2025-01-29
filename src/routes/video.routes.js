import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {voiceMailController} from "../controllers/video.controller.js"




const router = Router();

router.route('/uploadVoice').post( upload.fields(
    [
        {
            name:"mail",
            maxCount:1
        }
    ]

),voiceMailController)


export default router