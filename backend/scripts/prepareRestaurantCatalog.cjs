const fs = require('fs')
const path = require('path')

const [extractionPath, mediaSource, outputPath, imageOutputDirectory] = process.argv.slice(2)
if (!extractionPath || !mediaSource || !outputPath || !imageOutputDirectory) {
    throw new Error('Usage: node prepareRestaurantCatalog.cjs <extraction.json> <media-dir> <output.json> <image-output-dir>')
}

const categoryEstimates = {
    'اطباق فويل': { price: 1800, typicalCount: 1000 },
    'أطباق فوم': { price: 1200, typicalCount: 1000 },
    'فويل المونيوم رول': { price: 1200, typicalCount: 20 },
    'كيلنج فيلم مزدوج 2 رول': { price: 1100, typicalCount: 2 },
    'كيلنج فيلم جامبو 1 رول': { price: 2300, typicalCount: 1 },
    'كيلنج فيلم منزلى': { price: 1600, typicalCount: 20 },
    'استرتش صناعي': { price: 550, typicalCount: 1 },
    'ماكينة كيلنج': { price: 1200, typicalCount: 1 },
    'رول مفارش سفرة': { price: 180, typicalCount: 1 },
    'رول أكياس قمامة': { price: 120, typicalCount: 1 },
    'أكياس بيور': { price: 1100, typicalCount: 40 },
    'أكياس منديل': { price: 900, typicalCount: 25 },
    'مكعبات ثلج': { price: 140, typicalCount: 25 },
    'بكر لاصق': { price: 1500, typicalCount: 72 },
    'بولى اوليفين': { price: 500, typicalCount: 1 },
    'أكياس ذاتية اللاصق': { price: 260, typicalCount: 1 },
    'كيس حرارى': { price: 1500, typicalCount: 120 },
    'جوانتى': { price: 2200, typicalCount: 100 },
    'ورق زبدة': { price: 450, typicalCount: 1 },
    'ورق جرنال': { price: 300, typicalCount: 1 },
    'رول فورى': { price: 65, typicalCount: 1 },
    'رول كاشير': { price: 70, typicalCount: 1 },
    'بكر ميزان': { price: 110, typicalCount: 1 },
    'باركود': { price: 90, typicalCount: 1 },
    'مناديل ورقية': { price: 1600, typicalCount: 20 },
    'كوستر': { price: 550, typicalCount: 25 },
    'معالق': { price: 2000, typicalCount: 1000 },
    'شوكة': { price: 2000, typicalCount: 1000 },
    'سكينة': { price: 2000, typicalCount: 1000 },
    'كوفير': { price: 90, typicalCount: 3 },
    'شاليمو': { price: 700, typicalCount: 25 },
    'خلة اسنان': { price: 1200, typicalCount: 50 },
    'خلة شيش': { price: 650, typicalCount: 100 },
    'ستيلر': { price: 500, typicalCount: 10 },
    'أكواب ورقية': { price: 1600, typicalCount: 1000 },
    'هولدر أكواب': { price: 1000, typicalCount: 600 },
    'علب الشوربة': { price: 1800, typicalCount: 1000 },
    'علب كرتون': { price: 1800, typicalCount: 600 },
    'بولا ايس كريم': { price: 1500, typicalCount: 1000 },
    'علبة بيتزا': { price: 650, typicalCount: 50 },
    'كرسي بيتزا': { price: 1600, typicalCount: 3000 },
    'أكواب PET': { price: 1400, typicalCount: 1000 },
    'كوب ماء': { price: 1200, typicalCount: 2000 },
    'كوب U SHAPE': { price: 1600, typicalCount: 1000 },
    'وجبات & عبوات': { price: 1800, typicalCount: 200 },
    'عبوات السلطة': { price: 1500, typicalCount: 600 },
    'عبوات الصوص': { price: 1300, typicalCount: 1000 },
    'غطاء الرأس': { price: 1100, typicalCount: 2000 },
    'ورق تصوير': { price: 1200, typicalCount: 5 },
    'أقلام': { price: 150, typicalCount: 12 },
    'دباسة + دبابيس': { price: 250, typicalCount: 1 },
}

const extraction = JSON.parse(fs.readFileSync(extractionPath, 'utf8'))
const table = extraction.tables[1]
const copiedImages = new Set()
const products = []
let category = ''
fs.mkdirSync(imageOutputDirectory, { recursive: true })

const parseNumber = (text) => {
    const match = String(text || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/)
    return match ? Number(match[0]) : null
}

