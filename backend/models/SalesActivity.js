const mongoose=require("mongoose")
const {Schema}=mongoose

const salesActivitySchema=new Schema({
    salesperson:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    type:{
        type:String,
        enum:["CustomerVisit"],
        required:true
    },
    customerName:{
        type:String,
        required:true,
        trim:true
    },
    customerEmail:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    }
},{timestamps:true,versionKey:false})

module.exports=mongoose.model("SalesActivity",salesActivitySchema)
