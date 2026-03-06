"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { containsBadWords } from "@/lib/moderation"
import { NavbarMenu } from "@/components/navbar-menu"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, Check, ImagePlus, Zap, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import Image from "next/image"

const categories = [
  { value: "phones", labelKey: "cat.phones" },
  { value: "computers", labelKey: "cat.computers" },
  { value: "gaming", labelKey: "cat.gaming" },
  { value: "appliances", labelKey: "cat.appliances" },
  { value: "cars", labelKey: "cat.cars" },
  { value: "misc", labelKey: "cat.misc" },
]

const cities = [
  "Tunis", "Sousse", "Sfax", "Nabeul", "Monastir",
  "Bizerte", "Gabès", "Kairouan", "Gafsa", "Kasserine",
]

export default function SellPage() {
  const { t } = useLanguage()
  const { user, profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    marketPrice: "",
    category: "",
    city: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
        setStep(2)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
        setStep(2)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleSubmit = async () => {
    if (!user) return
    setErrorMsg("")
    setPublishing(true)

    if (containsBadWords(formData.title) || containsBadWords(formData.description)) {
      setErrorMsg("Votre annonce contient des termes bloqués par notre politique de modération.")
      setPublishing(false)
      return
    }

    let imageUrl = ""

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(fileName, imageFile)

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from("listing-images")
          .getPublicUrl(fileName)
        imageUrl = publicUrl
      }
    }

    const { error } = await supabase.from("listings").insert({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      market_price: formData.marketPrice ? parseFloat(formData.marketPrice) : null,
      category: formData.category,
      city: formData.city,
      images: imageUrl ? [imageUrl] : [],
      seller_id: user.id,
      status: "active",
    })

    if (!error) {
      setSubmitted(true)
      setStep(3)
    }

    setPublishing(false)
  }

  const isStep2Valid =
    formData.title.trim() !== "" &&
    formData.price.trim() !== "" &&
    formData.category !== "" &&
    formData.city !== ""

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavbarMenu />
        <div className="flex flex-col items-center justify-center pt-32 pb-20 px-6">
          <p className="text-lg text-neutral-400 mb-6">Connectez-vous pour publier une annonce</p>
          <Button onClick={() => router.push("/auth/login")} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8">
            Se connecter
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavbarMenu />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Progress */}
        <div className="mb-10 flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${step >= s
                  ? "bg-emerald-500 text-white"
                  : "bg-white/5 text-neutral-500 border border-white/10"
                  }`}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`h-px w-12 transition-colors ${step > s ? "bg-emerald-500" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Image */}
        {step === 1 && (
          <div
            className="group relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] p-10 transition-all hover:border-emerald-500/50 hover:bg-white/[0.04]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("image-input")?.click()}
          >
            <input
              id="image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <ImagePlus className="h-14 w-14 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
            <p className="text-lg font-medium text-neutral-300">{t("sell.uploadImage")}</p>
            <p className="text-sm text-neutral-500">{t("sell.dragDrop")}</p>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Image preview */}
            {imagePreview && (
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
                <Image src={imagePreview} alt="" fill className="object-contain" />
                <button
                  onClick={() => { setStep(1); setImagePreview(null); setImageFile(null) }}
                  className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white hover:bg-black/80 backdrop-blur-sm transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Changer
                </button>
              </div>
            )}

            {/* Form fields */}
            <div className="grid gap-5">
              {errorMsg && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-neutral-300">{t("sell.title")}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="iPhone 14 Pro Max 256GB"
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-neutral-300">{t("sell.description")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="État, accessoires inclus, raison de la vente..."
                  rows={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-300">{t("sell.price")}</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="650"
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-300">{t("sell.marketPrice")}</Label>
                  <Input
                    type="number"
                    value={formData.marketPrice}
                    onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
                    placeholder="900"
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-300">{t("sell.category")}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder={t("sell.category")} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-white/10">
                          {t(cat.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-neutral-300">{t("sell.city")}</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder={t("sell.city")} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10">
                      {cities.map((city) => (
                        <SelectItem key={city} value={city} className="text-white hover:bg-white/10">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isStep2Valid || publishing}
              className="h-14 w-full gap-2 bg-emerald-500 text-lg font-semibold text-white hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl"
            >
              {publishing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("sell.publishing")}
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  {t("sell.publish")}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && submitted && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              {t("sell.success")}
            </h2>
            <p className="mb-6 text-neutral-400">
              {formData.title} — {formData.price} TND
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStep(1)
                  setImagePreview(null)
                  setImageFile(null)
                  setFormData({ title: "", description: "", price: "", marketPrice: "", category: "", city: "" })
                  setSubmitted(false)
                }}
                variant="outline"
                className="gap-2 border-white/10 text-neutral-300 hover:bg-white/5"
              >
                <Zap className="h-4 w-4" />
                Nouvelle annonce
              </Button>
              <Button
                onClick={() => router.push("/dashboard/listings")}
                className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Mes annonces
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
