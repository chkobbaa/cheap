import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { seedProducts } from "@/lib/seed-products"

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service key to bypass RLS for inserting users/profiles if needed

        // If no service key, we can try Anon key but we might hit RLS for creating a dummy seller
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        const headerAuth = request.headers.get("Authorization")
        const passedKey = headerAuth?.replace("Bearer ", "")

        if (passedKey !== "MY_SECRET_SEED_KEY_123") {
            return NextResponse.json({ error: "Unauthorized endpoint" }, { status: 401 })
        }

        // Initialize Supabase with Service Role to bypass RLS securely server-side
        // Wait, the user might not have SUPABASE_SERVICE_ROLE_KEY configured in their .env
        // So we will just use the anon key. If RLS blocks inserting profiles, we'll use a known existing user ID 
        // Wait, the safest way is forcing the user to give an existing user_id in the body

        const body = await request.json()
        const { seller_id, access_token } = body

        if (!seller_id || !access_token) {
            return NextResponse.json({ error: "Missing seller_id or access_token parameter in body" }, { status: 400 })
        }

        const supabase = createClient(
            supabaseUrl!,
            supabaseAnonKey!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                }
            }
        )

        // Pre-process seed data to include seller_id and randomized boost for testing
        const formattedProducts = seedProducts.map((p, index) => {
            // Randomly boost 15% of seed products
            const isBoosted = Math.random() > 0.85
            const boostAmount = isBoosted ? [10, 20, 50][Math.floor(Math.random() * 3)] : 0
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + (boostAmount / 2))

            return {
                ...p,
                seller_id: seller_id,
                status: "active",
                boost_amount: boostAmount,
                boost_expires_at: isBoosted ? expiresAt.toISOString() : null,
                created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString() // Random date in last 30 days
            }
        })

        // Batch insert into listings
        const { error } = await supabase.from("listings").insert(formattedProducts)

        if (error) {
            console.error("Supabase insert error:", JSON.stringify(error, null, 2))
            return NextResponse.json({ error: error.message, details: error }, { status: 500 })
        }

        return NextResponse.json({ message: `Successfully seeded ${formattedProducts.length} products.` })

    } catch (err: any) {
        console.error("Seed endpoint caught error:", err)
        return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 })
    }
}
