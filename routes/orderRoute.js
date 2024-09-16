const express = require("express");
const orderModel = require("../models/orderModel");
const router = express.Router();

// Route to place order
router.post('/order/:userId',(req,res)=>{
    const userId = req.params.userId
    const {items,totalprice} = req.body
    try {
        const order= new orderModel({userId,totalprice,items})
        order.save()
        res.status(200).json({message:'order placed successfully',order})
    } catch (error) {
        res.status(500).json({message:'server error while placing order',error})
    }
})

// route to get all orders/admin
router.get('/orders',async (req,res)=>{
    try {
        const orders= await orderModel.find().populate('items.product').populate('userId')
        res.status(200).json({message:'got all orders',orders})
    } catch (error) {
        res.status(500).json({message:'server error while fetching all orders',error})
    }
})

// route to get my orders
router.get('/order/:userId',async (req,res)=>{
    const userId = req.params.userId
    try {
        const orders= await orderModel.find({userId}).populate('items.product').populate('userId')
        if(!orders){
            return res.status(404).json({message:'no orders found'})
        }
        return res.status(200).json({message:'got my orders',orders})
    } catch (error) {
        return res.status(500).json({message:'server error while fetching all orders',error})
    }
})

// route to update orderStatus
router.patch('/order/status/:orderId',async (req,res)=>{
    const {orderId} = req.params
    const {status}= req.body
    try {
        const order= await orderModel.findById(orderId)
        if(!order){
            return res.status(404).json({message:'order not found'})
        }
        order.status=status
        order.save()
        return res.status(200).json({message:'updated order status',order})
    } catch (error) {
        return res.status(500).json({message:'server error while updating order status',error})
    }
})

module.exports = router;
