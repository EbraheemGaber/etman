const allowedTypes=new Set(["image/jpeg","image/png","image/webp","image/gif"])
const maxFileSize=5*1024*1024

exports.uploadProductImage=(req,res,next)=>{
    const mimetype=(req.get("content-type") || "").split(";")[0].toLowerCase()
    if(!allowedTypes.has(mimetype)){
        return res.status(400).json({message:"Upload a JPEG, PNG, WebP, or GIF image"})
    }

    const contentLength=Number(req.get("content-length"))
    if(contentLength>maxFileSize){
        return res.status(413).json({message:"Image size must be 5 MB or less"})
    }

    const chunks=[]
    let size=0
    let tooLarge=false

    req.on("data",(chunk)=>{
        size+=chunk.length
        if(size>maxFileSize){
            tooLarge=true
            chunks.length=0
            return
        }
        if(!tooLarge) chunks.push(chunk)
    })

    req.on("end",()=>{
        if(tooLarge){
            return res.status(413).json({message:"Image size must be 5 MB or less"})
        }
        if(!size){
            return res.status(400).json({message:"Select an image to upload"})
        }
        req.file={buffer:Buffer.concat(chunks,size),mimetype}
        next()
    })

    req.on("error",next)
}
