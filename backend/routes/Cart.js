const express=require('express')
const cartController=require('../controllers/Cart')
const {verifyToken}=require('../middleware/VerifyToken')
const {requireVerified}=require('../middleware/RequireVerified')
const router=express.Router()

router.use(verifyToken,requireVerified)

router
    .post("/",cartController.create)
    .get("/user/:id",cartController.getByUserId)
    .patch("/:id",cartController.updateById)
    .delete("/:id",cartController.deleteById)
    .delete("/user/:id",cartController.deleteByUserId)

module.exports=router