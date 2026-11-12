const express=require("express")
const userController=require("../controllers/User")
const { verifyToken }=require("../middleware/VerifyToken")
const { requireAdmin }=require("../middleware/RequireAdmin")
const { requireSalesperson }=require("../middleware/RequireSalesperson")
const router=express.Router()

router
    .get("/admin/salespeople",verifyToken,requireAdmin,userController.getSalespeople)
    .patch("/admin/salespeople/:id",verifyToken,requireAdmin,userController.setSalesperson)
    .get("/customers",verifyToken,requireSalesperson,userController.searchCustomers)
    .post("/customers",verifyToken,requireSalesperson,userController.createCustomer)
    .get("/:id",verifyToken,userController.getById)
    .patch("/:id",verifyToken,userController.updateById)

module.exports=router