require("dotenv").config()
const express=require('express')
const http=require('http')
const path=require("path")
const cors=require('cors')
const { isIP }=require('net')
const morgan=require("morgan")
const cookieParser=require("cookie-parser")
const authRoutes=require("./routes/Auth")
const productRoutes=require("./routes/Product")
const orderRoutes=require("./routes/Order")
const salesRequestRoutes=require("./routes/SalesRequest")
const cartRoutes=require("./routes/Cart")
const brandRoutes=require("./routes/Brand")
const categoryRoutes=require("./routes/Category")
const userRoutes=require("./routes/User")
const addressRoutes=require('./routes/Address')
const reviewRoutes=require("./routes/Review")
const wishlistRoutes=require("./routes/Wishlist")
const { connectToDB } = require("./database/db")
const { createRealtimeServer } = require("./realtime")


// server init
const server=express()
const frontendBuildPath=path.resolve(__dirname,"..","frontend","build")

const isAllowedLocalFrontend=(origin)=>{
    if(process.env.PRODUCTION==='true') return false

    try{
        const {protocol,hostname,port}=new URL(origin)
        if(protocol!=='http:' || !['','3000'].includes(port)) return false
        if(hostname==='localhost' || hostname==='127.0.0.1') return true
        if(isIP(hostname)!==4) return false

        const octets=hostname.split('.').map(Number)
        return octets[0]===10
            || (octets[0]===172 && octets[1]>=16 && octets[1]<=31)
            || (octets[0]===192 && octets[1]===168)
    }catch{
        return false
    }
}

const isAllowedFrontend=(origin)=>(
    !origin
    || origin===process.env.ORIGIN
    || isAllowedLocalFrontend(origin)
)

// database connection
connectToDB()


// middlewares
server.use(cors({
    origin:(origin,callback)=>{
        if(isAllowedFrontend(origin)){
            return callback(null,true)
        }
        return callback(new Error('Origin is not allowed by CORS'))
    },
    credentials:true,
    exposedHeaders:['X-Total-Count','X-total-Count'],
    methods:['GET','POST','PATCH','DELETE']
}))
server.use(express.json())
server.use(cookieParser())
server.use(morgan("tiny"))
server.use("/uploads/products",express.static(path.join(__dirname,"uploads","products"),{index:false,dotfiles:"deny"}))

// routeMiddleware
server.use("/api/auth",authRoutes)
server.use("/api/users",userRoutes)
server.use("/api/products",productRoutes)
server.use("/api/orders",orderRoutes)
server.use("/api/sales-requests",salesRequestRoutes)
server.use("/api/cart",cartRoutes)
server.use("/api/brands",brandRoutes)
server.use("/api/categories",categoryRoutes)
server.use("/api/address",addressRoutes)
server.use("/api/reviews",reviewRoutes)
server.use("/api/wishlist",wishlistRoutes)

server.get("/health",(req,res)=>{
    res.status(200).json({message:'running'})
})

server.use(express.static(frontendBuildPath))
server.get("*",(req,res,next)=>{
    if(/^\/(?:api|uploads|socket\.io)(?:\/|$)/.test(req.path)){
        return next()
    }
    res.sendFile(path.join(frontendBuildPath,"index.html"),(error)=>{
        if(error) next(error)
    })
})

const httpServer=http.createServer(server)
const io=createRealtimeServer(httpServer,isAllowedFrontend)
server.set('io',io)

const port=process.env.PORT || 8000
httpServer.listen(port,()=>{
    console.log(`server [STARTED] ~ http://localhost:${port}`);
})