const $=id=>document.getElementById(id);
const fields=["item","category","condition","brand","size","details"];
fields.forEach(id=>$(id).addEventListener("input",updateCounter));
function updateCounter(){
  const n=fields.filter(id=>$(id).value.trim()).length;
  $("counter").textContent=n+"/6";
}
function clean(s){return s.trim().replace(/\s+/g," ")}
function make(){
  const item=clean($("item").value);
  if(!item){$("item").focus();return}
  const cat=$("category").value, cond=$("condition").value;
  const brand=clean($("brand").value), size=clean($("size").value), details=clean($("details").value);
  const en=$("language").value==="en";
  let title, desc, tags;
  if(en){
    title=[brand,item,size].filter(Boolean).join(" · ");
    desc=`${title}\n\nCondition: ${cond.toLowerCase()}.\nCategory: ${cat.toLowerCase()}.`+
      (details?`\n\nDetails: ${details}.`:"")+
      `\n\nFeel free to message me with any questions.`;
    tags=[item,brand,cat,size,cond].filter(Boolean).map(x=>"#"+x.toLowerCase().replace(/[^a-z0-9]+/gi,""));
  }else{
    title=[brand,item,size].filter(Boolean).join(" · ");
    desc=`${title}\n\nСостояние: ${cond.toLowerCase()}.\nКатегория: ${cat.toLowerCase()}.`+
      (details?`\n\nПодробности: ${details}.`:"")+
      `\n\nЕсли есть вопросы — пишите, отвечу.`;
    const base=[item,brand,cat,size,cond,"купить","продажа"];
    tags=[...new Set(base.filter(Boolean).map(x=>"#"+x.toLowerCase().replace(/[^а-яёa-z0-9]+/gi,"")))];
  }
  $("outTitle").textContent=title;
  $("outDescription").textContent=desc;
  $("outTags").innerHTML=tags.map(t=>`<span>${t}</span>`).join("");
  $("empty").classList.add("hidden"); $("result").classList.remove("hidden"); $("copyAll").disabled=false;
  window.last={title,description:desc,tags:tags.join(" ")};
}
$("generate").addEventListener("click",make);
$("copyAll").addEventListener("click",async()=>{
  if(!window.last)return;
  await navigator.clipboard.writeText(`${window.last.title}\n\n${window.last.description}\n\n${window.last.tags}`);
  $("copyAll").textContent="Скопировано ✓"; setTimeout(()=>$("copyAll").textContent="Скопировать всё",1400);
});
document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{
  const key=b.dataset.copy, value=key==="tags"?window.last?.tags:window.last?.[key];
  if(!value)return;
  await navigator.clipboard.writeText(value); const old=b.textContent;b.textContent="готово ✓";setTimeout(()=>b.textContent=old,1000);
}));
updateCounter();
