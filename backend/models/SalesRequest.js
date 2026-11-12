const mongoose=require("mongoose")
const {Schema}=mongoose

const salesRequestSchema=new Schema({
    salesperson:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    customer:{
        name:{type:String,required:true,trim:true},
        email:{type:String,required:true,trim:true,lowercase:true},
        phone:{type:String,required:true,trim:true}
    },
    items:{
        type:[Schema.Types.Mixed],
        required:true,
        validate:{
            validator:(items)=>items.length>0,
            message:"At least one product is required"
        }
    },
    total:{
        type:Number,
        required:true,
        min:0
    },
    status:{
        type:String,
        enum:["Pending","Approved","Rejected","Completed"],
        default:"Pending"
    },
    reviewedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    reviewedAt:{
        type:Date
    }
},{timestamps:true,versionKey:false})

module.exports=mongoose.model("SalesRequest",salesRequestSchema)
