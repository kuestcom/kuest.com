/* ── NAV SCROLL ── */
window.addEventListener('scroll',()=>{
  const nav=document.getElementById('nav');
  if(nav)nav.classList.toggle('s',scrollY>40);
},{passive:true});

/* ── BACKGROUND PARTICLES ── */
const BG_EFFECT_CONFIG={
  // switch here: 'blue' | 'delta' | 'off'
  mode:'delta',
  blue:{count:55,linkDistance:120},
  delta:{
    count:14,
    centerSafeBox:{xMin:.2,xMax:.8,yMin:.18,yMax:.82},
  },
};

(function(){
  const cv=document.getElementById('bg-canvas');
  if(!cv)return;
  const ctx=cv.getContext('2d');
  const MIN_COORDINATE=0;
  const MAX_COORDINATE=1;
  let W,H,pts=[],tick=0,mode=BG_EFFECT_CONFIG.mode;

  function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);

  function inCenterSafeZone(x,y){
    const b=BG_EFFECT_CONFIG.delta.centerSafeBox;
    return x>b.xMin&&x<b.xMax&&y>b.yMin&&y<b.yMax;
  }

  function pickDeltaSpawn(){
    for(let i=0;i<20;i++){
      const x=Math.random();
      const y=Math.random();
      // mostly keep deltas outside the visual center
      if(!inCenterSafeZone(x,y)||Math.random()<.08)return{x,y};
    }
    return{x:Math.random(),y:Math.random()};
  }

  function buildBlue(){
    pts=[];
    for(let i=0;i<BG_EFFECT_CONFIG.blue.count;i++){
      pts.push({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.0003,vy:(Math.random()-.5)*.0003,s:Math.random()*1.4+.4,o:Math.random()*.4+.1});
    }
  }

  function buildDelta(){
    pts=[];
    for(let i=0;i<BG_EFFECT_CONFIG.delta.count;i++){
      const p=pickDeltaSpawn();
      const down=Math.random()<.5;
      pts.push({
        x:p.x,y:p.y,
        dir:down?1:-1, // +1 down/red, -1 up/green
        vx:(Math.random()-.5)*.00006,
        vy:(Math.random()*.00022+.00009)*(down?1:-1),
        s:Math.random()*3+3.2,
        o:Math.random()*.18+.11,
        phase:Math.random()*Math.PI*2,
      });
    }
  }

  function setMode(nextMode){
    const allowed={blue:1,delta:1,off:1};
    mode=allowed[nextMode]?nextMode:'blue';
    if(mode==='blue')buildBlue();
    else if(mode==='delta')buildDelta();
    else pts=[];
  }

  function drawBlue(){
    pts.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<MIN_COORDINATE||p.x>MAX_COORDINATE){p.x=Math.min(MAX_COORDINATE,Math.max(MIN_COORDINATE,p.x));p.vx*=-1;}
      if(p.y<MIN_COORDINATE||p.y>MAX_COORDINATE){p.y=Math.min(MAX_COORDINATE,Math.max(MIN_COORDINATE,p.y));p.vy*=-1;}
      ctx.beginPath();ctx.arc(p.x*W,p.y*H,p.s,0,Math.PI*2);
      ctx.fillStyle=`rgba(79,142,247,${p.o})`;ctx.fill();
    });
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const dx=(pts[i].x-pts[j].x)*W,dy=(pts[i].y-pts[j].y)*H,d=Math.sqrt(dx*dx+dy*dy);
      if(d<BG_EFFECT_CONFIG.blue.linkDistance){
        ctx.beginPath();
        ctx.moveTo(pts[i].x*W,pts[i].y*H);
        ctx.lineTo(pts[j].x*W,pts[j].y*H);
        ctx.strokeStyle=`rgba(79,142,247,${.08*(1-d/BG_EFFECT_CONFIG.blue.linkDistance)})`;
        ctx.lineWidth=.5;
        ctx.stroke();
      }
    }
  }

  function drawDelta(){
    pts.forEach(p=>{
      p.x+=p.vx+Math.sin((tick*.012)+p.phase)*.000015;
      p.y+=p.vy;
      if(p.x<-0.08)p.x=1.08;
      if(p.x>1.08)p.x=-0.08;
      if(p.dir<0&&p.y<-0.1)p.y=1.1;
      if(p.dir>0&&p.y>1.1)p.y=-0.1;

      const isUp=p.dir<0;
      const dim=inCenterSafeZone(p.x,p.y)?.18:1;
      const alpha=p.o*dim;
      const color=isUp?`rgba(52,208,127,${alpha})`:`rgba(240,82,82,${alpha})`;
      const px=p.x*W,py=p.y*H,size=p.s;

      ctx.save();
      ctx.translate(px,py);
      if(!isUp)ctx.rotate(Math.PI);
      ctx.beginPath();
      ctx.moveTo(0,-size);
      ctx.lineTo(size*.88,size*.76);
      ctx.lineTo(-size*.88,size*.76);
      ctx.closePath();
      ctx.shadowBlur=3;
      ctx.shadowColor=color;
      ctx.fillStyle=color;
      ctx.fill();
      ctx.restore();
    });
  }

  function draw(){
    tick+=1;
    ctx.clearRect(0,0,W,H);
    if(mode==='blue')drawBlue();
    else if(mode==='delta')drawDelta();
    requestAnimationFrame(draw);
  }

  // helper for quick testing from console: window.KUEST_BG_EFFECT.setMode('delta')
  window.KUEST_BG_EFFECT={setMode,getMode:()=>mode,config:BG_EFFECT_CONFIG};
  setMode(mode);
  draw();
})();

