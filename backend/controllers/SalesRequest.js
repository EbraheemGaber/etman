const mongoose=require("mongoose")
const Product=require("../models/Product")
const SalesRequest=require("../models/SalesRequest")
const User=require("../models/User")
const CustomerContact=require("../models/CustomerContact")
const SalesActivity=require("../models/SalesActivity")

exports.create=async(req,res)=>{
    try {
        const {customer,items}=req.body
        const customerName=typeof customer?.name==="string"?customer.name.trim():""
        const customerEmail=typeof customer?.email==="string"?customer.email.trim().toLowerCase():""
        const customerPhone=typeof customer?.phone==="string"?customer.phone.trim():""
        if(!customerName || !customerPhone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)){
            return res.status(400).json({message:"Enter a valid customer name, email, and phone"})
        }
        if(!Array.isArray(items) || !items.length){
            return res.status(400).json({message:"Add at least one product to the request"})
        }

        const quantities=new Map()
        for(const item of items){
            if(!item || typeof item!=="object"){
                return res.status(400).json({message:"Each item must contain a product and quantity"})
            }
            const productId=String(item.productId || "")
            const quantity=Number(item.quantity)
            if(!mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity<1){
                return res.status(400).json({message:"Each item must have a valid product and a positive whole-number quantity"})
            }
            quantities.set(productId,(quantities.get(productId) || 0)+quantity)
        }

        const products=await Product.find({
            _id:{$in:[...quantities.keys()]},
            isDeleted:false
        }).populate("brand")

        if(products.length!==quantities.size){
            return res.status(400).json({message:"One or more selected products are unavailable"})
        }
        if(products.some((product)=>!product.isUnlimitedStock && quantities.get(String(product._id))>product.stockQuantity)){
            return res.status(400).json({message:"Requested quantities cannot exceed available stock"})
        }

        const requestItems=products.map((product)=>({
            product:{
                _id:product._id,
                title:product.title,
                thumbnail:product.thumbnail,
                price:product.price,
                brand:product.brand?.name
            },
            quantity:quantities.get(String(product._id))
        }))
        const total=requestItems.reduce((sum,item)=>sum+item.product.price*item.quantity,0)
        const created=await SalesRequest.create({
            salesperson:req.user._id,
            customer:{
                name:customerName,
                email:customerEmail,
                phone:customerPhone
            },
            items:requestItems,
            total
        })
        res.status(201).json(created)
    } catch(error) {
        console.log(error)
        res.status(500).json({message:"Error creating the sales request"})
    }
}

exports.getMine=async(req,res)=>{
    try {
        const requests=await SalesRequest.find({salesperson:req.user._id}).sort({createdAt:-1})
        res.status(200).json(requests)
    } catch(error) {
        console.log(error)
        res.status(500).json({message:"Error fetching your sales requests"})
    }
}

