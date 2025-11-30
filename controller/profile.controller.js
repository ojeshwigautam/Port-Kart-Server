import { supabase, handleSupabaseError } from "../lib/supabaseClient.js";

const SELLER_SECRET = process.env.SELLER_SECRET;

export const createUserProfile = async (req, res) => {
    try{
        const {id, name, email, role="customer", sellerCode} = req.body;

        if (!id || !name || !email){
            return res.status(400).json({
                error: "Credentials are required"
            })
        }

        // Validate seller secret on backend
        let finalRole = role;
        if (role === "seller") {
            if (!sellerCode) {
                return res.status(400).json({
                    error: "Seller code is required for seller registration"
                });
            }
            if (sellerCode !== SELLER_SECRET) {
                return res.status(403).json({
                    error: "Invalid seller code"
                });
            }
        } else {
            // Ensure non-seller roles are set to customer
            finalRole = "customer";
        }

        const {data, error} = await supabase.from("profiles").insert([{id, name, email, role: finalRole}]).select();

        if (error){
            return handleSupabaseError(res, error);
        }

        return res.status(201).json(data);
    }
    catch (error){
        console.error("Error in createUserProfile controller: ", error);
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}

export const getUserProfile = async (req, res) => {
    try{
        const { userId } = req.body;

        if (!userId){
            return res.status(400).json({
                error: "User ID is required"
            });
        }
        const {data, error} = await supabase.from("profiles").select("name, role").eq("id", userId).single();

        if (error){
            return handleSupabaseError(res, error);
        }

        return res.status(200).json(data);
    } catch (error){
        console.error("Error in getUserProfile controller: ", error);
        return res.status(500).json({
            error: "Internal server error"
        }) 
    }
}

export const getTotalUsers = async (req, res) => {
    try{
        const {data, error} = await supabase.from("profiles").select("*", { count: "exact" });
        
        if (error){
            return handleSupabaseError(res, error);
        }

        res.status(200).json(data);
    } catch (error){
        console.error("Error in getTotalUsers controller: ", error);
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}