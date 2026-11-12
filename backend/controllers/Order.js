const Order = require("../models/Order");

exports.create=async(req,res)=>{
    try {
        const created=new Order(req.body)
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error creating an order, please trying again later'})
    }
}

exports.getByUserId=async(req,res)=>{
    try {
        const {id}=req.params
        const results=await Order.find({user:id}).sort({createdAt:-1,_id:-1})
        res.status(200).json(results)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error fetching orders, please trying again later'})
    }
}

exports.getAll = async (req, res) => {
    try {
        let skip=0
        let limit=0

        if(req.query.page && req.query.limit){
            const pageSize=req.query.limit
            const page=req.query.page
            skip=pageSize*(page-1)
            limit=pageSize
        }

        const totalDocs=await Order.find({}).countDocuments().exec()
        const results=await Order.find({}).sort({createdAt:-1,_id:-1}).skip(skip).limit(limit).exec()

        res.header("X-Total-Count",totalDocs)
        res.status(200).json(results)

    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching orders, please try again later'})
    }
};

exports.getStatistics = async (req, res) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access is required" });
    }

    try {
        const [monthlyResults, topProducts] = await Promise.all([
            Order.aggregate([
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m",
                                date: "$createdAt",
                                timezone: "UTC"
                            }
                        },
                        orders: { $sum: 1 },
                        revenue: {
                            $sum: {
                                $cond: [
                                    { $ne: ["$status", "Cancelled"] },
                                    { $ifNull: ["$total", 0] },
                                    0
                                ]
                            }
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                { $match: { status: { $ne: "Cancelled" } } },
                { $unwind: "$item" },
                { $match: { "item.product.title": { $exists: true, $ne: null } } },
                {
                    $group: {
                        _id: {
                            $ifNull: ["$item.product._id", "$item.product.title"]
                        },
                        title: { $first: "$item.product.title" },
                        thumbnail: { $first: "$item.product.thumbnail" },
                        quantity: {
                            $sum: { $ifNull: ["$item.quantity", 1] }
                        }
                    }
                },
                { $sort: { quantity: -1, title: 1 } },
                { $limit: 5 }
            ])
        ]);

        const monthlyByKey = new Map(
            monthlyResults.map((month) => [month._id, month])
        );
        const firstMonth = monthlyResults.length
            ? new Date(`${monthlyResults[0]._id}-01T00:00:00.000Z`)
            : new Date();
        const currentMonth = new Date();
        const monthly = [];

        for (
            const date = new Date(Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth(), 1));
            date <= Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1);
            date.setUTCMonth(date.getUTCMonth() + 1)
        ) {
            const key = date.toISOString().slice(0, 7);
            const result = monthlyByKey.get(key);

            monthly.push({
                month: new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC"
                }).format(date),
                orders: result?.orders || 0,
                revenue: result?.revenue || 0
            });
        }

        res.status(200).json({
            monthly,
            topProducts: topProducts.map((product) => ({
                productId: product._id,
                title: product.title,
                thumbnail: product.thumbnail,
                quantity: product.quantity
            })),
            totals: {
                orders: monthlyResults.reduce((total, month) => total + month.orders, 0),
                revenue: monthlyResults.reduce((total, month) => total + month.revenue, 0)
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching order statistics, please try again later" });
    }
};

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Order.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating order, please try again later'})
    }
}
