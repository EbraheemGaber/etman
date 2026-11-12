const mongoose=require("mongoose")
const {Schema}=mongoose

const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isSalesperson:{
        type:Boolean,
        default:false
    },
    monthlySalesTarget:{
        type:Number,
        default:10000,
        min:0
    }
})

module.exports=mongoose.model("User",userSchema)