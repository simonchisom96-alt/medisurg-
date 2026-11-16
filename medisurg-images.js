/* MediSurg question-linked medical illustrations. */
(function(){
  const safeUrl = value => typeof value==="string" && /^\/api\/image\/[a-f0-9]{64}$/.test(value) ? value : "";
  async function attach(questions,onStatus){
    const list=(questions||[]).filter(q=>q && q.imagePrompt && !safeUrl(q.imageUrl));
    let cursor=0;
    async function worker(){
      while(cursor<list.length){
        const q=list[cursor++];
        try{
          if(onStatus) onStatus("Creating illustration for: "+String(q.subject||"this question"));
          const response=await fetch("/api/generate-image",{
            method:"POST",headers:{"content-type":"application/json"},
            body:JSON.stringify({question:q.q,subject:q.subject,topic:q.topic,imagePrompt:q.imagePrompt})
          });
          const result=await response.json().catch(()=>({}));
          if(!response.ok || !safeUrl(result.url)) throw new Error(result.error||"Image generation unavailable");
          q.imageUrl=result.url;
        }catch(error){ console.warn("[MediSurg image]",error); q.imageUrl=null; }
      }
    }
    await Promise.all(Array.from({length:Math.min(2,list.length)},worker));
    return questions;
  }
  function html(value){
    const url=safeUrl(value);
    if(!url)return "";
    return '<div class="medisurg-question-image" style="margin:10px 0;text-align:center">'
      +'<a href="'+url+'" target="_blank" rel="noopener" aria-label="View medical illustration">'
      +'<img src="'+url+'" alt="Medical illustration for this question" loading="lazy" style="display:block;max-width:100%;max-height:340px;width:auto;height:auto;margin:auto;border-radius:12px;border:1px solid var(--border,#345);background:#fff;object-fit:contain">'
      +'</a><a href="'+url+'?download=1" style="display:inline-block;margin-top:7px;padding:7px 12px;border:1px solid var(--border,#345);border-radius:8px;color:var(--accent,#ffd700);font-size:11px;text-decoration:none">⬇ Download illustration</a></div>';
  }
  function render(afterElementId,question){
    const anchor=document.getElementById(afterElementId);
    if(!anchor)return;
    const id=afterElementId+"Image";
    let wrap=document.getElementById(id);
    if(!wrap){wrap=document.createElement("div");wrap.id=id;anchor.insertAdjacentElement("afterend",wrap);}
    wrap.innerHTML=html(question && question.imageUrl);
  }
  window.MediSurgImages={attach,html,render};
})();
