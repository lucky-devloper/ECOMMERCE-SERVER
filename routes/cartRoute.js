const express = require("express");
const cartModel = require("../models/cartModel");
const router = express.Router();

// Route to add product to cart
router.post('/cart/add/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { product, quantity } = req.body;
  try {
    let cart = await cartModel.findOne({ userId }).populate('items.product');
    if (!cart) {
      cart = new cartModel({ userId, items: [{ product, quantity }] });
    } else {
      cart.items.push({ product, quantity });
    }
    
    await cart.save(); // Await the save operation
    await cart.populate('items.product'); // Populate after saving

    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error while adding item to cart', error });
  }
});

// Route to remove product from cart
router.patch('/cart/remove/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { productId } = req.body;
  try {
    const cart = await cartModel.findOne({ userId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' }); // Return to prevent further execution
    }

    cart.items = cart.items.filter((item) => item.product._id.toString() !== productId); // Filter out the item
    await cart.save(); // Await the save operation

    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error while removing item from cart', error });
  }
});

// Route to find a cart
router.get('/cart/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    let cart = await cartModel.findOne({ userId }).populate('items.product');
    if (!cart) {
       cart= new cartModel({userId,items:[]})
    }
    await cart.save()
    return res.status(200).json({ message: 'Cart found', cart });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while getting cart', error });
  }
});

// route to update quantity in cart
router.patch('/cart/quantity/:userId',async(req,res)=>{
  const userId= req.params.userId
  const { productId,quantity } = req.body;
  try {
    const cart = await cartModel.findOne({ userId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    let cartitem = cart.items.find((item) => item.product._id == productId)
    cartitem.quantity=quantity
    await cart.save()
    return res.status(200).json({ message: 'Cart item qunatity updated', cart });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while updating quantity', error });
  }
})

// Route to clear cart
router.delete('/cart/clear/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const cart = await cartModel.findOne({ userId })
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = []; 
    await cart.save();

    return res.status(200).json({ message: 'Cart cleared', cart });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while clearing cart', error });
  }
});


// route to update the cart
router.patch('/cart/update/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { items } = req.body;

  // Validate the items array
  if (!Array.isArray(items) || items.some(item => !item.product || !item.quantity)) {
    return res.status(400).json({ message: 'Invalid items format' });
  }

  try {
    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      cart = new cartModel({ userId, items });
    } else {
      cart.items = items;
    }

    await cart.save();
    res.status(200).json({ message: 'Cart updated', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating cart', error });
  }
});


module.exports = router;
