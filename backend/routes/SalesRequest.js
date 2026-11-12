const express=require("express")
const controller=require("../controllers/SalesRequest")
const {verifyToken}=require("../middleware/VerifyToken")
const {requireAdmin}=require("../middleware/RequireAdmin")
const {requireSalesperson}=require("../middleware/RequireSalesperson")
const router=express.Router()

router.use(verifyToken)
router.get("/statistics",requireSalesperson,controller.getStatistics)
router.patch("/target",requireSalesperson,controller.updateSalesTarget)
router.post("/visits",requireSalesperson,controller.logCustomerVisit)
router.get("/mine",requireSalesperson,controller.getMine)
router.post("/",requireSalesperson,controller.create)
router.get("/",requireAdmin,controller.getAll)
router.patch("/:id/status",requireAdmin,controller.updateStatus)

module.exports=router