/* ── SCROLL REVEAL ── */
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('v')}),{threshold:.07,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.r').forEach(el=>obs.observe(el));
/* fallback for iframe/preview environments */
setTimeout(()=>{document.querySelectorAll('.r:not(.v)').forEach(el=>el.classList.add('v'));},400);

/* ── SITE PREVIEW MODE ── */
(function(){
  const preview=document.getElementById('sitePreview');
  const toggle=document.getElementById('sitePreviewModeBtn');
  if(!preview||!toggle)return;
  const mobileViewport=window.matchMedia('(max-width: 768px)');
  let manualMobile=false;
  const t=(key,fallback)=>{
    if(window.KUEST_I18N&&typeof window.KUEST_I18N.t==='function')return window.KUEST_I18N.t(key)||fallback;
    return fallback;
  };

  const sync=()=>{
    const forcedMobile=mobileViewport.matches;
    const isMobile=forcedMobile||manualMobile;
    preview.classList.toggle('is-mobile',isMobile);
    preview.classList.toggle('is-forced-mobile',forcedMobile);
    toggle.setAttribute('aria-pressed',String(isMobile));
    toggle.hidden=forcedMobile;
    toggle.setAttribute('aria-hidden',String(forcedMobile));
    const label=isMobile?t('preview.switchToDesktop','Switch to desktop preview'):t('preview.switchToMobile','Switch to mobile preview');
    toggle.setAttribute('aria-label',label);
    toggle.title=label;
  };

  toggle.addEventListener('click',()=>{
    if(mobileViewport.matches)return;
    manualMobile=!manualMobile;
    sync();
  });

  if(mobileViewport.addEventListener)mobileViewport.addEventListener('change',sync);
  else if(mobileViewport.addListener)mobileViewport.addListener(sync);
  sync();
})();

/* ── TIMELINE SPINE ── */
const panels=[...document.querySelectorAll('.panel-wrap')].map(el=>el.id).filter(Boolean);
const dots=document.querySelectorAll('.tl-dot');
function updateSpine(){
  const mid=window.innerHeight/2+scrollY;
  let active=0;
  panels.forEach((id,i)=>{
    const el=document.getElementById(id);
    if(!el)return;
    const top=el.offsetTop,bot=top+el.offsetHeight;
    if(mid>=top&&mid<bot)active=i;
  });
  dots.forEach((d,i)=>d.classList.toggle('a',i===active));
}
window.addEventListener('scroll',updateSpine,{passive:true});
dots.forEach(d=>d.addEventListener('click',()=>{
  const id=panels[Number(d.dataset.p)];
  const el=id?document.getElementById(id):null;
  if(el)el.scrollIntoView({behavior:'smooth'});
}));

/* ── COUNTERS ── */
function animCounter(el,to,duration=1600){
  let start=null;
  const decimals=Math.max(0,Number(el.dataset.decimals||0));
  function step(ts){
    if(!start)start=ts;
    const p=Math.min((ts-start)/duration,1);
    const eased=p*p*(3-2*p);
    const value=eased*to;
    el.textContent=decimals?value.toFixed(decimals):Math.round(value);
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
// trigger counters when p1 enters view
const ctrObs=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){document.querySelectorAll('.counter').forEach(el=>animCounter(el,+el.dataset.to));ctrObs.disconnect();}
}),{threshold:.3});
const p1=document.getElementById('p1');if(p1)ctrObs.observe(p1);

/* ── MARKET FEED ── */
const FEED_FALLBACK=[
  {q:'Will Republicans keep US House majority after the 2026 midterms?',vol:'$6.9M',yes:58,up:true,img:'',niche:'politics',tag:'Politics',endTs:1793491200000},
  {q:'Will Bitcoin exceed $150K before Q3 2026?',vol:'$8.2M',yes:37,up:false,img:'',niche:'crypto'},
  {q:'Will OKC win the 2025-26 NBA Championship?',vol:'$14.7M',yes:42,up:true,img:'',niche:'sports'},
  {q:'Will the Fed cut rates more than twice in H2?',vol:'$3.9M',yes:61,up:true,img:'',niche:'finance'},
  {q:'Will OpenAI announce a public IPO in 2026?',vol:'$6.3M',yes:59,up:true,img:'',niche:'tech'},
  {q:'Will Wicked: For Good be the top grossing movie of 2026?',vol:'$1.2M',yes:28,up:false,img:'',niche:'culture'},
];
const feed_data=FEED_FALLBACK.map(m=>({...m}));
const feed=document.getElementById('mFeed');

