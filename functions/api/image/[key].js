// Serve a generated medical illustration from the private R2 bucket.
export async function onRequestGet({params, env, request}) {
  if (!env.MEDISURG_IMAGES) return new Response("Image storage is not configured.", {status:503});
  const key=String(params.key||"");
  if (!/^[a-f0-9]{64}$/.test(key)) return new Response("Not found.", {status:404});
  const object=await env.MEDISURG_IMAGES.get("questions/"+key+".jpg");
  if (!object) return new Response("Image not found.", {status:404});
  const download=new URL(request.url).searchParams.get("download")==="1";
  const headers=new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag",object.httpEtag);
  headers.set("cache-control","public, max-age=31536000, immutable");
  if(download) headers.set("content-disposition",'attachment; filename="medisurg-medical-illustration.jpg"');
  return new Response(object.body,{headers});
}
