require('dotenv').config({path:require('path').join(__dirname,'..','.env')})
const mongoose=require('mongoose')
const readline=require('readline')
const Order=require('../models/Order')

const orderSuffixes=['EA0ECA','EA0E83','4A0A23']
const confirmationText='RESET SHOWN ORDERS'

const confirmReset=()=>new Promise((resolve)=>{
    const prompt=readline.createInterface({
        input:process.stdin,
        output:process.stdout
    })
    prompt.question(`Type "${confirmationText}" to reset these orders: `,(answer)=>{
        prompt.close()
        resolve(answer===confirmationText)
    })
})

const resetShownOrders=async()=>{
    if(!process.env.MONGO_URI){
        throw new Error('MONGO_URI is not configured in backend/.env')
    }

    await mongoose.connect(process.env.MONGO_URI)
    const orders=await Order.find({}).select('_id status').lean()
    const matchingOrders=orders.filter((order)=>(
        orderSuffixes.includes(String(order._id).slice(-6).toUpperCase())
    ))
    const matchCounts=new Map(orderSuffixes.map((suffix)=>[
        suffix,
        matchingOrders.filter((order)=>String(order._id).slice(-6).toUpperCase()===suffix).length
    ]))
    const invalidMatches=[...matchCounts].filter(([,count])=>count!==1)

    console.log(`Database: ${mongoose.connection.name}`)
    matchingOrders.forEach((order)=>{
        console.log(`#${String(order._id).slice(-6).toUpperCase()} status: ${order.status}`)
    })

    if(invalidMatches.length){
        throw new Error(`Expected exactly one matching order for each suffix: ${invalidMatches.map(([suffix,count])=>`${suffix} (${count})`).join(', ')}`)
    }

    if(!process.argv.includes('--execute')){
        console.log('Dry run only. Add --execute to reset these orders.')
        return
    }

    if(!await confirmReset()){
        console.log('Reset cancelled.')
        return
    }

    const result=await Order.updateMany(
        {_id:{$in:matchingOrders.map((order)=>order._id)}},
        {$set:{status:'Pending'}},
        {runValidators:true}
    )

    if(result.matchedCount!==orderSuffixes.length){
        throw new Error(`Expected to reset ${orderSuffixes.length} orders but matched ${result.matchedCount}`)
    }

    console.log(`Reset ${result.modifiedCount} orders to Pending.`)
}

resetShownOrders()
    .catch((error)=>{
        console.error('Unable to reset the shown orders:',error.message)
        process.exitCode=1
    })
    .finally(async()=>{
        await mongoose.disconnect()
    })