function fmtVolume(v){
  const n=Number(v);
  if(!Number.isFinite(n)||n<=0)return '$0';
  if(n>=1e9)return '$'+(n/1e9).toFixed(n>=1e10?0:1)+'B';
  if(n>=1e6)return '$'+(n/1e6).toFixed(n>=1e7?0:1)+'M';
  if(n>=1e3)return '$'+(n/1e3).toFixed(n>=1e4?0:1)+'K';
  return '$'+n.toFixed(0);
}
function parseList(v){
  if(Array.isArray(v))return v;
  if(typeof v==='string'){try{return JSON.parse(v);}catch{return [];}}
  return [];
}
function detectNiche(text){
  const q=(text||'').toLowerCase();
  if(/election|president|senate|house|congress|government|prime minister|parliament|cabinet|republican|democrat|biden|trump|white house|tariff|ceasefire|ukraine|russia|china|taiwan|nato|putin|zelensky|netanyahu|supreme leader/.test(q))return 'politics';
  if(/nba|nfl|mlb|nhl|ufc|fifa|soccer|football|premier league|championship|ucl|champions league|world cup|super bowl|tennis|formula 1|f1|golf|stanley cup/.test(q))return 'sports';
  if(/\bbtc\b|\bbitcoin\b|\beth\b|\bethereum\b|\bsol\b|\bsolana\b|\bcrypto\b|\bdoge\b|\bxrp\b|metamask|token launch|airdrop/.test(q))return 'crypto';
  if(/fed|interest rate|rates?|cpi|inflation|recession|gdp|treasury|usd|eur\/?usd|economy|s&p|nasdaq|dow jones/.test(q))return 'finance';
  if(/movie|box office|grammy|oscar|album|song|artist|singer|actor|actress|netflix|spotify|concert|tour|hollywood|billboard/.test(q))return 'culture';
  if(/\bopenai\b|\btesla\b|\bnvidia\b|\bmicrosoft\b|\bapple\b|\bgoogle\b|\bmeta\b|\bipo\b|\bchatgpt\b|\bartificial intelligence\b|\bai\b|\bspacex\b|\bperplexity\b/.test(q))return 'tech';
  return 'world';
}
function isHeadlineNoise(text){
  return /\b(say|says|said|tweet|tweets|tweeted|mention|mentions|this week|today|tomorrow|tonight)\b/i.test(text||'');
}
function isPoliticsCore(text){
  return /election|president|senate|house|congress|government|prime minister|parliament|cabinet|tariff|ceasefire|ukraine|russia|china|taiwan|nato|putin|zelensky|netanyahu|supreme leader/i.test(text||'');
}
function isMemeMarket(text){
  return /jesus christ|gta\s*vi|alien|ufo|zombie|apocalypse/i.test(text||'');
}
function nicheLabel(n){
  return({politics:'Politics',crypto:'Crypto',sports:'Sports',finance:'Finance',tech:'Tech',culture:'Culture',world:'World'})[n]||'Market';
}
function parseGammaMarket(m){
  const q=((m&&m.question)||'').trim();
  if(!q)return null;
  const outcomes=parseList(m.outcomes).map(o=>String(o));
  const prices=parseList(m.outcomePrices).map(Number);
  if(!outcomes.length||outcomes.length!==prices.length)return null;
  let yesIdx=outcomes.findIndex(o=>o.toLowerCase()==='yes');
  if(yesIdx<0)yesIdx=0;
  const p=Math.max(0,Math.min(1,Number(prices[yesIdx])||0));
  const yes=Math.round(p*100);
  const volume=Number(m.volume)||0;
  const endTs=Date.parse(m.endDate||'')||0;
  const eventTitle=((m.events&&m.events[0]&&m.events[0].title)||'').trim();
  const niche=detectNiche([q,eventTitle,m.slug||'',m.description||''].join(' '));
  return{
    id:String(m.id||m.conditionId||q),
    q,
    vol:fmtVolume(volume),
    volume,
    yes,
    up:yes>=50,
    img:m.image||m.icon||'',
    niche,
    tag:nicheLabel(niche),
    endTs,
  };
}
function pickFeedMarkets(markets,count=6){
  const sorted=markets.slice().sort((a,b)=>b.volume-a.volume);
  const out=[];const used=new Set();
  const add=item=>{if(item&&!used.has(item.id)){out.push(item);used.add(item.id);}};
  const pick=fn=>sorted.find(m=>!used.has(m.id)&&fn(m));
  const now=Date.now();
  const sportsFuture=now+1000*60*60*24*7;
  const cryptoNearFuture=now+1000*60*60*6;
  const longFuture=now+1000*60*60*24*45;
  const maxFuture=Date.parse('2028-01-01T00:00:00Z');
  const inRange=(m,min)=>m.endTs>=min&&m.endTs<=maxFuture;
  const clean=m=>!isHeadlineNoise(m.q)&&!isMemeMarket(m.q);

  add(pick(m=>m.niche==='politics'&&inRange(m,longFuture)&&clean(m)&&isPoliticsCore(m.q)));
  if(!out.length)add(pick(m=>m.niche==='politics'&&inRange(m,longFuture)&&clean(m)));
  if(!out.length)add(pick(m=>m.niche==='politics'&&!isMemeMarket(m.q)));

  add(pick(m=>m.niche==='sports'&&inRange(m,sportsFuture)&&clean(m)));
  const cryptoChoice=
    pick(m=>m.niche==='crypto'&&m.endTs>=cryptoNearFuture&&clean(m)&&/\bbitcoin\b|\bbtc\b/i.test(m.q))||
    pick(m=>m.niche==='crypto'&&inRange(m,longFuture)&&clean(m))||
    pick(m=>m.niche==='crypto'&&m.endTs>=cryptoNearFuture&&clean(m));
  add(cryptoChoice);
  add(pick(m=>m.niche==='finance'&&inRange(m,longFuture)&&clean(m)));
  add(pick(m=>m.niche==='tech'&&inRange(m,longFuture)&&clean(m)));
  add(pick(m=>m.niche==='culture'&&inRange(m,longFuture)&&clean(m)));
  add(pick(m=>m.niche==='world'&&inRange(m,longFuture)&&clean(m)));

  ['finance','tech','culture','world','crypto','politics','sports'].forEach(n=>add(pick(m=>m.niche===n&&clean(m))));
  for(const m of sorted){if(out.length>=count)break;if(clean(m))add(m);}
  for(const m of sorted){if(out.length>=count)break;add(m);}
  return out.slice(0,count);
}
function renderFeed(){
  if(!feed)return;
  feed.querySelectorAll('.mf-item').forEach(el=>el.remove());
  feed_data.forEach(m=>{
    const div=document.createElement('div');div.className='mf-item';

    const left=document.createElement('div');left.className='mf-left';
    const thumb=m.img?document.createElement('img'):document.createElement('div');
    thumb.className='mf-thumb'+(m.img?'':' mf-thumb-ph');
    if(m.img){
      thumb.src=m.img;
      thumb.alt='market';
      thumb.loading='lazy';
      thumb.draggable=false;
      thumb.referrerPolicy='no-referrer';
      thumb.addEventListener('error',()=>{
        thumb.className='mf-thumb mf-thumb-ph';
        thumb.removeAttribute('src');
        thumb.textContent='PM';
      },{once:true});
    }else{
      thumb.textContent='PM';
    }

    const main=document.createElement('div');main.className='mf-main';
    const q=document.createElement('div');q.className='mf-q';q.textContent=m.q;
    const meta=document.createElement('div');meta.className='mf-meta';
    const cat=document.createElement('span');cat.textContent=m.tag||nicheLabel(m.niche);
    const sep=document.createElement('span');sep.className='mf-sep';sep.textContent='•';
    const vol=document.createElement('span');vol.textContent='Vol. '+m.vol;
    meta.append(cat,sep,vol);
    main.append(q,meta);
    left.append(thumb,main);

    const right=document.createElement('div');right.className='mf-right';
    const prob=document.createElement('div');prob.className='mf-prob '+(m.up?'up':'down');prob.textContent=m.yes+'%';
    const bar=document.createElement('div');bar.className='mf-bar';
    const fill=document.createElement('div');fill.className='mf-bar-fill '+(m.up?'up':'down');fill.style.width=m.yes+'%';
    bar.appendChild(fill);
    right.append(prob,bar);

    div.append(left,right);
    feed.appendChild(div);
  });
}
async function loadGammaInitialFeed(){
  try{
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(),4500);
    const res=await fetch('https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=500&order=volume&ascending=false',{mode:'cors',signal:ctrl.signal});
    clearTimeout(t);
    if(!res.ok)throw new Error('Gamma '+res.status);
    const raw=await res.json();
    const parsed=raw.map(parseGammaMarket).filter(Boolean);
    const selected=pickFeedMarkets(parsed,6);
    if(selected.length>=4){
      feed_data.length=0;
      selected.forEach(m=>feed_data.push(m));
      renderFeed();
    }
  }catch(err){
    console.info('[market-feed] using fallback data',(err&&err.message)||err);
  }
}
if(feed){
  renderFeed();
  loadGammaInitialFeed();

  // live-ish ticking
  setInterval(()=>{
    if(!feed_data.length)return;
    const items=feed.querySelectorAll('.mf-item');
    if(!items.length)return;
    const idx=Math.floor(Math.random()*feed_data.length);
    const delta=Math.round((Math.random()-.5)*4);
    feed_data[idx].yes=Math.max(5,Math.min(95,feed_data[idx].yes+delta));
    feed_data[idx].up=feed_data[idx].yes>=50;
    const prob=items[idx].querySelector('.mf-prob');
    const bar=items[idx].querySelector('.mf-bar-fill');
    if(prob&&bar){
      prob.textContent=feed_data[idx].yes+'%';
      bar.style.width=feed_data[idx].yes+'%';
      prob.classList.toggle('up',feed_data[idx].up);
      prob.classList.toggle('down',!feed_data[idx].up);
      bar.classList.toggle('up',feed_data[idx].up);
      bar.classList.toggle('down',!feed_data[idx].up);
    }
  },1800);
}

