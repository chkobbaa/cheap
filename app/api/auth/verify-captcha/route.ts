import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 })
        }

        const secret = process.env.HCAPTCHA_SECRET_KEY
        const sitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

        console.log("Verifying hCaptcha token:", token.substring(0, 10) + "...")

        const response = await fetch("https://api.hcaptcha.com/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                secret: secret!,
                response: token,
                sitekey: sitekey!,
            }).toString(),
        })

        const data = await response.json()
        console.log("hCaptcha response data:", data)

        if (data.success) {
            return NextResponse.json({ success: true })
        } else {
            console.error("hCaptcha verification failed:", data["error-codes"])
            return NextResponse.json({ success: false, error: data["error-codes"] }, { status: 400 })
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
