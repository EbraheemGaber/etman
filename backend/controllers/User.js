const User=require("../models/User")
const Address=require("../models/Address")
const CustomerContact=require("../models/CustomerContact")
const { sanitizeUser } = require("../utils/SanitizeUser")

exports.getById=async(req,res)=>{
    try {
        const {id}=req.params
        if(String(req.user?._id)!==String(id) && !req.user?.isAdmin){
            return res.status(403).json({message:"You can only view your own account"})
        }
        const result=(await User.findById(id)).toObject()
        delete result.password
        res.status(200).json(result)
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting your details, please try again later'})
    }
}
exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        if(String(req.user?._id)!==String(id)){
            return res.status(403).json({message:"You can only update your own account"})
        }
        const updates={}
        if(typeof req.body.name==="string") updates.name=req.body.name.trim()
        if(typeof req.body.email==="string") updates.email=req.body.email.trim().toLowerCase()
        if(!Object.keys(updates).length){
            return res.status(400).json({message:"No valid profile fields provided"})
        }
        const updated=await User.findByIdAndUpdate(id,updates,{new:true,runValidators:true})
        if(!updated){
            return res.status(404).json({message:"User not found"})
        }
        const safeUser=updated.toObject()
        delete safeUser.password
        res.status(200).json(safeUser)

    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating your details, please try again later'})
    }
}

exports.getSalespeople=async(req,res)=>{
    try {
        const users=await User.find({isAdmin:{$ne:true},isVerified:true})
            .select("name email isVerified isSalesperson")
            .sort({name:1})
        res.status(200).json(users)
    } catch(error) {
        console.log(error)
        res.status(500).json({message:"Error fetching salesperson accounts"})
    }
}

exports.searchCustomers=async(req,res)=>{
    try {
        const [users,contacts]=await Promise.all([
            User.find({
                isAdmin:{$ne:true},
                isSalesperson:{$ne:true}
            }).select("_id name email").sort({name:1}),
            CustomerContact.find().select("_id name email phone").sort({name:1})
        ])

        const addresses=users.length
            ?await Address.find({user:{$in:users.map((user)=>user._id)}}).select("user phoneNumber")
            :[]
        const phonesByUser=new Map(addresses.map((address)=>[String(address.user),address.phoneNumber]))
        const customersByEmail=new Map()

        for(const user of users){
            const email=user.email.trim().toLowerCase()
            customersByEmail.set(email,{
                _id:user._id,
                name:user.name,
                email:user.email,
                phone:phonesByUser.get(String(user._id)) || ""
            })
        }

        for(const contact of contacts){
            const email=contact.email.trim().toLowerCase()
            if(!customersByEmail.has(email)){
                customersByEmail.set(email,{
                    _id:contact._id,
                    name:contact.name,
                    email:contact.email,
                    phone:contact.phone
                })
            }
        }

        res.status(200).json([...customersByEmail.values()].sort((first,second)=>first.name.localeCompare(second.name)))
    } catch(error) {
        console.log(error)
        res.status(500).json({message:"Error fetching customers"})
    }
}

exports.createCustomer=async(req,res)=>{
    try {
        const name=typeof req.body.name==="string"?req.body.name.trim():""
        const email=typeof req.body.email==="string"?req.body.email.trim().toLowerCase():""
        const phone=typeof req.body.phone==="string"?req.body.phone.trim():""
        if(!name || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            return res.status(400).json({message:"Enter a valid customer name, email, and phone"})
        }

        const escapedEmail=email.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")
        const existingAccount=await User.findOne({email:new RegExp(`^${escapedEmail}$`,"i")}).select("_id")
        const existingContact=await CustomerContact.findOne({email}).select("_id")
        if(existingAccount || existingContact){
            return res.status(409).json({message:"A customer with this email already exists. Select them from Current customer."})
        }

        const created=await CustomerContact.create({
            createdBy:req.user._id,
            name,
            email,
            phone
        })
        res.status(201).json({
            _id:created._id,
            name:created.name,
            email:created.email,
            phone:created.phone
        })
    } catch(error) {
        console.log(error)
        if(error.code===11000){
            return res.status(409).json({message:"A customer with this email already exists. Select them from Current customer."})
        }
        res.status(500).json({message:"Error saving the customer"})
    }
}

exports.setSalesperson=async(req,res)=>{
    try {
        const user=await User.findOneAndUpdate(
            {_id:req.params.id,isAdmin:{$ne:true}},
            {isSalesperson:req.body.isSalesperson===true},
            {new:true,runValidators:true}
        )
        if(!user){
            return res.status(404).json({message:"User not found or cannot be assigned as a salesperson"})
        }
        res.status(200).json(sanitizeUser(user))
    } catch(error) {
        console.log(error)
        res.status(500).json({message:"Error updating salesperson access"})
    }
}