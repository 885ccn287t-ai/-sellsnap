const $=x=>document.getElementById(x),U='maxup_v5_used',H='maxup_v5_hist',T='maxup_theme';
const WORKER_URL='https://maxup-ai.49kv6tsjyj.workers.dev';
let mode='Маркетплейс';
const used=()=>Number(localStorage.getItem(U)||0),left=()=>Math.max(0,5-used());
function refresh(){$('free').textContent=left()}
function setTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem(T,t);$('theme').textContent=t==='dark'?'☀':'☾'}
setTheme(localStorage.getItem(T)||'light');refresh();
$('theme').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active'));b.classList.add('active');$(b.dataset.tab).classList.add('active')});
document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mode').forEach(x=>x.classList.remove('active'));b.classList.add('active');mode=b.dataset.mode});
$('file').onchange=e=>{let f=e.target.files[0];if(f){$('preview').src=URL.createObjectURL(f);$('preview').classList.remove('hidden')}};

async function resizeForAI(file){
  const bitmap=await createImageBitmap(file);
  const maxSide=510;
  const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  const width=Math.max(1,Math.round(bitmap.width*scale));
  const height=Math.max(1,Math.round(bitmap.height*scale));
  const canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');
  ctx.drawImage(bitmap,0,0,width,height);
  if(bitmap.close)bitmap.close();
  return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Не удалось подготовить фото')),'image/jpeg',0.9));
}

$('ai').onclick=async()=>{
  const file=$('file').files[0];
  if(!file)return alert('Сначала выбери фото товара.');
  const button=$('ai');
  const oldText=button.textContent;
  button.disabled=true;button.textContent='Создаём карточку…';
  $('photoResult').innerHTML='<div><b>AI обрабатывает фото…</b><p>Обычно это занимает немного времени. Не закрывай страницу.</p></div>';
  try{
    const image=await resizeForAI(file);
    const form=new FormData();
    form.append('image',image,'product.jpg');
    const extra=$('prompt').value.trim();
    const preserve=$('preserve').checked?' Preserve the exact product, logo, labels, text, colors and proportions. Do not redesign the product itself.':'';
    form.append('prompt',`Mode: ${mode}.${preserve}${extra?' User request: '+extra:''}`);
    const response=await fetch(WORKER_URL,{method:'POST',body:form});
    let data;
    try{data=await response.json()}catch{throw new Error('Worker вернул неправильный ответ');}
    if(!response.ok||!data?.image)throw new Error(data?.details||data?.error||`Ошибка ${response.status}`);
    const src=data.image.startsWith('data:')?data.image:`data:image/jpeg;base64,${data.image}`;
    $('photoResult').innerHTML='';
    const img=document.createElement('img');
    img.src=src;img.alt='Готовая AI-карточка MaxUp';
    img.style.cssText='width:100%;height:auto;display:block;border-radius:12px;';
    $('photoResult').appendChild(img);
  }catch(error){
    console.error(error);
    $('photoResult').innerHTML='<div><b>Не получилось создать карточку</b><p></p></div>';
    $('photoResult').querySelector('p').textContent=error?.message||'Неизвестная ошибка';
  }finally{
    button.disabled=false;button.textContent=oldText;
  }
};

$('item').oninput=()=>$('count').textContent=$('item').value.length+'/60';
function hist(){try{return JSON.parse(localStorage.getItem(H)||'[]')}catch{return[]}}
function render(){$('historyList').innerHTML=hist().length?hist().map(x=>'<div class="hist"><b>'+x.title+'</b><br><small>'+x.date+'</small></div>').join(''):'<div class="result">История пока пустая.</div>'}
render();
$('clear').onclick=()=>{localStorage.removeItem(H);render()};
$('close').onclick=()=>$('limit').classList.add('hidden');
$('generate').onclick=()=>{let i=$('item').value.trim();if(!i)return $('item').focus();if(!left())return $('limit').classList.remove('hidden');let title=[$('brand').value.trim(),i,$('size').value.trim()].filter(Boolean).join(' · '),d=title+'\n\nСостояние: '+$('condition').value.toLowerCase()+'.'+($('details').value.trim()?'\n\nПодробности: '+$('details').value.trim()+'.':'')+'\n\nЕсли нужны дополнительные фото или детали — напишите.';localStorage.setItem(U,used()+1);localStorage.setItem(H,JSON.stringify([{title,date:new Date().toLocaleString('ru-RU')},...hist()].slice(0,20)));refresh();render();$('title').textContent=title;$('desc').textContent=d;$('textEmpty').classList.add('hidden');$('textResult').classList.remove('hidden');window.copy=d};
$('copy').onclick=()=>navigator.clipboard.writeText(window.copy||'');
