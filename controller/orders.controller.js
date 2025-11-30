import { supabase, handleSupabaseError } from "../lib/supabaseClient.js";

export const getOrders = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                error: "User ID is required"
            });
        }

        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            return handleSupabaseError(res, error);
        }

        return res.status(200).json(data || []);
    } catch (error) {
        console.error("Error in getOrders controller:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

