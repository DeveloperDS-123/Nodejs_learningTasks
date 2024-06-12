import Cart from "../models/cartModel.mjs"
import Stock from "../models/stockModel.mjs"

// Function to generate a unique invoice number
const generateInvoiceNumber = () => {
    return `INV-${Date.now()}`
}

const createCart = async (req, res) => {
    try {
        const userId = req.user.userId
        const { products } = req.body

        // Validate input
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Invalid input" })
        }

        let totalPriceWithoutTax = 0
        let totalProducts = 0
        let totalPriceWithTax = 0
        const itemsDetails = [] // Store details of each stock item

        console.log("Received products:", products)

        for (const stockItem of products) {
            const itemId = stockItem.itemId

            const requestedQuantity = parseInt(stockItem.quantity, 10) // Convert quantity to a number

            console.log(
                `Processing stock item with ID: ${itemId}, Quantity: ${requestedQuantity}`
            )

            const stock = await Stock.findById(itemId).populate({
                path: "productId",
                populate: {
                    path: "taxId",
                    model: "tax",
                },
            })

            if (!stock) {
                return res
                    .status(400)
                    .json({ message: `Stock item with ID ${itemId} not found` })
            }

            if (requestedQuantity > stock.quantity) {
                return res.status(400).json({
                    message: `Item with ID ${itemId} is out of stock. Available quantity: ${stock.quantity}`,
                })
            }

            const product = stock.productId
            const tax = product.taxId

            if (!product || !tax) {
                return res.status(400).json({
                    message: `Product or tax information not found for stock item with ID ${itemId}`,
                })
            }

            const taxRate = tax.type === "percentage" ? tax.value / 100 : 0
            const productTotalPriceWithoutTax = stock.price * requestedQuantity
            let productTotalPriceWithTax =
                tax.type === "fixed"
                    ? productTotalPriceWithoutTax + tax.value
                    : productTotalPriceWithoutTax * (1 + taxRate)

            productTotalPriceWithTax = parseFloat(
                productTotalPriceWithTax.toFixed(2)
            )

            // Add details of the stock item
            itemsDetails.push({
                productId: product._id,
                stockId: stock._id,
                quantity: requestedQuantity,
                priceWithTax: productTotalPriceWithTax,
                priceWithoutTax: productTotalPriceWithoutTax,
            })

            totalProducts += requestedQuantity
            totalPriceWithoutTax += productTotalPriceWithoutTax
            totalPriceWithTax += productTotalPriceWithTax
        }
        console.log(`Updated total products: ${totalProducts}`)
        // Create the cart
        const newCart = new Cart({
            userId: userId,
            invoiceNumber: generateInvoiceNumber(),
            products: itemsDetails, // Update to include detailed stock items
            totalPriceWithTax,
            totalPriceWithoutTax,
            totalProducts,
        })
        console.log("Final total products:", newCart.totalProducts)
        await newCart.save()

        res.status(201).json(newCart)
    } catch (error) {
        console.error("Error creating cart:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const listCart = async (req, res) => {
    try {
        const { page = 1, limit = 10, invoiceNumber, userId } = req.query // Default values for page and limit
        console.log("invoiceNumber", invoiceNumber)
        console.log(page)
        console.log(limit)
        console.log(req.query)

        let query = {}
        let skip = (parseInt(page) - 1) * parseInt(limit)

        if (invoiceNumber) {
            query.invoiceNumber = invoiceNumber
        }
        if (userId) {
            query.userId = userId
        }
        const totalResults = await Cart.countDocuments(query)
        const totalPages = Math.ceil(totalResults / limit)

        const cartList = await Cart.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .lean()
        res.status(200).json({
            message: "Cart list",
            productList: cartList,
            page: parseInt(page),
            limit: parseInt(limit),
            skip: skip,
            totalPages: totalPages,
            totalResults: totalResults,
        })
    } catch (error) {
        console.error("Error listing cart:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export { createCart, listCart }

// const createCart = async (req, res) => {
//   try {
//     const { productId, quantity, userId } = req.body;

//     // Convert quantity to a number if it's a string
//     const parsedQuantity = parseInt(quantity, 10);

//     // Fetch the product from the Product collection
//     const productItem = await product.findById(productId);
//     if (!productItem) {
//       return res.status(400).json({ message: "Product not found" });
//     }

//     // Fetch the cart for the user
//     let cart = await cartmodel.findOne({ userId });

//     if (cart) {
//       const itemIndex = cart.items.findIndex(
//         (item) => item.productId.toString() === productId
//       );

//       if (itemIndex > -1) {
//         // If the product already exists in the cart, update the quantity
//         cart.items[itemIndex].quantity += parsedQuantity;
//         cart.items[itemIndex].price = productItem.price * cart.items[itemIndex].quantity;
//       } else {
//         // If the product does not exist in the cart, add a new item
//         cart.items.push({
//           productId,
//           quantity: parsedQuantity,
//           price: productItem.price * parsedQuantity,
//         });
//       }
//     } else {
//       // If the user does not have a cart, create a new cart
//       cart = new cartmodel({
//         userId,
//         items: [
//           {
//             productId,
//             quantity: parsedQuantity,
//             price: productItem.price * parsedQuantity,
//           },
//         ],
//         totalPrice: productItem.price * parsedQuantity,
//         totalProducts: parsedQuantity, // Set totalProducts for a new cart
//       });
//     }

//     // Update the total number of products
//     cart.totalProducts = cart.items.reduce((acc, item) => acc + item.quantity, 0);

//     // Update the total price
//     cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price, 0);
//     cart = await cart.save();

//     return res.status(201).send(cart);
//   } catch (error) {
//     console.log("Error is", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const deleteCart = async (req, res) => {
//     try {
//         const { productId, userId } = req.body
//         // const userId = req.user._id

//         let cart = await cartmodel.findOne({ userId })

//         if (cart) {
//             const itemIndex = cart.items.findIndex(
//                 (item) => item.productId.toString() === productId
//             )

//             if (itemIndex > -1) {
//                 cart.items.splice(itemIndex, 1)
//                 cart.totalPrice = cart.items.reduce(
//                     (acc, item) => acc + item.price,
//                     0
//                 )
//                 cart = await cart.save()
//                 return res.status(200).send(cart)
//             } else {
//                 return res
//                     .status(404)
//                     .send({ message: "Item not found in cart" })
//             }
//         } else {
//             return res.status(404).send({ message: "Cart not found" })
//         }
//     } catch (error) {
//         console.error(error)
//         return res.status(500).send({ message: "Internal server error" })
//     }
// }

// const getCart = async (req, res) => {
//     try {
//         const {userId} = req.body;

//         let cart = await cartmodel.findOne({ userId }).populate("items.productId")

//         if (cart) {
//             return res.status(200).send(cart)
//         } else {
//             return res.status(404).send({ message: "Cart not found" })
//         }
//     } catch (error) {
//         console.error(error)
//         return res.status(500).send({ message: "Internal server error" })
//     }
// }

// const deleteCartItem = async (req, res) => {
//   try {
//     const { productId } = req.params; // Get the productId from the request parameters
//     const { userId } = req.body; // Assuming userId is extracted from the request headers

//     console.log("userrrrrrrrrrrrrrrr", userId);
//     console.log("queryyy000000000000000000000000", productId);  productId

//     // Find the cart for the user
//     let cart = await cartmodel.findOne({ userId });
//     console.log("cartttttt00000000000", cart);

//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     // Find the index of the item to be removed
//     const itemIndex = cart.items.findIndex(
//       (item) => item.productId.toString() === productId.toString() // Convert both to strings for comparison
//     );

//     if (itemIndex === -1) {
//       return res.status(404).json({ message: "Item not found in the cart" });
//     }

//     // Remove the item from the cart
//     cart.items.splice(itemIndex, 1);

//     // Update totalProducts and totalPrice
//     cart.totalProducts = cart.items.reduce((acc, item) => acc + item.quantity, 0);
//     cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price, 0);

//     // Save the updated cart
//     cart = await cart.save();

//     return res.status(200).json({ message: "Item removed from the cart", cart });
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// export { createCart, deleteCart, getCart, deleteCartItem }
