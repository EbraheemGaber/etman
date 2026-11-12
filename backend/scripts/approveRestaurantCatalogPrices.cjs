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
const estimateNote = ' - السعر تقديري مبدئي وغير مؤكد؛ يرجى مراجعته قبل البيع.'

const approvePrices = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured in backend/.env or the project .env')
    }

    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
    if (catalog.length !== 235 || catalog.some((product) => !product.priceIsEstimate)) {
        throw new Error('Expected all 235 catalog prices to still be marked as estimates')
    }

    await mongoose.connect(process.env.MONGO_URI)
    try {
        const products = await Product.find({ priceIsEstimate: true })
        if (products.length !== catalog.length) {
            throw new Error(`Expected 235 estimated database prices, found ${products.length}`)
        }

        for (const product of products) {
            product.priceIsEstimate = false
            product.description = product.description.replace(estimateNote, '')
            await product.save()
        }

        for (const product of catalog) {
            product.priceIsEstimate = false
            product.description = product.description.replace(estimateNote, '')
        }
        fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8')

        console.log(JSON.stringify({
            approvedPrices: products.length,
            changedPriceValues: 0,
            removedEstimateWarnings: true,
            stockQuantity: 'unchanged',
        }, null, 2))
    } finally {
        await mongoose.disconnect()
    }
}

approvePrices().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
