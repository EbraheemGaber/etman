const mongoose=require("mongoose")
const {Schema}=mongoose

const customerContactSchema=new Schema({
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true
    },
    phone:{
        type:String,
        required:true,
        trim:true
    }
},{timestamps:true,versionKey:false})

module.exports=mongoose.model("CustomerContact",customerContactSchema)
