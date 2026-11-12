const User=require("../models/User")

exports.requireAdmin=async(req,res,next)=>{
    try {
        const user=await User.findById(req.user?._id).select("isAdmin")
        if(!user?.isAdmin){
            return res.status(403).json({message:"Admin access is required"})
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Unable to verify admin access"})
    }
}
