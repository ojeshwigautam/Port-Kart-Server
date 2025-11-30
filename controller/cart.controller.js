import { supabase, handleSupabaseError } from "../lib/supabaseClient.js";

export const addToCart = async (req, res) => {
    try{
        const { userId, productId } = req.body;

        if (!userId || !productId){
            return res.status(500).json({
                error: "User ID and Product ID are required"
            });
        }

        const { data, error } = await supabase.rpc("add_to_cart", {
            uid: userId,
            pid: productId,
        });

        if (error){
            handleSupabaseError(res, error);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error in addToCart controller");
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const getCartItems = async (req, res) => {
    try{
        const { userId } = req.body;

        if (!userId){
            return res.status(500).json({
                error: "User ID is required"
            })
        }

        const { data, error } = await supabase
          .from("cart_items")
          .select("*, product: products(title, price)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
  
        if (error){
            handleSupabaseError(res, error);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error in getCartIems controller: ", error);
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const updateCartQuantity = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        
        if (!userId || !productId || !quantity){
            return res.status(500).json({
                error: "User ID, Product ID and Quantity are required"
            })
        }

        const { data, error } = await supabase.rpc("update_cart_quantity", {
            uid: userId,
            pid: productId,
            qty: quantity,
        });

        if (error){
            handleSupabaseError(res, error);
        }

        return res.status(200).json(data);
    } catch (error){
        console.error("Error at updataeCartQuantity controller: ", error);
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        
        if (!userId || !productId){
            return res.status(500).json({
                error: "User ID and Product ID are required"
            })
        }

        const { data, error } = await supabase.rpc("remove_from_cart", {
            uid: userId,
            pid: productId,
        });

        if (error){
            handleSupabaseError(res, error);
        }

        return res.status(200).json(data);
    } catch (error){
        console.error("Error at removeFromCart controller: ", error);
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}