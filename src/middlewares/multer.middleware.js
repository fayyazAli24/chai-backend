// this is used  to upload the file to the local server before sending to the server 

// before writing to the server this operation will be performed that is why this is made inside the middleware section

// we will use disk storage to store the file

import multer from "multer"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage
 })