/* ── PROTOCOL CANVAS ── */
let protoRAF=null;
let protoVisible=false;
function stopProto(){
  if(protoRAF){
    cancelAnimationFrame(protoRAF);
    protoRAF=null;
  }
}
function initProto(){
  const cv=document.getElementById('protoCanvas');if(!cv)return;
  if(!protoVisible)return;
  stopProto();
  const W=cv.parentElement.offsetWidth||900;
  const H=W<700?Math.max(440,W*.88):Math.max(420,W*.46);
  const dpr=window.devicePixelRatio||1;
  cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);

  const N1='#181e28',N2='#1e2530';
  const BLUE='#4f8ef7',GREEN='#34d07f',POLY='#2E5CFF',KALSHI='#28CC95',GOLD='#f0b429';
  const TEXT='#e8eaf0',MUTED='#6b7585',FAINT='rgba(255,255,255,.06)';

  const PAD=20;
  const SRC_W=Math.min(W<700?110:140,Math.max(92,(W-260)/4));
  const SRC_H=W<700?44:52;
  const cW=Math.min(Math.max(W<700?236:360,W*(W<700?.66:.56)),560);
  const cH=W<700?156:176;
  const cX=(W-cW)/2;
  const cY=W<700?22:26;

  const sW=Math.min(cW-24,W<700?cW*.78:cW*.6),sH=W<700?44:50;
  const flowGap=W<700?44:48;
  const sX=cX+(cW-sW)/2,sY=cY+cH+flowGap;

  const srcNodes=W<700
    ?[
      {label:'External',name:'Polymarket',c:POLY,side:'left',x:PAD,y:cY+6,w:SRC_W,h:SRC_H},
      {label:'External',name:'Kalshi',c:KALSHI,side:'left',x:PAD,y:cY+66,w:SRC_W,h:SRC_H},
      {label:'Cross-fork',name:'Other Kuest Sites',c:GREEN,side:'left',x:PAD,y:cY+110,w:SRC_W,h:SRC_H},
    ]
    :[
      {label:'External',name:'Polymarket',c:POLY,side:'left',x:PAD,y:cY+8,w:SRC_W,h:SRC_H},
      {label:'External',name:'Kalshi',c:KALSHI,side:'left',x:PAD,y:cY+82,w:SRC_W,h:SRC_H},
      {label:'Cross-fork',name:'Other Kuest Sites',c:GREEN,side:'right',x:W-PAD-SRC_W,y:cY+34,w:SRC_W,h:SRC_H},
    ];

  const OUT_H=36;
  const usersW=W<700?Math.min(W-PAD*2,184):Math.min(192,Math.max(146,sW*.62));
  const outY=Math.min(H-OUT_H-8,sY+sH+(W<700?56:60));
  const usersNode={
    label:'Audience',
    name:'Your trading users',
    c:GREEN,
    x:Math.max(PAD,sX+(sW-usersW)/2),
    y:outY,
    w:usersW,
    h:OUT_H
  };

  const chips=['Market Makers','Shared CLOB','Arbitrage Bots','Relayer (gasless)','Smart Contracts','UMA Oracle'];

  const j=(v,a)=>v+((Math.random()*2-1)*a);
  function sourceToCorePath(n,jt=0){
    const sx=j(n.side==='left'?n.x+n.w:n.x,jt);
    const sy=j(n.y+n.h/2,jt*.45);
    const ex=j(n.side==='left'?cX:cX+cW,jt);
    const ey=j(cY+cH/2,jt*.45);
    const mx=j(sx+(ex-sx)*.5,jt*.5);
    return{sx,sy,ex,ey,c1x:mx,c1y:sy,c2x:mx,c2y:ey};
  }
  function coreToSitePath(jt=0){
    const sx=j(cX+cW/2-6,jt),sy=j(cY+cH,jt*.4);
    const ex=j(sX+sW/2-6,jt),ey=j(sY,jt*.4);
    return{
      sx,sy,ex,ey,
      c1x:j(sx-4,jt*.35),c1y:j(sy+16,jt*.35),
      c2x:j(ex-4,jt*.35),c2y:j(ey-16,jt*.35)
    };
  }
  function siteToCorePath(jt=0){
    const sx=j(sX+sW/2+6,jt),sy=j(sY,jt*.4);
    const ex=j(cX+cW/2+6,jt),ey=j(cY+cH,jt*.4);
    return{
      sx,sy,ex,ey,
      c1x:j(sx+4,jt*.35),c1y:j(sy-16,jt*.35),
      c2x:j(ex+4,jt*.35),c2y:j(ey+16,jt*.35)
    };
  }
  function usersToSitePath(jt=0){
    const sx=j(usersNode.x+usersNode.w/2,jt*.35);
    const sy=j(usersNode.y,jt*.25);
    const ex=j(sX+sW/2,jt*.3);
    const ey=j(sY+sH,jt*.25);
    const rise=Math.max(14,sy-ey);
    return{
      sx,sy,ex,ey,
      c1x:j(sx,jt*.25),c1y:j(sy-rise*.42,jt*.25),
      c2x:j(ex,jt*.25),c2y:j(ey+rise*.22,jt*.25)
    };
  }

  const PCOUNT=22;const PATH_JITTER=W<700?1.2:1.65;const parts=[];
  function mkP(){
    const roll=Math.random();let path,color;
    if(roll<.36){
      const n=srcNodes[Math.floor(Math.random()*srcNodes.length)];
      color=n.c;path=sourceToCorePath(n,PATH_JITTER);
    }else if(roll<.56){
      color=BLUE;path=coreToSitePath(PATH_JITTER);
    }else if(roll<.72){
      color=GREEN;path=siteToCorePath(PATH_JITTER);
    }else{
      color=GREEN;path=usersToSitePath(PATH_JITTER);
    }
    return{path,color,t:Math.random(),sp:.0028+Math.random()*.0038,sz:1.55+Math.random()*1.35,tail:.1+Math.random()*.08};
  }
  for(let i=0;i<PCOUNT;i++)parts.push(mkP());
  const REVENUE_TEXT='Revenue by Fees';
  const revPulse={active:false,t:0,sp:.0056,path:usersToSitePath(0)};
  function spawnRevPulse(){
    revPulse.active=true;
    revPulse.t=0;
    revPulse.sp=.0048+Math.random()*.0024;
    revPulse.path=usersToSitePath(PATH_JITTER*.35);
  }
  function bz(p,t){const m=1-t;return{x:m*m*m*p.sx+3*m*m*t*p.c1x+3*m*t*t*p.c2x+t*t*t*p.ex,y:m*m*m*p.sy+3*m*m*t*p.c1y+3*m*t*t*p.c2y+t*t*t*p.ey};}
  function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}

  let frame=0;
  function loop(){
    protoRAF=requestAnimationFrame(loop);frame++;
    ctx.clearRect(0,0,W,H);
    const pulse=(Math.sin(frame*.022)+1)/2;
    // guide lines: sources -> core
    srcNodes.forEach(n=>{
      const p=sourceToCorePath(n,0);
      ctx.beginPath();ctx.moveTo(p.sx,p.sy);ctx.bezierCurveTo(p.c1x,p.c1y,p.c2x,p.c2y,p.ex,p.ey);
      ctx.strokeStyle=FAINT;ctx.lineWidth=1;ctx.stroke();
    });
    // guide lines: core <-> site (bidirectional)
    const pCoreToSite=coreToSitePath(0);
    ctx.beginPath();
    ctx.moveTo(pCoreToSite.sx,pCoreToSite.sy);
    ctx.bezierCurveTo(pCoreToSite.c1x,pCoreToSite.c1y,pCoreToSite.c2x,pCoreToSite.c2y,pCoreToSite.ex,pCoreToSite.ey);
    ctx.strokeStyle='rgba(79,142,247,.16)';ctx.lineWidth=1;ctx.stroke();
    const pSiteToCore=siteToCorePath(0);
    ctx.beginPath();
    ctx.moveTo(pSiteToCore.sx,pSiteToCore.sy);
    ctx.bezierCurveTo(pSiteToCore.c1x,pSiteToCore.c1y,pSiteToCore.c2x,pSiteToCore.c2y,pSiteToCore.ex,pSiteToCore.ey);
    ctx.strokeStyle='rgba(52,208,127,.16)';ctx.lineWidth=1;ctx.stroke();
    // guide line: users -> your site
    const pUsersToSite=usersToSitePath(0);
    ctx.beginPath();
    ctx.moveTo(pUsersToSite.sx,pUsersToSite.sy);
    ctx.bezierCurveTo(pUsersToSite.c1x,pUsersToSite.c1y,pUsersToSite.c2x,pUsersToSite.c2y,pUsersToSite.ex,pUsersToSite.ey);
    ctx.strokeStyle='rgba(52,208,127,.14)';ctx.lineWidth=1;ctx.stroke();
    // particles (under node labels)
    parts.forEach(p=>{
      p.t+=p.sp;
      if(p.t>1){
        const np=mkP();
        p.path=np.path;p.color=np.color;p.t=0;p.sp=np.sp;p.sz=np.sz;p.tail=np.tail;
      }
      for(let s=7;s>=0;s--){
        const tt=Math.max(0,p.t-s*p.tail/7),pos=bz(p.path,tt),alpha=(1-s/7)*.7,r2=p.sz*(1-s/7*.5);
        ctx.beginPath();ctx.arc(pos.x,pos.y,r2,0,Math.PI*2);
        ctx.fillStyle=p.color+Math.round(alpha*255).toString(16).padStart(2,'0');
        ctx.fill();
      }
      const pos=bz(p.path,p.t);
      ctx.beginPath();ctx.arc(pos.x,pos.y,p.sz*1.5,0,Math.PI*2);
      ctx.fillStyle=p.color+'1a';ctx.fill();
    });
    if(!revPulse.active&&Math.random()<.009)spawnRevPulse();
    if(revPulse.active){
      revPulse.t+=revPulse.sp;
      if(revPulse.t>=1){
        revPulse.active=false;
      }else{
        const p=bz(revPulse.path,revPulse.t);
        const a=Math.max(.24,1-revPulse.t*.72);
        ctx.beginPath();ctx.arc(p.x,p.y,4.2,0,Math.PI*2);
        ctx.fillStyle=`rgba(240,180,41,${a*.2})`;ctx.fill();
        ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);
        ctx.fillStyle=`rgba(240,180,41,${a})`;ctx.fill();
        ctx.font=`600 ${W<700?8:9}px 'Geist Mono',monospace`;
        ctx.fillStyle=`rgba(240,180,41,${a})`;
        ctx.textAlign='left';
        ctx.fillText(REVENUE_TEXT,p.x+8,p.y-5);
      }
    }
    // nodes
    srcNodes.forEach(r=>{
      const isOther=r.name==='Other Kuest Sites';
      if(isOther){
        ctx.fillStyle=`rgba(52,208,127,${.05+pulse*.03})`;
        ctx.strokeStyle=`rgba(52,208,127,${.28+pulse*.18})`;
        ctx.lineWidth=1.3;
      }else{
        ctx.fillStyle=N1;
        ctx.strokeStyle='rgba(255,255,255,.07)';
        ctx.lineWidth=1;
      }
      rr(r.x,r.y,r.w,r.h,6);ctx.fill();ctx.stroke();
      ctx.font=`${W<700?8:9}px 'Geist Mono',monospace`;ctx.fillStyle=MUTED;ctx.textAlign='center';
      ctx.fillText(r.label,r.x+r.w/2,r.y+(W<700?13:15));
      const nameSize=W<700?10:12;
      ctx.font=`600 ${nameSize}px 'Open Sauce One',sans-serif`;ctx.fillStyle=r.c;
      ctx.fillText(r.name,r.x+r.w/2,r.y+(W<700?27:32));
    });
    const glowCx=cX+cW/2,glowCy=cY+cH/2+(W<700?22:28);
    const targetGlowR=Math.max(cW*1.12,cH*1.75);
    const maxNoClipR=Math.max(40,Math.min(glowCx-8,W-glowCx-8,glowCy-8,H-glowCy-8));
    const glowR=Math.min(targetGlowR,maxNoClipR);
    const cg=ctx.createRadialGradient(glowCx,glowCy,0,glowCx,glowCy,glowR);
    cg.addColorStop(0,`rgba(79,142,247,${.12+pulse*.05})`);
    cg.addColorStop(.62,`rgba(79,142,247,${.036+pulse*.018})`);
    cg.addColorStop(1,'rgba(79,142,247,0)');
    ctx.save();
    ctx.fillStyle=cg;
    ctx.beginPath();
    ctx.arc(glowCx,glowCy,glowR,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle=N2;ctx.strokeStyle=`rgba(79,142,247,${.22+pulse*.18})`;ctx.lineWidth=1.5;rr(cX,cY,cW,cH,10);ctx.fill();ctx.stroke();
    const coreTitleSize=W<700?16:21,coreSubSize=W<700?9:11;
    ctx.font=`700 ${coreTitleSize}px 'Open Sauce One',sans-serif`;ctx.fillStyle=BLUE;ctx.textAlign='center';ctx.fillText('KUEST PROTOCOL',cX+cW/2,cY+(W<700?28:34));
    ctx.font=`${coreSubSize}px 'Geist Mono',monospace`;ctx.fillStyle=MUTED;ctx.fillText("We run this. You don't touch it.",cX+cW/2,cY+(W<700?44:52));
    const chipCols=3,cGX=W<700?7:10,cW2=Math.min(130,(cW-cGX*(chipCols-1))/chipCols);
    const cH2=cW2>=118?28:cW2>=100?25:22,cGY=W<700?7:9,startX=cX+(cW-(chipCols*cW2+(chipCols-1)*cGX))/2;
    const chipTop=cY+(W<700?58:74),chipFont=cW2>=118?10:cW2>=100?9:8;
    ctx.textBaseline='middle';
    chips.forEach((chip,i)=>{const col=i%3,row=Math.floor(i/3),cx2=startX+col*(cW2+cGX),cy2=chipTop+row*(cH2+cGY);ctx.fillStyle='rgba(79,142,247,.1)';ctx.strokeStyle='rgba(79,142,247,.26)';ctx.lineWidth=1;rr(cx2,cy2,cW2,cH2,5);ctx.fill();ctx.stroke();ctx.font=`${chipFont}px 'Geist Mono',monospace`;ctx.fillStyle=BLUE;ctx.textAlign='center';ctx.fillText(chip,cx2+cW2/2,cy2+cH2/2);});
    ctx.textBaseline='alphabetic';
    // your site
    ctx.fillStyle=`rgba(52,208,127,${.05+pulse*.03})`;ctx.strokeStyle=`rgba(52,208,127,${.28+pulse*.18})`;ctx.lineWidth=1.5;rr(sX,sY,sW,sH,6);ctx.fill();ctx.stroke();
    ctx.font=`700 ${W<700?11:14}px 'Open Sauce One',sans-serif`;ctx.fillStyle=GREEN;ctx.textAlign='center';ctx.fillText('YOUR KUEST SITE',sX+sW/2,sY+(W<700?17:18));
    ctx.font=`${W<700?8:9}px 'Geist Mono',monospace`;ctx.fillStyle=MUTED;ctx.fillText('Brand · URL · Fee rate · Niche',sX+sW/2,sY+(W<700?30:32));
    // audience node
    ctx.fillStyle=`rgba(52,208,127,${.045+pulse*.02})`;
    ctx.strokeStyle=`rgba(52,208,127,${.2+pulse*.12})`;
    ctx.lineWidth=1;
    rr(usersNode.x,usersNode.y,usersNode.w,usersNode.h,6);ctx.fill();ctx.stroke();
    ctx.font=`${W<700?7:8}px 'Geist Mono',monospace`;ctx.fillStyle=MUTED;ctx.textAlign='center';
    ctx.fillText(usersNode.label,usersNode.x+usersNode.w/2,usersNode.y+(W<700?11:12));
    ctx.font=`600 ${W<700?10:12}px 'Open Sauce One',sans-serif`;ctx.fillStyle=GREEN;
    ctx.fillText(usersNode.name,usersNode.x+usersNode.w/2,usersNode.y+(W<700?24:27));
  }
  loop();
}
const protoObs=new IntersectionObserver(es=>es.forEach(e=>{
  protoVisible=e.isIntersecting;
  if(protoVisible){
    initProto();
  }else{
    stopProto();
  }
}),{threshold:.1});
const pEl=document.getElementById('protoCanvas');if(pEl)protoObs.observe(pEl.parentElement||pEl);
window.addEventListener('resize',()=>{if(protoVisible)initProto();});

