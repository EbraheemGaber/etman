const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const backendDirectory = path.resolve(__dirname, '..')
const projectDirectory = path.resolve(backendDirectory, '..')
require('dotenv').config({ path: path.join(backendDirectory, '.env') })
if (!process.env.MONGO_URI) {
    require('dotenv').config({ path: path.join(projectDirectory, '.env') })
}

const Product = require('../models/Product')
const Category = require('../models/Category')
const Brand = require('../models/Brand')
const Cart = require('../models/Cart')
const Wishlist = require('../models/Wishlist')
const Review = require('../models/Review')

const confirmFlag = '--confirm-replace-catalog'
const catalogPath = path.join(backendDirectory, 'data', 'restaurant-catalog-estimates.json')
const publicDirectory = path.join(projectDirectory, 'frontend', 'public')

const validateCatalog = (products) => {
    if (products.length !== 235) {
        throw new Error(`Expected 235 catalog products, found ${products.length}`)
    }

    for (const product of products) {
        if (!product.title || !product.description || !Number.isFinite(product.price) || product.price <= 0) {
            throw new Error(`Invalid product details for "${product.title || 'unknown product'}"`)
        }
        if (!product.priceIsEstimate || product.stockQuantity !== 0) {
            throw new Error(`Catalog safety check failed for "${product.title}"`)
        }

        for (const imageUrl of [product.thumbnail, ...product.images]) {
            const imagePath = path.join(publicDirectory, imageUrl.replace(/^\/+/, '').split('/').join(path.sep))
            if (!fs.existsSync(imagePath)) {
                throw new Error(`Catalog image is missing: ${imagePath}`)
            }
        }
    }
}

const importCatalog = async () => {
    if (!process.argv.includes(confirmFlag)) {
        throw new Error(`Refusing to replace catalog data without ${confirmFlag}`)
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured in backend/.env or the project .env')
    }

    const products = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
    validateCatalog(products)

    await mongoose.connect(process.env.MONGO_URI)

    try {
        const categoryNames = [...new Set(products.map((product) => product.category))]
        const categories = new Map()
        for (const name of categoryNames) {
            const category = await Category.findOneAndUpdate(
                { name },
                { $setOnInsert: { name } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            )
            categories.set(name, category._id)
        }

        const brand = await Brand.findOneAndUpdate(
            { name: 'Etman Group' },
            { $setOnInsert: { name: 'Etman Group' } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        )
        const oldProductIds = (await Product.find({}, { _id: 1 }).lean()).map((product) => product._id)

        const insertedProducts = await Product.insertMany(products.map((product) => ({
            ...product,
            category: categories.get(product.category),
            brand: brand._id,
        })))

        const oldProductFilter = { product: { $in: oldProductIds } }
        const [deletedCart, deletedWishlist, deletedReviews] = await Promise.all([
            Cart.deleteMany(oldProductFilter),
            Wishlist.deleteMany(oldProductFilter),
            Review.deleteMany(oldProductFilter),
        ])

        await Product.deleteMany({ _id: { $in: oldProductIds } })

        const categoryIds = [...categories.values()]
        await Promise.all([
            Category.deleteMany({ _id: { $nin: categoryIds } }),
            Brand.deleteMany({ _id: { $ne: brand._id } }),
        ])

        const finalProductCount = await Product.countDocuments()
        if (finalProductCount !== products.length) {
            throw new Error(`Import finished with ${finalProductCount} products; expected ${products.length}`)
        }

        console.log(JSON.stringify({
            importedProducts: insertedProducts.length,
            categories: categoryNames.length,
            brand: brand.name,
            replacedProducts: oldProductIds.length,
            deletedCartItems: deletedCart.deletedCount,
            deletedWishlistItems: deletedWishlist.deletedCount,
            deletedReviews: deletedReviews.deletedCount,
            finalProductCount,
            stockQuantity: 0,
            pricesAreEstimates: true,
        }, null, 2))
    } finally {
        await mongoose.disconnect()
    }
}

importCatalog().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
