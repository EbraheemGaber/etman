const express=require('express')
const orderController=require("../controllers/Order")
const { verifyToken } = require('../middleware/VerifyToken')
const { requireAdmin } = require('../middleware/RequireAdmin')
const { requireVerified } = require('../middleware/RequireVerified')
const router=express.Router()

router.use(verifyToken,requireVerified)

router.post("/",orderController.create)
router.get("/statistics",requireAdmin,orderController.getStatistics)
router.get("/",requireAdmin,orderController.getAll)
router.get("/user/:id",orderController.getByUserId)
router.patch("/:id",requireAdmin,orderController.updateById)

module.exports=router