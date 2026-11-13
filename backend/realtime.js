const jwt=require('jsonwebtoken')
const {Server}=require('socket.io')
const User=require('./models/User')

const createRealtimeServer=(httpServer,isAllowedFrontend)=>{
    const io=new Server(httpServer,{
        cors:{
            origin:(origin,callback)=>{
                if(isAllowedFrontend(origin)){
                    return callback(null,true)
                }
                return callback(new Error('Origin is not allowed by CORS'))
            },
            credentials:true
        }
    })

    io.use(async(socket,next)=>{
        try{
            const cookieHeader=socket.handshake.headers.cookie || ''
            const tokenCookie=cookieHeader
                .split(';')
                .map((cookie)=>cookie.trim())
                .find((cookie)=>cookie.startsWith('token='))
            const token=tokenCookie ? decodeURIComponent(tokenCookie.slice('token='.length)) : ''

            if(!token){
                return next(new Error('Authentication required'))
            }

            const decoded=jwt.verify(token,process.env.SECRET_KEY)
            const user=await User.findById(decoded._id).select('_id isAdmin isSalesperson isVerified')

            if(!user?.isVerified){
                return next(new Error('Authentication required'))
            }

            socket.data.user={
                id:String(user._id),
                isAdmin:Boolean(user.isAdmin),
                isSalesperson:Boolean(user.isSalesperson)
            }
            return next()
        }catch(error){
            console.error('Realtime socket authentication failed:',error.message)
            return next(new Error('Authentication failed'))
        }
    })

    io.on('connection',(socket)=>{
        const {id,isAdmin,isSalesperson}=socket.data.user
        socket.join(`user:${id}`)

        if(isAdmin) socket.join('admins')
        if(isSalesperson) socket.join(`salesperson:${id}`)
    })

    return io
}

module.exports={createRealtimeServer}
