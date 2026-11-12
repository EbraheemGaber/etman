const express=require("express")
const wishlistController=require("../controllers/Wishlist")
const {verifyToken}=require("../middleware/VerifyToken")
const {requireVerified}=require("../middleware/RequireVerified")
const router=express.Router()

router.use(verifyToken,requireVerified)

router
    .post("/",wishlistController.create)
    .get("/user/:id",wishlistController.getByUserId)
    .patch("/:id",wishlistController.updateById)
    .delete("/:id",wishlistController.deleteById)

module.exports=router