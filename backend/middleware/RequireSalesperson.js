const User=require("../models/User")

exports.requireSalesperson=async(req,res,next)=>{
    try {
        const user=await User.findById(req.user?._id).select("isSalesperson")
        if(!user?.isSalesperson){
            return res.status(403).json({message:"Salesperson access is required"})
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Unable to verify salesperson access"})
    }
}
