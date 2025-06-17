const Cart =require("../models/cart");
require('../models/color');   



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



async function getCartItems(userId) {
  const cart = await Cart.findOne({ userId })
    .populate({
      path: "items.productId",
      populate: {
        path: "colors.colorId"       
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

 const clearCart = async (userId) => {
  return await Cart.deleteMany({ user: userId }); 
};

module.exports={addToCart,removeFromCart,getCartItems,clearCart};


 