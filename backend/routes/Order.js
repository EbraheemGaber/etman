const express=require('express')
const orderController=require("../controllers/Order")
const { verifyToken } = require('../middleware/VerifyToken')
const { requireAdmin } = require('../middleware/RequireAdmin')
const router=express.Router()


router
    .post("/",orderController.create)
    .get("/statistics",verifyToken,requireAdmin,orderController.getStatistics)
    .get("/",orderController.getAll)
    .get("/user/:id",orderController.getByUserId)
    .patch("/:id",orderController.updateById)


module.exports=router