/* ── FEE REVENUE ESTIMATOR ── */
(function(){
  const slider=document.getElementById('feeSlider');
  const rateDown=document.getElementById('feeRateDown');
  const rateUp=document.getElementById('feeRateUp');
  const volEl=document.getElementById('feeVol');
  const resultEl=document.getElementById('feeResult');
  const rateEl=document.querySelector('.fee-rate-val');
  const scaleDots=[...document.querySelectorAll('.calc-scale-dot')];
  const scaleItems=[...document.querySelectorAll('.calc-scale-item')];
  if(!slider||!volEl||!resultEl)return;

  const dailyVolumes=[10000,100000,500000,1000000,5000000,10000000,50000000];
  let feeRatePct=1;

  const fmtUSD=n=>'$'+Number(n).toLocaleString('en-US',{maximumFractionDigits:0});
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const fmtPct=n=>`${Number.isInteger(n)?n.toFixed(0):n.toFixed(1)}%`;
  const stepRate=delta=>{
    feeRatePct=clamp(Number((feeRatePct+delta).toFixed(1)),0.5,9);
  };
  const paintSliderFill=el=>{
    const min=Number(el.min)||0;
    const max=Number(el.max)||100;
    const val=Number(el.value)||min;
    const pct=max>min?((val-min)/(max-min))*100:0;
    el.style.setProperty('--fill-pct',pct.toFixed(2)+'%');
    const wrap=el.closest('.fee-slider-wrap');
    if(wrap)wrap.style.setProperty('--fill-pct',pct.toFixed(2)+'%');
  };

  function render(){
    const idx=clamp((parseInt(slider.value,10)||1)-1,0,dailyVolumes.length-1);
    const dailyVol=dailyVolumes[idx];
    const feeRate=feeRatePct/100;
    const monthlyRevenue=dailyVol*30*feeRate;
    volEl.textContent=fmtUSD(dailyVol);
    resultEl.textContent=fmtUSD(monthlyRevenue);
    paintSliderFill(slider);
    if(rateEl)rateEl.textContent=fmtPct(feeRatePct);
    if(rateDown)rateDown.disabled=feeRatePct<=0.5;
    if(rateUp)rateUp.disabled=feeRatePct>=9;
    if(scaleDots.length){
      scaleDots.forEach((dot,dotIdx)=>{
        dot.classList.toggle('is-active',dotIdx<=idx);
      });
    }
    if(scaleItems.length){
      scaleItems.forEach((item,itemIdx)=>{
        item.classList.toggle('is-active',itemIdx<=idx);
      });
    }
  }

  slider.addEventListener('input',render);
  if(rateDown)rateDown.addEventListener('click',()=>{stepRate(-0.5);render();});
  if(rateUp)rateUp.addEventListener('click',()=>{stepRate(0.5);render();});
  render();
})();

