const express=require('express')
const productController=require("../controllers/Product")
const { verifyToken }=require("../middleware/VerifyToken")
const { requireAdmin }=require("../middleware/RequireAdmin")
const { uploadProductImage }=require("../middleware/ProductImageUpload")
const router=express.Router()

router
    .post("/images/upload",verifyToken,requireAdmin,uploadProductImage,productController.uploadImage)
    .post("/",productController.create)
    .get("/",productController.getAll)
    .get("/:id",productController.getById)
    .patch("/:id",productController.updateById)
    .patch("/undelete/:id",productController.undeleteById)
    .delete("/:id",productController.deleteById)

module.exports=router