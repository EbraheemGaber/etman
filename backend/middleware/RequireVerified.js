const User=require("../models/User")

exports.requireVerified=async(req,res,next)=>{
    try {
        const user=await User.findById(req.user?._id).select("isVerified")
        if(!user?.isVerified){
            return res.status(403).json({message:"Email verification is required"})
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Unable to verify account status"})
    }
}