/* ── MINI VOTE FEES DEMO ── */
(function(){
  const voteDemos=document.querySelectorAll('.mini-vote-demo');
  if(!voteDemos.length)return;

  voteDemos.forEach(demo=>{
    let resetTimer=null;
    demo.querySelectorAll('[data-fee-trigger]').forEach(trigger=>{
      trigger.addEventListener('click',()=>{
        demo.classList.remove('is-bursting');
        void demo.offsetWidth;
        demo.classList.add('is-bursting');
        if(resetTimer)window.clearTimeout(resetTimer);
        resetTimer=window.setTimeout(()=>{
          demo.classList.remove('is-bursting');
        },1100);
      });
    });
  });
})();

/* ── NICHE SHOWCASE ── */
(function(){
  if(!Array.isArray(window.NICHE_DATA)||!window.NICHE_DATA.length)return;
  const nicheGrid=document.getElementById('nicheCardsGrid');
  const nicheTabs=document.getElementById('nicheTabs');
  const tagline=document.getElementById('nicheTagline');
  if(!nicheGrid||!nicheTabs||!tagline)return;

  const ui=window.KUEST_I18N_UI||{yes:'Yes',no:'No',chance:'chance'};
  let nicheTimer=null;
  let currentNiche=0;
  let nicheHovered=false;

  function createNode(tag,className,text){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!=null)node.textContent=String(text);
    return node;
  }

  function createSvgNode(tag,attrs){
    const node=document.createElementNS('http://www.w3.org/2000/svg',tag);
    Object.keys(attrs).forEach(function(key){
      node.setAttribute(key,String(attrs[key]));
    });
    return node;
  }

  function createActionButton(label,className){
    const button=createNode('button',className,label);
    button.type='button';
    return button;
  }

  function sanitizeImageSrc(src){
    return typeof src==='string'&&/^\/assets\/images\/[\w./-]+$/.test(src)
      ? src
      : '/assets/images/bitcoin-150k.png';
  }

  function createGauge(card){
    const arcLen=62.8;
    const offset=arcLen-(arcLen*card.pct/100);
    const gauge=createNode('div','niche-market-gauge');
    const svg=createSvgNode('svg',{width:'48',height:'32',viewBox:'0 0 48 32',fill:'none'});
    svg.appendChild(createSvgNode('path',{
      d:'M4 28 A20 20 0 0 1 44 28',
      stroke:'#2a3040',
      'stroke-width':'5',
      'stroke-linecap':'round'
    }));
    svg.appendChild(createSvgNode('path',{
      d:'M4 28 A20 20 0 0 1 44 28',
      stroke:'#4f8ef7',
      'stroke-width':'5',
      'stroke-linecap':'round',
      'stroke-dasharray':'62.8',
      'stroke-dashoffset':offset
    }));
    gauge.appendChild(svg);
    gauge.appendChild(createNode('div','niche-market-gauge-value',card.pct + '%'));
    gauge.appendChild(createNode('div','niche-market-gauge-label',ui.chance));
    return gauge;
  }

  function buildCardElement(card){
    const cardEl=createNode('div','niche-market-card');
    const head=createNode('div','niche-market-head');
    const thumb=document.createElement('img');
    thumb.src=sanitizeImageSrc(card.img);
    thumb.alt='';
    thumb.className='niche-market-thumb';
    const titleWrap=createNode('div','niche-market-title-wrap');
    titleWrap.appendChild(createNode('div','niche-market-title',card.title));
    head.appendChild(thumb);
    head.appendChild(titleWrap);
    if(card.type==='single'){
      head.appendChild(createGauge(card));
    }
    cardEl.appendChild(head);

    if(card.type==='single'){
      const body=createNode('div','niche-market-body niche-market-body-single');
      const actions=createNode('div','niche-market-actions');
      actions.appendChild(createActionButton(ui.yes,'niche-market-btn niche-market-btn-yes'));
      actions.appendChild(createActionButton(ui.no,'niche-market-btn niche-market-btn-no'));
      body.appendChild(actions);
      cardEl.appendChild(body);
    }else{
      const body=createNode('div','niche-market-body niche-market-body-multi');
      const list=createNode('div','niche-market-list');
      card.rows.forEach(function(row){
        const rowEl=createNode('div','niche-market-list-row');
        const actions=createNode('div','niche-market-row-actions');
        actions.appendChild(createNode('span','niche-market-row-pct',row.pct + '%'));
        actions.appendChild(createActionButton(ui.yes,'niche-market-btn niche-market-btn-mini niche-market-btn-yes'));
        actions.appendChild(createActionButton(ui.no,'niche-market-btn niche-market-btn-mini niche-market-btn-no'));
        rowEl.appendChild(createNode('span','niche-market-row-label',row.label));
        rowEl.appendChild(actions);
        list.appendChild(rowEl);
      });
      body.appendChild(list);
      cardEl.appendChild(body);
    }

    const footer=createNode('div','niche-market-footer');
    footer.appendChild(createNode('span','niche-market-volume',card.vol));
    footer.appendChild(createNode('span','niche-market-category',card.cat));
    cardEl.appendChild(footer);

    return cardEl;
  }

  function setNicheHoverState(nextHovered){
    nicheHovered=nextHovered;
    if(nicheHovered){
      clearInterval(nicheTimer);
    }else{
      restartNicheTimer();
    }
  }

  nicheGrid.addEventListener('mouseenter',function(){setNicheHoverState(true);});
  nicheGrid.addEventListener('mouseleave',function(){setNicheHoverState(false);});
  nicheTabs.addEventListener('mouseenter',function(){setNicheHoverState(true);});
  nicheTabs.addEventListener('mouseleave',function(){setNicheHoverState(false);});

  function showNiche(index){
    currentNiche=index;
    const data=window.NICHE_DATA[index];
    if(!data)return;

    tagline.textContent=data.tagline;
    tagline.style.color='rgba(' + data.accentRgb + ',0.88)';

    nicheGrid.style.opacity='0';
    nicheGrid.style.transition='opacity .25s';
    setTimeout(function(){
      const fragment=document.createDocumentFragment();
      data.cards.forEach(function(card){
        fragment.appendChild(buildCardElement(card));
      });
      nicheGrid.replaceChildren(fragment);
      nicheGrid.style.opacity='1';
    },250);

    document.querySelectorAll('.niche-tab').forEach(function(tab,tabIndex){
      const tabData=window.NICHE_DATA[tabIndex];
      if(!tabData)return;
      if(tabIndex===index){
        tab.classList.add('is-active');
        tab.style.borderColor='rgba(' + tabData.accentRgb + ',0.46)';
        tab.style.background='rgba(' + tabData.accentRgb + ',0.12)';
        tab.style.color=tabData.accent;
        tab.style.boxShadow='0 10px 28px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.03)';
      }else{
        tab.classList.remove('is-active');
        tab.style.borderColor='rgba(255,255,255,0.08)';
        tab.style.background='transparent';
        tab.style.color='#6b7585';
        tab.style.boxShadow='none';
      }
    });
  }

  function restartNicheTimer(){
    clearInterval(nicheTimer);
    if(nicheHovered)return;
    nicheTimer=setInterval(function(){
      showNiche((currentNiche+1)%window.NICHE_DATA.length);
    },7000);
  }

  document.querySelectorAll('.niche-tab').forEach(function(tab){
    tab.addEventListener('click',function(){
      showNiche(parseInt(tab.dataset.niche,10)||0);
      restartNicheTimer();
    });
  });

  window.showNiche=showNiche;
  showNiche(0);
  restartNicheTimer();
})();

