// a wrapper to handle all the database related methods which accepts a function in the parameter

const asyncHandler = (fun)=>{
    async (res,req,next) =>{
        try{
            await fun(req,res,next);

        }catch(error){
            res.status(error.code || 500).json({
                success:false,
                message:error.message
            })
        }
    }
}

export { asyncHandler };