import { supabase, handleSupabaseError } from "../lib/supabaseClient.js";

export const getProducts = async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*, seller: profiles(name)")
            .order("created_at", { ascending: false });

        if (error) {
            return handleSupabaseError(res, error);
        }

        return res.status(200).json(data || []);
    } catch (error) {
        console.error("Error in getProducts controller:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const createProduct = async (req, res) => {
    try {
        const payload = req.body;

        if (!payload) {
            return res.status(400).json({
                error: "Product data is required"
            });
        }

        const { data, error } = await supabase
            .from("products")
            .insert([payload])
            .select();

        if (error) {
            return handleSupabaseError(res, error);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error in createProduct controller:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const updateProductStock = async (req, res) => {
    try {
        const { productId, change } = req.body;

        if (!productId || change === undefined) {
            return res.status(400).json({
                error: "Product ID and change are required"
            });
        }

        // First, fetch the current stock
        const { data: current, error: fetchError } = await supabase
            .from("products")
            .select("stock")
            .eq("id", productId)
            .single();

        if (fetchError) {
            return handleSupabaseError(res, fetchError);
        }

        const newStock = (current?.stock ?? 0) + change;

        const { data, error } = await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", productId)
            .select();

        if (error) {
            return handleSupabaseError(res, error);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error in updateProductStock controller:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                error: "Product ID is required"
            });
        }

        const { data, error } = await supabase
            .from("products")
            .delete()
            .eq("id", productId)
            .select();

        if (error) {
            return handleSupabaseError(res, error);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error in deleteProduct controller:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

