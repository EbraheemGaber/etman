const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const backendDirectory = path.resolve(__dirname, '..')
require('dotenv').config({ path: path.join(backendDirectory, '.env') })
if (!process.env.MONGO_URI) {
    require('dotenv').config({ path: path.resolve(backendDirectory, '..', '.env') })
}

const Product = require('../models/Product')
const catalogPath = path.join(backendDirectory, 'data', 'restaurant-catalog-estimates.json')

const setUnlimitedStock = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured in backend/.env or the project .env')
    }

    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
    if (catalog.length !== 235 || catalog.some((product) => product.priceIsEstimate)) {
        throw new Error('Expected the approved 235-product catalog before updating stock settings')
    }

    await mongoose.connect(process.env.MONGO_URI)
    try {
        const productCount = await Product.countDocuments()
        if (productCount !== catalog.length) {
            throw new Error(`Expected 235 database products, found ${productCount}`)
        }

        const result = await Product.updateMany({}, { $set: { isUnlimitedStock: true } })
        for (const product of catalog) {
            product.isUnlimitedStock = true
        }
        fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8')

        console.log(JSON.stringify({
            matchedProducts: result.matchedCount,
            updatedProducts: result.modifiedCount,
            unlimitedStock: true,
        }, null, 2))
    } finally {
        await mongoose.disconnect()
    }
}

setUnlimitedStock().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
