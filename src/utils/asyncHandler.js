// a wrapper to handle all the database related methods which accepts a function in the parameter

const asyncHandler = (requestHandler)=>{

   return (req,res,next)=>{

    Promise.resolve(requestHandler(req,res,next)).catch
    ((err)=>next(err))
   }
}
export { asyncHandler };

