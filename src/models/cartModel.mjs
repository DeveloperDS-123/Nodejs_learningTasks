import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
  quantity: Number,
  price: Number,
});

const cartSchema = new mongoose.Schema({
  userId: String,
  items: [cartItemSchema],
  totalPrice: Number,
  totalProducts: { type: Number, default: 0 }, // Adding the totalProducts field
});

// Define a pre-save hook to update the totalProducts field
cartSchema.pre('save', function(next) {
  // Calculate the total number of products
  const totalProducts = this.items.reduce((acc, item) => acc + item.quantity, 0);
  // Update the totalProducts field
  this.totalProducts = totalProducts;
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
