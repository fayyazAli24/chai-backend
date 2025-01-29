import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = Schema({

    videoFile:{
        type:String,
        required:true
    },

    thumbnail:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:Number,
        required:true,
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },

    owner:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }


    voiceMail:{
        type:String,
        required:true
    }

},{timestamps:true});


// injecting aggregation plugin to be used in watch history section for complex query
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);