/* ── LANGUAGE DEMO ── */
(function(){
  const select=document.getElementById('languageDemoSelect');
  const chips=[...document.querySelectorAll('[data-lang-chip]')];
  if(!select||chips.length!==3)return;

  const labels={
    en:['Soccer','Politics','Crypto'],
    de:['Fußball','Politik','Krypto'],
    es:['Fútbol','Política','Cripto'],
    pt:['Futebol','Política','Cripto'],
    fr:['Football','Politique','Crypto'],
    zh:['足球','政治','加密']
  };

  function renderLanguageChips(){
    const values=labels[select.value]||labels.en;
    chips.forEach(function(chip,index){
      chip.textContent=values[index]||'';
    });
  }

  select.addEventListener('change',renderLanguageChips);
  renderLanguageChips();
})();

/* ── SOURCE MODAL ── */
(function(){
  const modal=document.getElementById('sourceModal');
  if(!modal)return;
  const outletEl=document.getElementById('sourceModalOutlet');
  const titleEl=document.getElementById('sourceModalTitle');
  const urlEl=document.getElementById('sourceModalUrl');
  const frameWrapEl=document.getElementById('sourceModalFrameWrap');
  const frameEl=document.getElementById('sourceModalFrame');
  const noteEl=document.getElementById('sourceModalNote');
  const externalEl=document.getElementById('sourceModalExternal');
  const closeEls=modal.querySelectorAll('[data-source-close]');
  if(!outletEl||!titleEl||!urlEl||!frameWrapEl||!frameEl||!noteEl||!externalEl)return;

  let loadTimeout=null;
  const t=(key,options,fallback)=>{
    if(window.KUEST_I18N&&typeof window.KUEST_I18N.t==='function')return window.KUEST_I18N.t(key,options)||fallback;
    return fallback;
  };

  const clearLoading=()=>{
    if(loadTimeout){
      window.clearTimeout(loadTimeout);
      loadTimeout=null;
    }
    frameWrapEl.classList.remove('is-loading');
  };

  const close=()=>{
    clearLoading();
    frameEl.src='about:blank';
    modal.hidden=true;
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  };

  const getSafeSourceUrl=href=>{
    if(typeof href!=='string'||!href.trim())return null;
    try{
      const url=new URL(href,window.location.origin);
      return url.protocol==='https:'||url.protocol==='http:'?url:null;
    }catch{
      return null;
    }
  };

  const open=link=>{
    const safeUrl=getSafeSourceUrl(link.getAttribute('href')||'');
    if(!safeUrl)return;
    const href=safeUrl.href;
    const outlet=link.dataset.sourceOutlet||'Source';
    const title=link.dataset.sourceTitle||link.textContent.trim();
    const domain=safeUrl.hostname.replace(/^www\./,'');
    clearLoading();
    outletEl.textContent=outlet;
    titleEl.textContent=title;
    urlEl.textContent=domain;
    noteEl.textContent=t('sourceModal.dynamicNote',{domain},`Embedded preview for ${domain}. If the publisher blocks embeds, use the external link below.`);
    externalEl.href=href;
    frameWrapEl.classList.add('is-loading');
    frameEl.src='about:blank';
    modal.hidden=false;
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    loadTimeout=window.setTimeout(()=>frameWrapEl.classList.remove('is-loading'),4500);
    frameEl.src=href;
  };

  frameEl.addEventListener('load',clearLoading);

  document.addEventListener('click',e=>{
    const link=e.target.closest('.source-link');
    if(!link)return;
    e.preventDefault();
    open(link);
  });

  closeEls.forEach(el=>el.addEventListener('click',close));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!modal.hidden)close();
  });
})();

updateSpine();