exports.getStatistics=async(req,res)=>{
    try {
        const match={$match:{salesperson:new mongoose.Types.ObjectId(req.user._id)}}
        const [monthlyResults,productResults]=await Promise.all([
            SalesRequest.aggregate([
                match,
                {
                    $group:{
                        _id:{$dateToString:{format:"%Y-%m",date:"$createdAt",timezone:"UTC"}},
                        requests:{$sum:1},
                        revenue:{$sum:{$cond:[{$eq:["$status","Completed"]},"$total",0]}}
                    }
                },
                {$sort:{_id:1}}
            ]),
            SalesRequest.aggregate([
                match,
                {$match:{status:"Completed"}},
                {$unwind:"$items"},
                {
                    $group:{
                        _id:{
                            month:{$dateToString:{format:"%Y-%m",date:"$createdAt",timezone:"UTC"}},
                            product:{$ifNull:["$items.product._id","$items.product.title"]}
                        },
                        quantity:{$sum:{$ifNull:["$items.quantity",1]}}
                    }
                },
                {
                    $group:{
                        _id:"$_id.month",
                        productsSold:{$sum:"$quantity"}
                    }
                }
            ])
        ])

        const productsByMonth=new Map(productResults.map((result)=>[result._id,result.productsSold]))
        const monthsByKey=new Map(monthlyResults.map((result)=>[result._id,result]))
        const firstMonth=monthlyResults.length
            ?new Date(`${monthlyResults[0]._id}-01T00:00:00.000Z`)
            :new Date()
        const currentMonth=new Date()
        const monthly=[]

        for(
            const date=new Date(Date.UTC(firstMonth.getUTCFullYear(),firstMonth.getUTCMonth(),1));
            date<=Date.UTC(currentMonth.getUTCFullYear(),currentMonth.getUTCMonth(),1);
            date.setUTCMonth(date.getUTCMonth()+1)
        ){
            const key=date.toISOString().slice(0,7)
            const result=monthsByKey.get(key)
            monthly.push({
                month:new Intl.DateTimeFormat("en-US",{month:"short",year:"numeric",timeZone:"UTC"}).format(date),
                requests:result?.requests || 0,
                revenue:result?.revenue || 0,
                productsSold:productsByMonth.get(key) || 0
            })
        }

        const now=new Date()
        const monthStart=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1))
        const nextMonthStart=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1))
        const dayStart=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()))
        const nextDayStart=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1))
        const [monthlyKpiResults,newCustomers,customerVisitsToday,salesperson]=await Promise.all([
            SalesRequest.aggregate([
                {$match:{salesperson:new mongoose.Types.ObjectId(req.user._id),status:"Completed",createdAt:{$gte:monthStart,$lt:nextMonthStart}}},
                {$group:{_id:null,revenue:{$sum:"$total"},orders:{$sum:1}}}
            ]),
            CustomerContact.countDocuments({
                createdBy:req.user._id,
                createdAt:{$gte:monthStart,$lt:nextMonthStart}
            }),
            SalesActivity.countDocuments({
                salesperson:req.user._id,
                type:"CustomerVisit",
                createdAt:{$gte:dayStart,$lt:nextDayStart}
            }),
            User.findById(req.user._id).select("monthlySalesTarget")
        ])
        const monthlyRevenue=monthlyKpiResults[0]?.revenue || 0
        const monthlyOrders=monthlyKpiResults[0]?.orders || 0

        res.status(200).json({
            monthly,
            totals:{
                requests:monthlyResults.reduce((sum,result)=>sum+result.requests,0),
                revenue:monthlyResults.reduce((sum,result)=>sum+result.revenue,0),
                productsSold:productResults.reduce((sum,result)=>sum+result.productsSold,0)
            },
            kpis:{
                monthlySalesRevenue:monthlyRevenue,
                monthlySalesTarget:salesperson?.monthlySalesTarget ?? 10000,
                salesTargetAchievement:salesperson?.monthlySalesTarget>0
                    ?monthlyRevenue/salesperson.monthlySalesTarget*100
                    :0,
                newCustomers,
                customerVisitsToday,
                conversionRate:newCustomers>0?monthlyOrders/newCustomers*100:null,
                averageOrderValue:monthlyOrders>0?monthlyRevenue/monthlyOrders:null,
                completedOrders:monthlyOrders
            }
        })
    } catch(error) {
        console.log(error)
        res.status(500).json({message:"Error fetching salesperson statistics"})
    }
}

exports.updateSalesTarget=async(req,res)=>{
    const target=Number(req.body.monthlySalesTarget)
    if(!Number.isFinite(target) || target<0){
        return res.status(400).json({message:"Monthly sales target must be a non-negative number"})
    }

    try {
        const user=await User.findByIdAndUpdate(
            req.user._id,
            {monthlySalesTarget:target},
            {new:true,runValidators:true}
        ).select("monthlySalesTarget")
        if(!user){
            return res.status(404).json({message:"Salesperson account not found"})
        }
        res.status(200).json({monthlySalesTarget:user.monthlySalesTarget})
    } catch(error) {
        console.log(error)
        res.status(500).json({message:"Error updating the monthly sales target"})
    }
}

exports.logCustomerVisit=async(req,res)=>{
    try {
        const customerName=typeof req.body.customerName==="string"?req.body.customerName.trim():""
        const customerEmail=typeof req.body.customerEmail==="string"?req.body.customerEmail.trim().toLowerCase():""
        if(!customerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)){
            return res.status(400).json({message:"Select a customer with a valid name and email before logging a visit"})
        }

        const activity=await SalesActivity.create({
            salesperson:req.user._id,
            type:"CustomerVisit",
            customerName,
            customerEmail
        })
        res.status(201).json(activity)
    } catch(error) {
        console.log(error)
        res.status(500).json({message:"Error logging customer visit"})
    }
}

exports.getAll=async(req,res)=>{
    try {
        const requests=await SalesRequest.find().populate("salesperson","name email").sort({createdAt:-1})
        res.status(200).json(requests)
    } catch(error) {
        console.log(error)
        res.status(500).json({message:"Error fetching sales requests"})
    }
}

exports.updateStatus=async(req,res)=>{
    const allowedTransitions={
        Pending:["Approved","Rejected"],
        Approved:["Completed"],
        Rejected:[],
        Completed:[]
    }

    try {
        const request=await SalesRequest.findById(req.params.id)
        if(!request){
            return res.status(404).json({message:"Sales request not found"})
        }
        if(!allowedTransitions[request.status]?.includes(req.body.status)){
            return res.status(400).json({message:"This sales request status change is not allowed"})
        }
        request.status=req.body.status
        request.reviewedBy=req.user._id
        request.reviewedAt=new Date()
        await request.save()
        const populated=await request.populate("salesperson","name email")
        res.status(200).json(populated)
    } catch(error) {
        console.log(error)
        res.status(500).json({message:"Error updating sales request"})
    }
}
