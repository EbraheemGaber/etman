const Cart=require('../models/Cart')

exports.create=async(req,res)=>{
    try {
        const created=await new Cart({...req.body,user:req.user._id}).populate({path:"product",populate:{path:"brand"}});
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error adding product to cart, please trying again later'})
    }
}

exports.getByUserId=async(req,res)=>{
    try {
        const {id}=req.params
        if(String(req.user._id)!==id){
            return res.status(403).json({message:"You can only access your own cart"})
        }
        const result = await Cart.find({ user: id }).populate({path:"product",populate:{path:"brand"}});

        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error fetching cart items, please trying again later'})
    }
}

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const {quantity}=req.body
        if(!Number.isInteger(quantity) || quantity<1){
            return res.status(400).json({message:"Cart quantity must be a positive whole number"})
        }
        const updated=await Cart.findOneAndUpdate(
            {_id:id,user:req.user._id},
            {$set:{quantity}},
            {new:true,runValidators:true}
        ).populate({path:"product",populate:{path:"brand"}});
        if(!updated){
            return res.status(404).json({message:"Cart item not found"})
        }
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error updating cart items, please trying again later'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const deleted=await Cart.findOneAndDelete({_id:id,user:req.user._id})
        if(!deleted){
            return res.status(404).json({message:"Cart item not found"})
        }
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error deleting cart item, please trying again later'})
    }
}

exports.deleteByUserId=async(req,res)=>{

    try {
        const {id}=req.params
        if(String(req.user._id)!==id){
            return res.status(403).json({message:"You can only reset your own cart"})
        }
        await Cart.deleteMany({user:id})
        res.sendStatus(204)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Some Error occured while resetting your cart"})
    }

}