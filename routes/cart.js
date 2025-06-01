const {getCart,addToCart , getCartItems, removeFromCart}=require("./../handelers/cart-handler");
const express = require('express');

const router=express.Router();


router.get("/cart", async(req,res)=>{
    console.log(req.user);
    const userId=req.user.id;
    const items=await getCartItems(userId);
    res.send(items);
});

router.post("/cart/:id", async(req,res)=>{
    
    console.log(req.user);
    const userId=req.user.id;
    //const userId = req.user?.id || "665b1234567890abcdef1234"; 

        const productId=req.params.id;
        const quantity=req.body.quantity;

    const items=await addToCart(userId,productId,quantity);
    res.send(items);
});
router.delete("/cart/:id", async(req,res)=>{
    console.log(req.user);
    const userId=req.user.id;
    const productId=req.params.id;

    const items=await removeFromCart(userId,productId);
    res.send(items);
});



module.exports=router;