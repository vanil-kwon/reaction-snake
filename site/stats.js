// Add your Supabase Project URL and Publishable key below.
const SUPABASE_URL = 'PASTE_SUPABASE_PROJECT_URL_HERE';
const SUPABASE_PUBLISHABLE_KEY = 'PASTE_SUPABASE_PUBLISHABLE_KEY_HERE';
(async()=>{
 const $=id=>document.getElementById(id),status=$('statsStatus'),visitorKey='rs-analytics-visitor';
 let visitorId='';
 try{visitorId=localStorage.getItem(visitorKey)||'';if(!visitorId){visitorId=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);localStorage.setItem(visitorKey,visitorId)}}catch(e){visitorId='session-'+Date.now().toString(36)+Math.random().toString(36).slice(2)}
 if(!navigator.onLine){status.textContent='Offline';return}
 if(SUPABASE_URL.startsWith('PASTE_')||SUPABASE_PUBLISHABLE_KEY.startsWith('PASTE_')){status.textContent='Setup required';return}
 try{
  const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');
  const sb=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const currentMode=()=>document.querySelector('.mode.active')?.dataset.mode||'classic';
  const send=async(type,mode=currentMode(),score=0)=>{if(!navigator.onLine)return;const {error}=await sb.from('game_events').insert({visitor_id:visitorId,event_type:type,mode,score});if(error&&!(type==='page_view'&&error.code==='23505'))throw error};
  const refresh=async()=>{const {data,error}=await sb.rpc('reaction_snake_stats');if(error)throw error;const s=data||{};$('globalVisits').textContent=Number(s.visits||0).toLocaleString();$('globalGames').textContent=Number(s.games||0).toLocaleString();$('globalBest').textContent=Number(s.best||0).toLocaleString();$('globalMode').textContent=s.popular_mode||'—'};
  send('page_view').catch(()=>{});
  window.addEventListener('rs:game-end',e=>send('game_finished',e.detail.mode,e.detail.score).then(refresh).catch(()=>{}));
  window.addEventListener('rs:mode',e=>send('mode_selected',e.detail.mode).catch(()=>{}));
  const ch=sb.channel('reaction-snake-online',{config:{presence:{key:visitorId}}});
  const updateOnline=()=>{$('globalOnline').textContent=String(Object.keys(ch.presenceState()).length)};
  ch.on('presence',{event:'sync'},updateOnline).subscribe(async state=>{if(state==='SUBSCRIBED'){await ch.track({online_at:new Date().toISOString()});updateOnline();status.textContent='Live'}});
  await refresh();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)ch.untrack().catch(()=>{});else if(navigator.onLine)ch.track({online_at:new Date().toISOString()}).catch(()=>{})});
 }catch(e){status.textContent='Stats unavailable';console.warn('Reaction Snake stats:',e)}
})();
