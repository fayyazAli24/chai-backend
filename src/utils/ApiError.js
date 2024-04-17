class ApiError extends Error{
    constructor(
        statusCode,
        message="something went wrong",
        errors=[],
        stack = ""
    ){
        // overriding the error fields with incoming fields from parameters which will be provided by the user
        super(message);
        this.statusCode = statusCode,
        this.data = null,
        this.message = message,
        this.success=false
        this.errors = errors;

        // prints the stack in which files errors are occuring
        if(stack){
            this.stack = stack;
        }else{

            // capturing error is occuring in which context 
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export { ApiError };