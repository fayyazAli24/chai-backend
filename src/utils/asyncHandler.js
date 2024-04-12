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