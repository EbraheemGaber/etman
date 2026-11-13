require('dotenv').config({path:require('path').join(__dirname,'..','.env')})
const mongoose=require('mongoose')
const readline=require('readline')
const Order=require('../models/Order')
const SalesRequest=require('../models/SalesRequest')

const confirmationText='DELETE ALL ORDERS'

const confirmDeletion=()=>new Promise((resolve)=>{
    const prompt=readline.createInterface({
        input:process.stdin,
        output:process.stdout
    })
    prompt.question(`Type "${confirmationText}" to permanently delete these records: `,(answer)=>{
        prompt.close()
        resolve(answer===confirmationText)
    })
})

const clearOrders=async()=>{
    if(!process.env.MONGO_URI){
        throw new Error('MONGO_URI is not configured in backend/.env')
    }

    await mongoose.connect(process.env.MONGO_URI)
    const [orderCount,salesRequestCount]=await Promise.all([
        Order.countDocuments(),
        SalesRequest.countDocuments()
    ])

    console.log(`Database: ${mongoose.connection.name}`)
    console.log(`Customer orders: ${orderCount}`)
    console.log(`Sales requests: ${salesRequestCount}`)

    if(!process.argv.includes('--execute')){
        console.log('Dry run only. Add --execute to permanently delete these records.')
        return
    }

    if(!await confirmDeletion()){
        console.log('Deletion cancelled.')
        return
    }

    const session=await mongoose.startSession()
    let deletedOrders=0
    let deletedSalesRequests=0
    try{
        await session.withTransaction(async()=>{
            const [ordersResult,salesRequestsResult]=await Promise.all([
                Order.deleteMany({}, {session}),
                SalesRequest.deleteMany({}, {session})
            ])
            deletedOrders=ordersResult.deletedCount
            deletedSalesRequests=salesRequestsResult.deletedCount
        })
    }finally{
        await session.endSession()
    }

    console.log(`Deleted ${deletedOrders} customer orders and ${deletedSalesRequests} sales requests.`)
}

clearOrders()
    .catch((error)=>{
        console.error('Unable to clear orders:',error.message)
        process.exitCode=1
    })
    .finally(async()=>{
        await mongoose.disconnect()
    })
