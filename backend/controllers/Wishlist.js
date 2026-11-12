const Wishlist = require("../models/Wishlist")

exports.create=async(req,res)=>{
    try {
        const created=await new Wishlist({...req.body,user:req.user._id}).populate({path:"product",populate:["brand"]})
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error adding product to wishlist, please try again later"})
    }
}
exports.getByUserId=async(req,res)=>{
    try {
        const {id}=req.params
        if(String(req.user._id)!==id){
            return res.status(403).json({message:"You can only access your own wishlist"})
        }
        let skip=0
        let limit=0

        if(req.query.page && req.query.limit){
            const pageSize=req.query.limit
            const page=req.query.page

            skip=pageSize*(page-1)
            limit=pageSize
        }

        const result=await Wishlist.find({user:id}).skip(skip).limit(limit).populate({path:"product",populate:['brand']})
        const totalResults=await Wishlist.find({user:id}).countDocuments().exec()

        res.set("X-Total-Count",totalResults)
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error fetching your wishlist, please try again later"})
    }
}
exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Wishlist.findOneAndUpdate(
            {_id:id,user:req.user._id},
            {$set:{note:req.body.note}},
            {new:true,runValidators:true}
        ).populate("product")
        if(!updated){
            return res.status(404).json({message:"Wishlist item not found"})
        }
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error updating your wishlist, please try again later"})
    }
}
exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const deleted=await Wishlist.findOneAndDelete({_id:id,user:req.user._id})
        if(!deleted){
            return res.status(404).json({message:"Wishlist item not found"})
        }
        return res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error deleting that product from wishlist, please try again later"})
    }
}