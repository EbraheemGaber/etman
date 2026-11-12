require('dotenv').config()
const mongoose=require("mongoose")

exports.connectToDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('connected to DB');
        const fs = require('fs')
        const path = require('path')
        const Product = require('../models/Product')
        const Category = require('../models/Category')
        const categories = await Category.find().lean()
        const result = []
        for (const cat of categories) {
            const prod = await Product.findOne({ category: cat._id, isDeleted: false }).lean()
            result.push({
                id: cat._id.toString(),
                name: cat.name,
                thumbnail: prod ? prod.thumbnail : ''
            })
        }
        fs.writeFileSync(path.join(__dirname, '..', '..', 'category_static_data.json'), JSON.stringify(result, null, 2))
    } catch (error) {
        console.log(error);
    }
}