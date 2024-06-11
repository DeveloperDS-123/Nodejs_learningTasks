import cartmodel from "../models/cartModel.mjs"
import product from  "../models/productModel.mjs"


const createCart = async (req, res) => {
  try {
    const { productId, quantity, userId } = req.body;

    // Convert quantity to a number if it's a string
    const parsedQuantity = parseInt(quantity, 10);

    // Fetch the product from the Product collection
    const productItem = await product.findById(productId);
    if (!productItem) {
      return res.status(400).json({ message: "Product not found" });
    }

    // Fetch the cart for the user
    let cart = await cartmodel.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // If the product already exists in the cart, update the quantity
        cart.items[itemIndex].quantity += parsedQuantity;
        cart.items[itemIndex].price = productItem.price * cart.items[itemIndex].quantity;
      } else {
        // If the product does not exist in the cart, add a new item
        cart.items.push({
          productId,
          quantity: parsedQuantity,
          price: productItem.price * parsedQuantity,
        });
      }
    } else {
      // If the user does not have a cart, create a new cart
      cart = new cartmodel({
        userId,
        items: [
          {
            productId,
            quantity: parsedQuantity,
            price: productItem.price * parsedQuantity,
          },
        ],
        totalPrice: productItem.price * parsedQuantity,
        totalProducts: parsedQuantity, // Set totalProducts for a new cart
      });
    }

    // Update the total number of products
    cart.totalProducts = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    // Update the total price
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price, 0);
    cart = await cart.save();

    return res.status(201).send(cart);
  } catch (error) {
    console.log("Error is", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

  

const removeCart = async (req, res) => {
    try {
        const { productId, userId } = req.body
        // const userId = req.user._id

        let cart = await cartmodel.findOne({ userId })

        if (cart) {
            const itemIndex = cart.items.findIndex(
                (item) => item.productId.toString() === productId
            )

            if (itemIndex > -1) {
                cart.items.splice(itemIndex, 1)
                cart.totalPrice = cart.items.reduce(
                    (acc, item) => acc + item.price,
                    0
                )
                cart = await cart.save()
                return res.status(200).send(cart)
            } else {
                return res
                    .status(404)
                    .send({ message: "Item not found in cart" })
            }
        } else {
            return res.status(404).send({ message: "Cart not found" })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "Internal server error" })
    }
}

const getCart = async (req, res) => {
    try {
        const {userId} = req.body;

        let cart = await cartmodel.findOne({ userId }).populate("items.productId")

        if (cart) {
            return res.status(200).send(cart)
        } else {
            return res.status(404).send({ message: "Cart not found" })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "Internal server error" })
    }
}



const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params; // Get the productId from the request parameters
    const { userId } = req.body; // Assuming userId is extracted from the request headers

    console.log("userrrrrrrrrrrrrrrr", userId);
    console.log("queryyy000000000000000000000000", productId);  productId

    // Find the cart for the user
    let cart = await cartmodel.findOne({ userId });
    console.log("cartttttt00000000000", cart);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the index of the item to be removed
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString() // Convert both to strings for comparison
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in the cart" });
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    // Update totalProducts and totalPrice
    cart.totalProducts = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price, 0);

    // Save the updated cart
    cart = await cart.save();

    return res.status(200).json({ message: "Item removed from the cart", cart });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

 




export { createCart, removeCart, getCart, removeCartItem }
