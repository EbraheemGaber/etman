const mongoose=require("mongoose")
const {Schema}=mongoose


const categorySchema=new Schema({
    name:{
        type:String,
        required:true
    },
    parentCategory:{
        type:Schema.Types.ObjectId,
        ref:"Category",
        default:null
    }
})

module.exports=mongoose.model("Category",categorySchema)