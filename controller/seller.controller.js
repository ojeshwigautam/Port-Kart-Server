import { supabase, handleSupabaseError } from "../lib/supabaseClient.js";

export const getMyProducts = async (req, res) => {
    try {
        const { sellerId } = req.body;

        if (!sellerId) {
            return res.status(400).json({
                error: "Seller ID is required"
            });
        }

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("seller_id", sellerId)
            .order("created_at", { ascending: false });

        if (error) {
            return handleSupabaseError(res, error);
        }

        return res.status(200).json(data || []);
    } catch (error) {
        console.error("Error in getMyProducts controller:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const getSellingHistory = async (req, res) => {
    try {
        const { sellerId } = req.body;

        if (!sellerId) {
            return res.status(400).json({
                error: "Seller ID is required"
            });
        }

        const { data, error } = await supabase
            .from("orders")
            .select("*, products(title, price)")
            .eq("seller_id", sellerId)
            .order("created_at", { ascending: false });

        if (error) {
            return handleSupabaseError(res, error);
        }

        return res.status(200).json(data || []);
    } catch (error) {
        console.error("Error in getSellingHistory controller:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