const estimatePrice = (name, packageContents, unit, categoryName) => {
    const estimate = categoryEstimates[categoryName]
    if (!estimate) throw new Error(`Missing estimate rule for catalog category: ${categoryName}`)

    let factor = 1
    const packageCount = parseNumber(packageContents)
    if (packageCount && estimate.typicalCount > 1) {
        factor *= Math.sqrt(packageCount / estimate.typicalCount)
    }

    if (categoryName === 'فويل المونيوم رول') {
        const meters = parseNumber(name)
        const rollCount = packageCount || estimate.typicalCount
        if (meters) factor = Math.sqrt(meters / 20) * Math.sqrt(estimate.typicalCount / rollCount)
    } else if (categoryName === 'أطباق فوم') {
        const sizeFactor = name.includes('واحد كيلو') ? 1.3
            : name.includes('نصف كيلو') ? 1.1
                : name.includes('ربع كيلو') ? 0.9
                    : 0.75
        factor *= sizeFactor
    } else if (categoryName === 'اطباق فويل') {
        const model = parseNumber(name)
        if (model) factor *= Math.pow(model / 420, 0.25)
    } else if (categoryName === 'كيلنج فيلم جامبو 1 رول') {
        const weight = parseNumber(name)
        if (weight) factor *= Math.min(1.7, Math.max(0.75, Math.sqrt(weight / 4.7)))
    } else if (categoryName === 'رول فورى' || categoryName === 'رول كاشير') {
        const length = parseNumber(name)
        if (length) factor *= Math.sqrt(length / 25)
    } else if (categoryName === 'أكواب ورقية' || categoryName === 'أكواب PET' || categoryName === 'كوب ماء' || categoryName === 'كوب U SHAPE') {
        const size = parseNumber(name)
        if (size) factor *= Math.min(1.5, Math.max(0.85, Math.sqrt(size / 10)))
    } else if (categoryName === 'علب الشوربة' || categoryName === 'علب كرتون' || categoryName === 'عبوات الصوص') {
        const size = parseNumber(name)
        if (size) factor *= Math.min(1.45, Math.max(0.8, Math.sqrt(size / 300)))
    }

    if (/نترل|Nitrile/i.test(name)) factor *= 1.5
    if (/ستانلس/i.test(name)) factor *= 1.35
    if (/PET/i.test(name)) factor *= 1.12

    const estimateValue = estimate.price * factor
    return Math.max(5, Math.round(estimateValue / 5) * 5)
}

for (const row of table) {
    if (row.length === 1 && row[0].text) {
        category = row[0].text
        continue
    }
    if (row.length < 5 || !row[4].text || row[4].text === 'اسم الصنف') continue

    const title = row[4].text
    const packageContents = row[2].text
    const unit = row[3].text
    const imageNames = row[0].images.map((image) => path.basename(image))
    if (imageNames.length === 0) throw new Error(`No image found for product "${title}" in category "${category}"`)

    const imageUrls = imageNames.map((filename) => {
        if (!copiedImages.has(filename)) {
            const source = path.join(mediaSource, filename)
            if (!fs.existsSync(source)) throw new Error(`Missing catalog image: ${source}`)
            const destination = path.join(imageOutputDirectory, filename)
            fs.copyFileSync(source, destination)
            copiedImages.add(filename)
        }
        return `/catalog/products/${filename}`
    })

    products.push({
        title,
        description: [
            packageContents ? `محتوى العبوة: ${packageContents}` : '',
            unit ? `وحدة البيع: ${unit}` : '',
            'السعر تقديري مبدئي وغير مؤكد؛ يرجى مراجعته قبل البيع.',
        ].filter(Boolean).join(' - '),
        price: estimatePrice(title, packageContents, unit, category),
        priceIsEstimate: true,
        stockQuantity: 0,
        isUnlimitedStock: true,
        category,
        brand: 'Etman Group',
        thumbnail: imageUrls[0],
        images: [...new Set(imageUrls)],
        isDeleted: false,
    })
}

if (products.length !== 235) {
    throw new Error(`Expected 235 products from the catalog, but prepared ${products.length}`)
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf8')
console.log(JSON.stringify({
    products: products.length,
    categories: new Set(products.map((product) => product.category)).size,
    uniqueImages: copiedImages.size,
    zeroStockProducts: products.filter((product) => product.stockQuantity === 0).length,
    outputPath,
    imageOutputDirectory,
}, null, 2))
