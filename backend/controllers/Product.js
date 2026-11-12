const { Schema, default: mongoose } = require("mongoose")
const fs=require("fs/promises")
const path=require("path")
const { randomUUID }=require("crypto")
const Product=require("../models/Product")

exports.uploadImage=async(req,res)=>{
    if(!req.file){
        return res.status(400).json({message:"Select an image to upload"})
    }

    const {buffer,mimetype}=req.file
    const signatures={
        "image/jpeg":buffer.length>=3 && buffer[0]===0xff && buffer[1]===0xd8 && buffer[2]===0xff,
        "image/png":buffer.length>=8 && buffer.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),
        "image/webp":buffer.length>=12 && buffer.toString("ascii",0,4)==="RIFF" && buffer.toString("ascii",8,12)==="WEBP",
        "image/gif":buffer.length>=6 && ["GIF87a","GIF89a"].includes(buffer.toString("ascii",0,6))
    }
    if(!signatures[mimetype]){
        return res.status(400).json({message:"The file content does not match a supported image format"})
    }

    const extensions={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"}
    const filename=`${randomUUID()}.${extensions[mimetype]}`
    const uploadDirectory=path.join(__dirname,"..","uploads","products")
    try{
        await fs.mkdir(uploadDirectory,{recursive:true})
        await fs.writeFile(path.join(uploadDirectory,filename),buffer,{flag:"wx"})
        const baseUrl=process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`
        res.status(201).json({url:`${baseUrl.replace(/\/$/,"")}/uploads/products/${filename}`})
    }catch(error){
        console.log(error)
        res.status(500).json({message:"Unable to store the uploaded image"})
    }
}

exports.create=async(req,res)=>{
    try {
        const created=new Product(req.body)
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error adding product, please trying again later'})
    }
}

exports.getAll = async (req, res) => {
    try {
        const filter={}
        const sort={}
        let skip=0
        let limit=0

        if(req.query.brand){
            filter.brand={$in:req.query.brand}
        }

        if(req.query.category){
            filter.category={$in:req.query.category}
        }

        if(req.query.user){
            filter['isDeleted']=false
        }

        if(req.query.sort){
            sort[req.query.sort]=req.query.order?req.query.order==='asc'?1:-1:1
        }

        if(req.query.page && req.query.limit){

            const pageSize=req.query.limit
            const page=req.query.page

            skip=pageSize*(page-1)
            limit=pageSize
        }

        const totalDocs=await Product.find(filter).sort(sort).populate("brand").countDocuments().exec()
        const results=await Product.find(filter).sort(sort).populate("brand").skip(skip).limit(limit).exec()

        res.set("X-Total-Count",totalDocs)

        res.status(200).json(results)
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching products, please try again later'})
    }
};

exports.getById=async(req,res)=>{
    try {
        const {id}=req.params
        let result = null

        try {
            result = await Product.findById(id).populate("brand").populate("category")
        } catch (populateError) {
            console.warn("Populating brand and category failed, attempting brand only:", populateError?.message)
            try {
                result = await Product.findById(id).populate("brand")
            } catch (brandPopulateError) {
                result = await Product.findById(id)
            }
        }

        if(!result){
            return res.status(404).json({message:'Product not found'})
        }

        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting product details, please try again later'})
    }
}

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Product.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating product, please try again later'})
    }
}

exports.undeleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const unDeleted=await Product.findByIdAndUpdate(id,{isDeleted:false},{new:true}).populate('brand')
        res.status(200).json(unDeleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error restoring product, please try again later'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const deleted=await Product.findByIdAndUpdate(id,{isDeleted:true},{new:true}).populate("brand")
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error deleting product, please try again later'})
    }
}

