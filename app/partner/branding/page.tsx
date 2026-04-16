import { getMyPartnerBranding } from "@/lib/actions/partner-branding"
import { BrandingForm } from "./BrandingForm"

export const metadata = {
  title: "Branding — Partner Portal | Protekon",
}

export default async function PartnerBrandingPage() {
  const current = await getMyPartnerBranding()

  return (
    <div className="p-6 lg:p-8 max-w-[880px]">
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] text-midnight mb-2">White-Label Branding</h1>
        <p className="font-sans text-[15px] text-steel max-w-[640px]">
          Customize how your clients see Protekon. Upload your logo, pick your brand colors, and choose
          whether to hide Protekon attribution. Changes apply to client emails and downloadable sample
          documents immediately on save.
        </p>
      </div>

      <BrandingForm initial={current} />
    </div>
  )
}
