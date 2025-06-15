const Cart =require("../models/cart");
require('../models/color');   

/*async function addToCart(userId,productId,quantity ){
        console.log(`Executing addToCart for userId: ${userId} with quantity: ${quantity}`); // <--- أضف هذا السطر

      quantity = Number(quantity);
  if (isNaN(quantity)) {
    throw new Error('Invalid quantity');
  }

    let product =await Cart.findOne({userId:userId,productId:productId});
    
    if(product){

        if(product.quantity+quantity <=0){
await removeFromCart(userId,productId);
        }
        else{   
        await Cart.findByIdAndUpdate(product._id,{
            quantity:product.quantity + quantity,
        });}
    }else{
        product=new Cart({
          userId:userId,
            productId:productId,
            quantity:quantity,

        });
        await product.save();
    }
    return await getCartItems(userId);
}
async function removeFromCart(userId,productId) {
    await Cart.findOneAndDelete({userId:userId,productId:productId});
    
}*/

/*async function addToCart(userId, productId, variantId, quantity) {
  console.log(`Executing addToCart for userId: ${userId} with quantity: ${quantity}`);

  quantity = Number(quantity);
  if (isNaN(quantity)) {
    throw new Error('Invalid quantity');
  }

  // ✅ دور على منتج بنفس المنتج ونفس الـ variant في الكارت
  let product = await Cart.findOne({ userId, productId, variantId });

  if (product) {
    if (product.quantity + quantity <= 0) {
      await removeFromCart(userId, productId, variantId);
    } else {
      await Cart.findByIdAndUpdate(product._id, {
        quantity: product.quantity + quantity,
      });
    }
  } else {
    product = new Cart({
      userId,
      productId,
      variantId, // ✅ أضفنا الـ variantId هنا
      quantity,
    });
    await product.save();
  }

  return await getCartItems(userId);
}*/


async function addToCart(req, res) {
  const { productId, variantId, quantity } = req.body;
  const userId = req.user.id;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items: [{ productId, variantId, quantity }]
    });
  } else {
    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, variantId, quantity });
    }
  }

  await cart.save();
  res.json({ status: "success", cart });
}







async function removeFromCart(userId, variantId) {
  return await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { variantId: variantId } } },
    { new: true }
  );
}







/*async function getCartItems(userId) {
  const products = await Cart.find({ userId:userId }).populate("productId");

  return products.map((item) => ({
    _id: item._id,
    product: item.productId, // بيانات المنتج
    quantity: item.quantity, // الكمية
  }));
  

}*/

/*async function getCartItems(userId) {
  const items = await Cart.find({ userId })
    .populate({
      path: "productId",
populate: {
      path: 'colors.colorId' // اختياري لو محتاج تفاصيل اللون
    }
    });

  return items.map((item) => {
    const product = item.productId;
    
    if (!product) {
      return {
        _id: item._id,
        title: "Unknown Product",
        price: 0,
        offerPrice: 0,
        quantity: item.quantity,
        image: null,
        variantId: item.variantId,
        productId: null,
      };
    }
console.log(product, item.variantId)
    const variant =
      product.colors?.find(
        (color) => color._id.toString() === item.variantId?.toString()
      ) || {};

    return {
      _id: item._id,
      title: product.title,
      price: product.price,
      offerPrice: product.offerPrice,
      quantity: item.quantity,
      image: variant.image || null,
      variantId: item.variantId,
      productId: product._id,
    };
  });
}*/

async function getCartItems(userId) {
  const cart = await Cart.findOne({ userId })
    .populate({
      path: "items.productId",
      populate: {
        path: "colors.colorId" // لو حابب تجيب بيانات اللون من موديل منفصل
      }
    });

  if (!cart || !cart.items || cart.items.length === 0) return [];

  return cart.items.map((item) => {
    const product = item.productId;

    if (!product) {
      return {
        _id: item._id,
        title: "Unknown Product",
        price: 0,
        offerPrice: 0,
        quantity: item.quantity,
        image: null,
        variantId: item.variantId,
        productId: null,
      };
    }

    const variant =
      product.colors?.find(
        (color) => color._id.toString() === item.variantId?.toString()
      ) || {};

    return {
      _id: item._id,
      title: product.title,
      price: product.price,
      offerPrice: product.offerPrice,
      quantity: item.quantity,
      image: variant.image || null,
      variantId: item.variantId,
      productId: product._id,
    };
  });
}

module.exports={addToCart,removeFromCart,getCartItems};



///لسه متجربش
  /*const clearCart = async (userId) => {
  return await Cart.deleteMany({ user: userId }); // أو حسب اسم الموديل عندك
};*/