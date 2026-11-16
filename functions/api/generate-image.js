// Cloudflare Pages Function: authenticated Pollinations image generation.
// Required bindings: POLLINATIONS_API_KEY (secret), MEDISURG_IMAGES (R2 bucket).
const json = (body, status=200) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
export async function onRequestPost({request, env}) {
  if (!env.POLLINATIONS_API_KEY) return json({error:"Image generation is not configured yet. Add the POLLINATIONS_API_KEY secret in Cloudflare Pages."}, 503);
  if (!env.MEDISURG_IMAGES) return json({error:"Permanent image storage is not configured yet. Bind an R2 bucket as MEDISURG_IMAGES."}, 503);
  let data;
  try { data = await request.json(); } catch { return json({error:"Invalid request body."}, 400); }
  const question=String(data.question||"").trim().slice(0,1600);
  const subject=String(data.subject||"Medical studies").trim().slice(0,100);
  const topic=String(data.topic||"").trim().slice(0,160);
  const visual=String(data.imagePrompt||"").trim().slice(0,700);
  if (!question || !visual) return json({error:"A question and its matching image prompt are required."}, 400);
  const exactPrompt = [
    "Create one clear, high-resolution medical education illustration that directly explains the exact question below.",
    "The illustration must depict only the anatomical structure, tissue, organism, investigation, or mechanism specified. Do not substitute a related but different concept.",
    "Question: "+question,
    "Course: "+subject+(topic?" — "+topic:""),
    "Required visual subject: "+visual,
    "Style: scientifically accurate undergraduate medical textbook illustration, clean composition, high contrast, uncluttered background, anatomically faithful proportions.",
    "Do not add captions, words, labels, arrows, watermarks, decorative borders, or unrelated objects."
  ].join("\n");
  const key = await sha256(subject+"|"+topic+"|"+question+"|"+visual);
  const objectKey = "questions/"+key+".jpg";
  try {
    const existing = await env.MEDISURG_IMAGES.get(objectKey);
    if (existing) return json({url:"/api/image/"+key, cached:true});
    const endpoint = "https://gen.pollinations.ai/image/"+encodeURIComponent(exactPrompt)
      +"?model=black-forest-labs/flux.1-schnell&width=1024&height=768&nologo=true";
    const upstream = await fetch(endpoint, {
      headers: { "Authorization":"Bearer "+env.POLLINATIONS_API_KEY, "Accept":"image/*" },
      signal: AbortSignal.timeout(120000)
    });
    if (!upstream.ok) {
      const detail = (await upstream.text().catch(()=> "")).slice(0,300);
      return json({error:"Pollinations image generation failed ("+upstream.status+").", detail}, 502);
    }
    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) return json({error:"Pollinations returned an unexpected image response."}, 502);
    await env.MEDISURG_IMAGES.put(objectKey, upstream.body, {
      httpMetadata: { contentType, cacheControl:"public, max-age=31536000, immutable" },
      customMetadata: { subject, topic, questionHash:key }
    });
    return json({url:"/api/image/"+key, cached:false});
  } catch (error) {
    return json({error:"Could not generate or save the medical illustration.", detail:String(error && error.message || error).slice(0,220)}, 502);
  }
}
