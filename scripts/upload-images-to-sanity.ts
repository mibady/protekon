/**
 * Download images from URLs and upload to Sanity as cover images
 * Run: npx tsx scripts/upload-images-to-sanity.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_API_DATASET
const TOKEN = process.env.SANITY_API_WRITE_TOKEN

if (!PROJECT_ID || !DATASET || !TOKEN) {
  console.error("Missing SANITY env vars")
  process.exit(1)
}

const ASSETS_API = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${DATASET}`
const MUTATE_API = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`

interface ImageAssignment {
  contentId: number
  docType: "blog" | "resource"
  url: string
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function uploadToSanity(imageBuffer: Buffer, filename: string): Promise<string> {
  const res = await fetch(`${ASSETS_API}?filename=${filename}`, {
    method: "POST",
    headers: {
      "Content-Type": "image/jpeg",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: imageBuffer,
  })
  const data = await res.json()
  if (!res.ok) {
    console.error("Upload error:", JSON.stringify(data, null, 2))
    throw new Error(`Upload failed: ${res.status}`)
  }
  return data.document._id
}

async function patchDocument(docId: string, imageAssetId: string) {
  const res = await fetch(MUTATE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      mutations: [{
        patch: {
          id: docId,
          set: {
            coverImage: {
              _type: "image",
              asset: { _type: "reference", _ref: imageAssetId },
            },
          },
        },
      }],
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error("Patch error:", JSON.stringify(data, null, 2))
  }
  return data
}

async function processAssignment(assignment: ImageAssignment) {
  const prefix = assignment.docType === "blog" ? "blog" : "resource"
  const docId = `${prefix}-${assignment.contentId}`
  const filename = `protekon-cover-${assignment.contentId}.jpg`

  try {
    console.log(`  Downloading image for ${docId}...`)
    const buffer = await downloadImage(assignment.url)

    console.log(`  Uploading to Sanity (${(buffer.length / 1024).toFixed(0)}KB)...`)
    const assetId = await uploadToSanity(buffer, filename)

    console.log(`  Patching ${docId} with coverImage...`)
    await patchDocument(docId, assetId)

    console.log(`  ✅ ${docId} — image attached`)
    return true
  } catch (err: any) {
    console.error(`  ❌ ${docId} — ${err.message}`)
    return false
  }
}

// ─── Image Assignments ───
// Map content IDs to generated image URLs (themed groups share images)

const assignments: ImageAssignment[] = [
  // Pillars (108-115)
  { contentId: 108, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e78/bMVeSlIXR7wFwzBsjfosQ_442a4e736c1c488abbbf317a697e50c5.jpg" },
  { contentId: 109, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e78/uXuVoItE-ksAfiJJ-r_S5_912560c10d064c2ba49de619b84b4719.jpg" },
  { contentId: 110, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e78/v8QTsbTnhfKqivLjDOP7w_146794e54fa64f8c91d5fb3e698f054a.jpg" },
  { contentId: 111, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e78/HIOAuURd7h8vnlVAhYL3h_790fdccc124b4352ae7297fbe94c4acb.jpg" },
  { contentId: 112, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e79/xJUMGR3QqDvqPt8Ng75wo_a118978919eb425d904845e5ba1be649.jpg" },
  { contentId: 113, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e79/_pELdsH3Zhu64xnq08CMy_5c9d74d91de04a9eaa7fe15f807594ad.jpg" },
  { contentId: 114, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e79/7UU1yDm-5eGQxy4zNnh_H_a4f24022c5d4430a8ff2764733334f77.jpg" },
  { contentId: 115, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e79/4Ty7rsXS4yy0hA9T47L8c_03dba27de1534796a451cba393f85280.jpg" },
  // Domain deep dives (116-122)
  { contentId: 116, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e7a/Dm_4tesYm-NTyw8WuSMli_6cb15a5348154c8bb0f2a62cfc60d9a6.jpg" },
  { contentId: 117, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e7a/puEjQSDMuoHducbKjL_IQ_df0ffa55f8b34ac2ae86ca7f115ad04d.jpg" },
  { contentId: 118, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e7a/wbh5Cw1uDiquT_8q6pwUF_8435668f463e4eb1b050d903e5aa832f.jpg" },
  { contentId: 119, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e7a/qB8IOzCLj_gGeQUvjcTnV_15c793549bc44e89863b7a470eaac589.jpg" },
  { contentId: 120, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e81/W4XbyHJRuPSwXC39YsW89_e5edae7c67ab43d9afccc44365ef718d.jpg" },
  { contentId: 121, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e81/EZnsSV2EGVh0XHfRbAd7D_3564cbe3b9bc49a08f74c2e9caddc313.jpg" },
  { contentId: 122, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e81/EPcNQSHmjVHH1aoNl0FOR_5a38279eeb784f37a4853e93e48a3433.jpg" },
  // Comparisons (204-208)
  { contentId: 204, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e82/1H-Z_-6UC5HFnutIFE_hR_75c166073bd94715bc07f031e6ec0885.jpg" },
  { contentId: 205, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e82/EZ58o5yFC44t05u031U4M_926f4738aaa34ec9ad3e167c5871a93f.jpg" },
  { contentId: 206, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e82/AinU1MjsSH5W6a60n7WhE_676284c3dd684324a85600c6373f686a.jpg" },
  { contentId: 207, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e82/IES5RGHTMkcIBYs5nL8zR_172bc5ea38994cde97ffd58c7d4877fe.jpg" },
  { contentId: 208, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e82/9o6VhABDpw7dNnRpMDcDt_b1468610cd6e402389611da10e91f363.jpg" },
  // Verticals — Agriculture through Construction (123-132)
  { contentId: 123, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e82/5JqMeQcQoGNS7xLlj_JUB_9f2724eeb8fd4ef1b29fc677b10a5778.jpg" },
  { contentId: 124, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e83/TmxJfebPTOoy3QaS5Jb5v_745068c2594c4ee69029f03c235483e2.jpg" },
  { contentId: 125, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e83/LNVv385aDljaq4yjtrdFu_7a5a3e6327184c659dc6f8040e99490d.jpg" },
  { contentId: 126, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e84/S2PPn7pavJd2tTThX-r91_31b93903fc2c4d549e10d4856d3317e9.jpg" },
  { contentId: 127, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e84/0nJ_xO4Nx8PKWcRXYULCe_f8840817cf4b4135b5a3e50732cb2a52.jpg" },
  { contentId: 128, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e84/ijMD3oyLeRF2B2ptfvBma_2ccd5380676943d0a039fafc981531ce.jpg" },
  { contentId: 129, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e84/gZiVIZk9BeWX3uzZtWlq__c4ed2f5a7ffb4426af80c864093e2558.jpg" },
  { contentId: 130, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e84/FasPp9CnKPyWVOIDmQVDI_6c0243f3cba0413bb54af4177de509c2.jpg" },
  { contentId: 131, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e84/wyeX2XyDJ8JDhpzjRDpij_e1aed144187b442291f057869e1f082d.jpg" },
  { contentId: 132, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e84/B3vdqUZVDfoIDRSkcKhaL_80bdc6edd4bd47479601c82a166cb880.jpg" },
  // Healthcare, Hospitality, Manufacturing, Public Admin (133-142)
  { contentId: 133, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e85/iCeHGqq2ZtPuNf-V84p75_bb9d00d4506f4d4585ddc2ed2fefa0cb.jpg" },
  { contentId: 134, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e85/rv-MOdBeSRrm_1XuCu5aO_d53c110bb08d45caa7d8d0ccc99d628c.jpg" },
  { contentId: 135, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e85/IgoMMmso5ylJy5pCoH2Km_2c3dccb4623a4d4fbcf0d75d06a7d796.jpg" },
  { contentId: 136, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e85/PjNKe6ejvKl-J541f00hE_086bdbcdccfe4141a9209ef8693c2875.jpg" },
  { contentId: 137, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e85/7usNZzUa0gcZAIeEED6T3_1db81b583d9745899b973d50e38adaf5.jpg" },
  { contentId: 138, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e85/2pmlWoqU6Lf1w0YBqdUlT_106cde17e0c04c5eab65ee6867fc34f8.jpg" },
  { contentId: 139, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e85/O8XgCukWp3f9lCWzhHmz__1cd0662ba5274e57a5e55ebd48b0d869.jpg" },
  { contentId: 140, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e85/gNF7VDVAgb4oaucLkQWVb_a8b69f9efd764e77ab0eed8f9afbf2fb.jpg" },
  { contentId: 141, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e86/p1FxUTTb4R8QqZyrJWBqh_73daf5a447fe43f78636191dbc5bf320.jpg" },
  { contentId: 142, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e86/GhK-rgkXaXH0c4kk5Pdld_de23f3c73ed94ef0ae7cecff72b3953d.jpg" },
  // Retail through Wholesale (143-152)
  { contentId: 143, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e86/rR8wO2Ox83Fy7kPUdncZ__813adca558d3429c9438d016351ad99d.jpg" },
  { contentId: 144, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e86/e77jLtIMvOAimStIAU3G3_50554c99c0444831a35ef65be70a71e1.jpg" },
  { contentId: 145, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e87/BxDx4s0TJULl07oaQ1sN8_a00d13d5f70b44c9a73f5c9b57be2caf.jpg" },
  { contentId: 146, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e86/eNUqcq8LN1trWyMf_b0fM_9e9e6b30ec4f437d94ee5c0c3f467205.jpg" },
  { contentId: 147, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e88/DxqHI93mewEWfX7-K53UJ_508caef137b6473fbb907b93efa1be4d.jpg" },
  { contentId: 148, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e87/o_3UttzNRc2BT7Lvuss16_407b10351e254688ba9a01acd15d411e.jpg" },
  { contentId: 149, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e87/ipzsV8G34N4YyXxcI8Hun_b7566b2b49664c9eb5e74f516847879a.jpg" },
  { contentId: 150, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e87/8UExFJqbonBWuaM2AUUNJ_7b0e1dd8f50b44878af6bfde0c3dd437.jpg" },
  { contentId: 151, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8a/dByfxgXIxXzpViOwCk01e_62cfa21928c94d4ea6931824cddf032d.jpg" },
  { contentId: 152, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8a/4L2ky6DBtppG7xlbQX5Jd_01a788536dc249bfb06f0da6d12a82c5.jpg" },
  // Tier 2 verticals (153-176) — shared themed images
  { contentId: 153, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8a/Qz0eIoOihZq7z2wMV2Vme_9664bdd20f104308be8b1efed9db93ad.jpg" },
  { contentId: 154, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8a/1MV6AEqFJkl8diBR1Xff6_93cc3269eb9c42fca314fd50907458d8.jpg" },
  { contentId: 155, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8a/-66l4UFNfsX4P6oCmIO6K_854c74ea49ea4789b561a82504bd63dc.jpg" },
  { contentId: 156, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8b/f8X7mrD9iH9jRT-xdN3d8_d995a47b674f4c0cab3e4d5ba0f065e5.jpg" },
  { contentId: 157, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8a/U3RXYvftHpbmsc0w1UkEf_454a9064a1824a5daa82282b7ef353d2.jpg" },
  { contentId: 158, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8b/GSPtCabD56_RPNeGG87Ll_b113f5943a614d42a8a6ab4493e8043c.jpg" },
  { contentId: 159, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8c/ugiqSmXYKBq_QcPGXSdSI_e9939d0303b6499aa9e273944915f254.jpg" },
  { contentId: 160, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8c/SaBvkJLN1HOvsq0u6teYZ_a3507e20bcae48d9bb5a76c7829f77d8.jpg" },
  { contentId: 161, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8c/olQzOgYteT6_8i8W1eKGp_77bf9702d34341329f6c9aec65e9f4d9.jpg" },
  { contentId: 162, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8c/X-v1jM8fpcxniAZJqg5DP_aacc3ca952354f62a8c176d9608e3507.jpg" },
  { contentId: 163, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8d/mjJbsPpOfA3VG2kAUdiIj_db55be28665642c5bb5ee2d529e9a1f4.jpg" },
  { contentId: 164, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8d/HPAvPOIEZyfqgIv2tCKJU_15d72ba3f1fe4b348c221b9a2913ae46.jpg" },
  { contentId: 165, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8d/Kt1LKvK9uIw_-7ZGSiX5a_b26ef8b2deab463d91fdb4553241fa07.jpg" },
  { contentId: 166, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8d/OpaQXJ0EbIt4an35FmZv8_dc23c775d03846e580ba41b3296abc06.jpg" },
  { contentId: 167, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8d/aTKY8nuCfNxo_7bRrKwCG_5d1d138eb2994aad8d26e011f3198e2a.jpg" },
  { contentId: 168, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8d/rysVbmoY1xmZO2iPLS-7q_4002826eb7f64ff09854e2eb52639ac3.jpg" },
  { contentId: 169, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8d/sTuR-97MsZcYcrksKr72__09aeb40c02fc4fa6befcb9b337a9087c.jpg" },
  { contentId: 170, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8d/bXt3nblmsKuMgvSsBerhz_6370a55fc2c34672ae979dfe86c26338.jpg" },
  { contentId: 171, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8e/2MW5ZL7C2cHhmRmNBFMED_9fe011c3df744064a3285d35761727d2.jpg" },
  { contentId: 172, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8e/ZQSBJNV6vDuzWdEFlOPoB_ded88300c3a04d448bd04673dafb05f4.jpg" },
  { contentId: 173, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8e/l3ZPHT7bvQq8pifLjc3DY_bc3432f14eab4b89822c8df7e09be24d.jpg" },
  { contentId: 174, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8e/sSIa8Fn8qaOEtBZZ1484H_08035033cffb4f25bd20772284b4da5f.jpg" },
  { contentId: 175, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8f/h1iQ83aGH-0IqdIzASqP__256f646fe31f4e3b934165a7120dd8cf.jpg" },
  { contentId: 176, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8f/3rHgfhT8bpD4ElueJd5zI_8cfbc95def2f468f9fc739ab61ffb4d4.jpg" },
  // Extras (177-193)
  { contentId: 177, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8f/T_9JVRz9CuCdbhxD-4UiW_8b43d4b3532e4524abb89bd95a761d60.jpg" },
  { contentId: 178, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8f/QOpwjxQ-dI0YSYO_3gS_w_68d5dcdbccea4a4dbe6cf4b11f9513a0.jpg" },
  { contentId: 179, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8f/r_-HMxqwikwxujCC6BgDm_8d74121e36ec454d9aec3924a859e506.jpg" },
  { contentId: 180, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e8f/YXwjPe7WYPP8-SjB7_CmH_4a41ea6ea6844925bcd6f96f8b9e6e86.jpg" },
  { contentId: 181, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e90/MK4si9cUFsA89DcRx7UBM_9e01666aa88646c8a09802d0938b1b32.jpg" },
  { contentId: 182, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e90/TujaqForaFsh_IdJNkQdA_e1db9a5f6c19497f9ddebc34ea42834e.jpg" },
  { contentId: 183, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e90/Erb0xYxuWaxHqzZMb4rPT_d35efe1d975b474ab2c4558d0ac821ef.jpg" },
  { contentId: 184, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e90/fIp5_4HSeAEJc7eD2dDkb_3efeeb1fb1ea4c70842cf64e4afca21c.jpg" },
  { contentId: 185, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e90/Mgrt4h0LWfVo6MzM16fDJ_64b3ac14d41d452f970be60f06e74557.jpg" },
  { contentId: 186, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e90/6B8C6Ge7zGxgLPGL_35kU_a048354f53dd4d24a52370d6af72700c.jpg" },
  { contentId: 187, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e90/SFbbNuu3VsmZ1SGiTrkzh_99bb12dd69574e53824be2af9c1702f0.jpg" },
  { contentId: 188, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e90/RAo32KWvNlLBDp9P8D_8L_d2b4be3a5f4a4cdbbdd2e650d8eb8445.jpg" },
  { contentId: 189, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e92/aJp23gWPfTffJPt8Z6ieG_5a91c5e9c5b7488a87f69d9177f31701.jpg" },
  { contentId: 190, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e92/UqdWwuk8dHFAA-7AFXIzo_87aaec77b3564b618a0842acdd93d70f.jpg" },
  { contentId: 191, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e92/6Hj-wu67HAu2KpwjBVnEh_c45510c7b79a438ba6e320bf39c03db6.jpg" },
  { contentId: 192, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e92/rLXqO3P3yklOS7qvo_UR5_2e6b1b999c5c497395280ce430c7bb2b.jpg" },
  { contentId: 193, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e93/rDoa4JiPh0wiH8K8A1BHo_95def9801db4491f931a2a661113e0ab.jpg" },
  // State guides (194-203)
  { contentId: 194, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e93/9VLp9bEaSEBZmpqtPkAa3_81c7df54443b43c8b493dd3d38ae9608.jpg" },
  { contentId: 195, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e92/gr0ErHJYuIVR8aPtaNh57_f382e108bac34689bd4be339a661dea9.jpg" },
  { contentId: 196, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e93/T8nEVjRPSU4Zyll8IPbZR_462c9e59d8a849b2966dbf96fae1093f.jpg" },
  { contentId: 197, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e93/_uXJc63DSzESkbCvYx5VG_edec1e134d4240499b01ee5150e49792.jpg" },
  { contentId: 198, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e93/5vdwBLeCUWhhuj5qoYwVB_7d20494bf8d44903972e9662a53dc294.jpg" },
  { contentId: 199, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e93/RY9X-ps1JBjPPrv_zoq87_266371ca91be4213afce31f214846b77.jpg" },
  { contentId: 200, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e93/umVdgqKDJi2WQqgiJb_YE_de86d84d139e43dd9b83eb1791523f8d.jpg" },
  { contentId: 201, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e94/sdFdhrVwzGvCZ8dp6kE5L_c16c709bbefe48cdac2050cd3f112571.jpg" },
  { contentId: 202, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e94/NxRtQ9Mb-XyHNOOOaC-pk_3c2c0127d8f446b380fa4602c6eaea23.jpg" },
  { contentId: 203, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e94/ggGUYw8ofUTcaUQDqM5dT_e7f45e5bdcd3430fab1b1c5957a8fe01.jpg" },
  // Keyword clusters (209-223)
  { contentId: 209, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e94/469jI2Sk-L9k48QlA4MqZ_eb4d43a8ee2a492399b2272d9a346914.jpg" },
  { contentId: 210, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e98/Vggy6WTWYk2i9mrPukUPu_c8f17e9eae644f47870cf4744b729730.jpg" },
  { contentId: 211, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e98/RVh12WxiqqkfQWyv7Trfh_9c22eeccb8224ca4a60f02627641af9a.jpg" },
  { contentId: 212, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e98/2ErUygQUvVHLI9unVp90v_09f7b49fe3ca498093f49d19d84e9ee9.jpg" },
  { contentId: 213, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e98/V9NUBpWY1fTVnWc_HjllG_0418cd0e05d14f3ab11ffacf15ddadb8.jpg" },
  { contentId: 214, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e94/sITx2VjPE1TwoE3M5Jjs8_720e2ce4aca74c95b9d7a1cee42db10d.jpg" },
  { contentId: 215, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e94/rg1HO8Fydb5QXZFAo224L_78baadc902dd406081f18a4b1d796cb4.jpg" },
  { contentId: 216, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e95/_cuE3jrViloJY4pmyrslO_0f04206fd9e04068b441c4c6818837f0.jpg" },
  { contentId: 217, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e95/5CiQ9zuUVL6L7hBT2ua5O_d685c1d9aa324247b2423807e0ac077a.jpg" },
  { contentId: 218, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e96/PE6VITeBTVEoLFPgPFuAG_4649a73fdfec4f5f93bb416b3e15fbae.jpg" },
  { contentId: 219, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e95/ohu35KnA-Jy19ebxIrKPk_e60e4fcb898c45618619051500fa2f20.jpg" },
  { contentId: 220, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e95/k0s9ybJF6BOgYsr_KCcpc_ebbc872ce90c4acfa01fe2c1773ef9c8.jpg" },
  { contentId: 221, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e97/5IGBPQOvgYAurgiWqnu28_6c48e8e01f6641e6a56713c621757cc1.jpg" },
  { contentId: 222, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e97/3Zm5FLuZwA6DOGonozlff_6e3b55b533ea43759ce1193abe493850.jpg" },
  { contentId: 223, docType: "blog", url: "https://v3b.fal.media/files/b/0a960e97/FeVFTYfkOnVRaha4UXHP2_e3e1344caefa4df0a877d1eacaa5239f.jpg" },
  // Resources (224-258) — themed cover images
  { contentId: 224, docType: "resource", url: "https://v3b.fal.media/files/b/0a960e97/-IaMw79e7aAcXxO6lHPui_610868b5c79d4ba98023a852e3fe386a.jpg" },
  { contentId: 225, docType: "resource", url: "https://v3b.fal.media/files/b/0a960e97/HNXt8GZoL0f6nO76wlrqs_842398cf8bc84fa1a18dc53de5baa57d.jpg" },
  { contentId: 226, docType: "resource", url: "https://v3b.fal.media/files/b/0a960e97/olniVKp6oORaUYfwos81w_e541a77669b840668349f3144d9e2bd3.jpg" },
  { contentId: 227, docType: "resource", url: "https://v3b.fal.media/files/b/0a960e97/ntNAzrNHkcwBT4o43fann_ada1756b69824c4e91451087fca10c33.jpg" },
  { contentId: 228, docType: "resource", url: "https://v3b.fal.media/files/b/0a960e97/ikoFTqTuKhA_j2jSVToyc_2bdb89d73daa45e889b88601990b3c7d.jpg" },
  { contentId: 229, docType: "resource", url: "https://v3b.fal.media/files/b/0a960e98/rjlQRQRUERaCjDupsvmvO_a77f71477f3a45eb9ab4f59cdb4d1c1a.jpg" },
  { contentId: 230, docType: "resource", url: "https://v3b.fal.media/files/b/0a960e98/f3oU6nupJkV4ehczwwN6b_42bbcdf001d84ae886caea3c3ddf3e45.jpg" },
  { contentId: 231, docType: "resource", url: "https://v3b.fal.media/files/b/0a960e98/DVRAPemBkS8XH2FBRqhHD_3d6cdf7ff5e243b1a866418a63c8634c.jpg" },
  { contentId: 232, docType: "resource", url: "https://v3b.fal.media/files/b/0a960e98/ySsjJOU7bbs0u95J2ivsV_50d87c898a4e472e8a49b0e4192facc8.jpg" },
]

async function main() {
  console.log(`Processing ${assignments.length} image assignments...\n`)
  let success = 0
  let failed = 0

  for (const assignment of assignments) {
    const result = await processAssignment(assignment)
    if (result) success++
    else failed++
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n════════════════════════`)
  console.log(`✅ Success: ${success}`)
  console.log(`❌ Failed:  ${failed}`)
  console.log(`Total:     ${assignments.length}`)
}

main().catch(err => {
  console.error("Fatal:", err)
  process.exit(1)
})
