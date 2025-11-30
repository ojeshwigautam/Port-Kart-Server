import { supabase, handleSupabaseError } from "../lib/supabaseClient.js";

export const dummyCheckout = async (req, res) => {
    try {
        const { userId, address } = req.body;

        if (!userId || !address) {
            return res.status(400).json({
                error: "User ID and Address are required"
            });
        }

        // Get cart items with product details
        const { data: cartItems, error: cartError } = await supabase
            .from("cart_items")
            .select("product_id, quantity, products(stock, price, title, seller_id)")
            .eq("user_id", userId);

        if (cartError) {
            return handleSupabaseError(res, cartError);
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                error: "Ye can't checkout an empty cart, Sailor!"
            });
        }

        // Prepare order inserts
        const orderInserts = cartItems.map((item) => {
            const product = item.products;
            if (!product) {
                throw new Error(`Product not found for cart item with product_id: ${item.product_id}`);
            }
            return {
                user_id: userId,
                product_id: item.product_id,
                quantity: item.quantity,
                total_price: product.price * item.quantity,
                address,
                product_name: product.title,
                seller_id: product.seller_id,
            };
        });

        // Create orders
        const { error: orderError } = await supabase
            .from("orders")
            .insert(orderInserts);

        if (orderError) {
            return res.status(500).json({
                error: "Failed to place order: " + orderError.message
            });
        }

        // Update stock for each product
        for (const item of cartItems) {
            const product = item.products;
            if (!product) {
                console.error("Product not found for cart item:", item.product_id);
                continue;
            }
            const newStock = product.stock - item.quantity;
            const { error: stockError } = await supabase
                .from("products")
                .update({ stock: newStock })
                .eq("id", item.product_id);

            if (stockError) {
                console.error("Error updating stock for product:", item.product_id, stockError);
                // Continue with other products even if one fails
            }
        }

        // Clear cart
        const { error: deleteError } = await supabase
            .from("cart_items")
            .delete()
            .eq("user_id", userId);

        if (deleteError) {
            console.error("Error clearing cart:", deleteError);
            // Still return success as orders were created
        }

        // Return confirmation
        return res.status(200).json({
            success: true,
            message: `Order placed! We be sailin' to ${address}.`,
        });
    } catch (error) {
        console.error("Error in dummyCheckout controller:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};