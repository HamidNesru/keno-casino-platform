import { useEffect, useMemo, useState } from 'react';
import { PAY, fmt, id, nums, rnd, shuffle, type GameId, type Player, type Round } from './keno';
import './styles.css';

type Store={players:Player[]; rounds:Round[]; current:string};
const KEY='casino-demo-platform-v2';
const initialPlayers:Player[]=[
 {id:'p1',username:'You',credits:10000,active:true,joined:Date.now()-86400000*10},
 {id:'p2',username:'Abebe',credits:8200,active:true,joined:Date.now()-86400000*4},
 {id:'p3',username:'Miki',credits:15400,active:true,joined:Date.now()-86400000*7},
 {id:'p4',username:'Daniel',credits:6400,active:false,joined:Date.now()-86400000*12},
 {id:'p5',username:'Sara',credits:22300,active:true,joined:Date.now()-86400000*2},
];
function load():Store{try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s?.players)return s}catch{}return{players:initialPlayers,rounds:[],current:'p1'}}
function money(n:number){return fmt(n)+' VC'}

const gameNames:Record<GameId,string>={keno:'Keno',aviator:'Aviator',dice:'Dice',roulette:'Roulette',slots:'Slots'};

function App(){
 const [store,setStore]=useState<Store>(load);
 const [page,setPage]=useState<'games'|'admin'>('games');
 const [game,setGame]=useState<GameId>('keno');
 const [message,setMessage]=useState('');
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(store)),[store]);
 const player=store.players.find(p=>p.id===store.current)!;
 const updatePlayer=(credits:number)=>setStore(s=>({...s,players:s.players.map(p=>p.id===s.current?{...p,credits}:p)}));
 const addRound=(r:Round)=>setStore(s=>({...s,rounds:[r,...s.rounds].slice(0,200)}));
 const debit=(stake:number)=>{if(player.credits<stake){setMessage('Not enough virtual credits.');return false}updatePlayer(player.credits-stake);return true};
 const settle=(stake:number,payout:number,label:string)=>{updatePlayer(player.credits-stake+payout);addRound({id:id(),at:Date.now(),game,stake,payout,label})};
 function reset(){if(confirm('Reset the demo platform to its starting balances?'))setStore({players:initialPlayers,rounds:[],current:'p1'});}
 return <div className="app">
   <header className="topbar"><button className="brand" onClick={()=>setPage('games')}><span>◆</span> DALO<span>LAB</span> DEMO</button><div className="top-actions"><div className="user-pill">{player.username}<b>{money(player.credits)}</b></div><button className={page==='games'?'gold active':''} onClick={()=>setPage('games')}>Games</button><button className={page==='admin'?'gold active':''} onClick={()=>setPage('admin')}>Admin</button></div></header>
   <div className="notice">Virtual credits only — no deposits, withdrawals, cash value, or real-money wagering.</div>
   {page==='games'?<Games game={game} setGame={setGame} player={player} store={store} debit={debit} settle={settle} message={message} setMessage={setMessage}/>:<Admin store={store} setStore={setStore} reset={reset}/>} 
 </div>
}

function Games({game,setGame,player,store,debit,settle,message,setMessage}:{game:GameId;setGame:(g:GameId)=>void;player:Player;store:Store;debit:(n:number)=>boolean;settle:(s:number,p:number,l:string)=>void;message:string;setMessage:(s:string)=>void}){
 const games:GameId[]=['keno','aviator','dice','roulette','slots'];
 return <main className="shell">
  <nav className="game-nav">{games.map(g=><button key={g} className={game===g?'selected':''} onClick={()=>{setGame(g);setMessage('')}}><span>{g==='keno'?'80':g==='aviator'?'✈':g==='dice'?'⚄':g==='roulette'?'◎':'♜'}</span>{gameNames[g]}</button>)}</nav>
  {game==='keno'&&<Keno player={player} store={store} debit={debit} settle={settle} message={message} setMessage={setMessage}/>} 
  {game==='aviator'&&<Aviator player={player} debit={debit} settle={settle} message={message} setMessage={setMessage}/>} 
  {game==='dice'&&<Dice player={player} debit={debit} settle={settle} message={message} setMessage={setMessage}/>} 
  {game==='roulette'&&<Roulette player={player} debit={debit} settle={settle} message={message} setMessage={setMessage}/>} 
  {game==='slots'&&<Slots player={player} debit={debit} settle={settle} message={message} setMessage={setMessage}/>} 
  <Recent rounds={store.rounds.filter(r=>r.game===game)} />
 </main>
}

function Keno({player,store,debit,settle,message,setMessage}:{player:Player;store:Store;debit:(n:number)=>boolean;settle:(s:number,p:number,l:string)=>void;message:string;setMessage:(s:string)=>void}){
 const [picks,setPicks]=useState<number[]>([]),[drawn,setDrawn]=useState<number[]>([]),[bet,setBet]=useState(100),[busy,setBusy]=useState(false),[tab,setTab]=useState<'game'|'history'|'results'>('game');
 const fake=useMemo(()=>Array.from({length:12},()=>shuffle(nums()).slice(0,1+rnd(10)).sort((a,b)=>a-b)),[]);
 const other=useMemo(()=>{const counts:Record<number,number>={};fake.forEach(a=>a.forEach(n=>counts[n]=(counts[n]||0)+1));return Object.entries(counts).sort((a,b)=>+b[1]-+a[1]).slice(0,8)},[fake]);
 function toggle(n:number){if(busy)return;setDrawn([]);setPicks(p=>p.includes(n)?p.filter(x=>x!==n):p.length<10?[...p,n]:p)}
 async function play(){if(busy||!picks.length||bet<10||!debit(bet))return;setBusy(true);setMessage('Drawing…');setDrawn([]);const d=shuffle(nums()).slice(0,20);for(let i=1;i<=20;i++){setDrawn(d.slice(0,i));await new Promise(r=>setTimeout(r,90))}const m=d.filter(n=>picks.includes(n));const mult=PAY[picks.length]?.[m.length]||0;const payout=mult*bet; if(payout)settle(bet,payout,`${picks.length} picks / ${m.length} hits`);setMessage(`${m.length} hit${m.length===1?'':'s'} — ${payout?`won ${money(payout)}`:'no payout'}`);setBusy(false)}
 const history=store.rounds.filter(r=>r.game==='keno').slice(0,12);
 return <div className="keno-layout">
   <section className="game-stage">
    <div className="stage-head"><div><small>FAST KENO</small><h2>Choose up to 10 numbers</h2><span>From 1 to 80</span></div><div className="timer">00:{busy?'--':'30'}</div></div>
    <div className="draw-strip">{drawn.length?drawn.map(n=><span className={picks.includes(n)?'draw-ball hit':'draw-ball'} key={n}>{n}</span>):<span className="muted">Your drawn numbers will appear here</span>}</div>
    <div className="keno-grid">{nums().map(n=><button key={n} onClick={()=>toggle(n)} className={`${picks.includes(n)?'pick ':''}${drawn.includes(n)?'drawn':''}`}><b>{n}</b>{other.find(x=>+x[0]===n)&&<i>{other.find(x=>+x[0]===n)?.[1]}</i>}</button>)}</div>
    <div className="mobile-selected"><b>Your selected numbers</b><div className="chips">{picks.length?picks.sort((a,b)=>a-b).map(n=><span key={n}>{String(n).padStart(2,'0')}</span>):<em>None selected</em>}</div></div>
    <div className="betbar"><button onClick={()=>setBet(Math.max(10,bet-10))}>−</button><div><small>BET</small><strong>{money(bet)}</strong></div><button onClick={()=>setBet(bet+10)}>+</button><button className="quick" onClick={()=>setPicks(shuffle(nums()).slice(0,picks.length||5))}>QUICK PICK</button><button className="play" disabled={busy||!picks.length||bet<10||player.credits<bet} onClick={play}>BET</button></div>
    <div className="message">{message}</div>
    <div className="mobile-tabs">{(['game','history','results'] as const).map(t=><button className={tab===t?'on':''} onClick={()=>setTab(t)} key={t}>{t==='game'?'🎮 Game':t==='history'?'📜 History':'📊 Results'}</button>)}</div>
    {tab==='history'&&<div className="mobile-panel">{history.map(r=><div className="line" key={r.id}><span>{r.label}</span><b>{r.payout?`+${money(r.payout)}`:'0'}</b></div>)}</div>}
    {tab==='results'&&<div className="mobile-panel"><div className="popular"><b>Other players' selected numbers</b>{other.map(([n,c])=><div key={n}><span>{String(n).padStart(2,'0')}</span><i style={{width:`${Math.min(100,+c*12)}%`}}></i><small>{c} players</small></div>)}</div></div>}
   </section>
   <aside className="keno-side">
    <div className="panel"><h3>MY TICKET</h3><div className="chips">{picks.length?picks.sort((a,b)=>a-b).map(n=><span key={n}>{String(n).padStart(2,'0')}</span>):<em>Select numbers</em>}</div><p>Balance <b>{money(player.credits)}</b></p><p>Stake <b>{money(bet)}</b></p></div>
    <div className="panel"><h3>OTHER PLAYERS</h3>{other.map(([n,c])=><div className="poprow" key={n}><b>{String(n).padStart(2,'0')}</b><span><i style={{width:`${Math.min(100,+c*12)}%`}}/></span><small>{c}</small></div>)}</div>
    <div className="panel"><h3>RECENT RESULTS</h3>{history.slice(0,8).map(r=><div className="line" key={r.id}><span>{r.label}</span><b>{r.payout?`+${money(r.payout)}`:'0'}</b></div>)}</div>
   </aside>
 </div>
}

function Aviator({player,debit,settle,message,setMessage}:{player:Player;debit:(n:number)=>boolean;settle:(s:number,p:number,l:string)=>void;message:string;setMessage:(s:string)=>void}){const [bet,setBet]=useState(100),[mult,setMult]=useState(1),[running,setRunning]=useState(false),[cashed,setCashed]=useState(false);useEffect(()=>{if(!running)return;let m=1;const t=setInterval(()=>{m=+(m+0.07+Math.random()*0.12).toFixed(2);setMult(m);if(m>12){clearInterval(t);setRunning(false);if(!cashed)setMessage('Plane flew away — no payout.')}},120);return()=>clearInterval(t)},[running,cashed]);function start(){if(running||!debit(bet))return;setMult(1);setCashed(false);setMessage('Round started');setRunning(true)}function cash(){if(!running||cashed)return;const p=Math.floor(bet*mult);settle(bet,p,`Cashed at ${mult.toFixed(2)}x`);setCashed(true);setMessage(`Cashed out at ${mult.toFixed(2)}x`)}return <div className="game-card"><div className="aviator-screen"><div className="plane">✈</div><strong>{mult.toFixed(2)}x</strong><span>{running?'FLYING':'READY'}</span></div><div className="controls"><label>Stake<input type="number" value={bet} min={10} onChange={e=>setBet(Math.max(10,+e.target.value||10))}/></label><button disabled={running} onClick={start}>START ROUND</button><button className="gold" disabled={!running||cashed} onClick={cash}>CASH OUT</button></div><div className="message">{message}</div><p className="muted">Aviator-style demo game. Multiplier is simulated and credits have no cash value.</p></div>}
function Dice({player,debit,settle,message,setMessage}:{player:Player;debit:(n:number)=>boolean;settle:(s:number,p:number,l:string)=>void;message:string;setMessage:(s:string)=>void}){const [bet,setBet]=useState(100),[target,setTarget]=useState(50),[roll,setRoll]=useState<number|null>(null);function play(){if(!debit(bet))return;const r=rnd(100)+1;setRoll(r);const win=r<target;const mult=+(99/(target-1)).toFixed(2);const p=win?Math.floor(bet*mult):0;if(p)settle(bet,p,`Roll ${r} under ${target}`);setMessage(win?`You won ${money(p)} at ${mult}x`:`Roll ${r} — no win`)}return <div className="game-card center"><div className="dice-face">{roll??'?'}</div><h2>ROLL UNDER</h2><input className="range" type="range" min="2" max="99" value={target} onChange={e=>setTarget(+e.target.value)}/><div className="big-number">{target}</div><label>Stake <input type="number" value={bet} min={10} onChange={e=>setBet(Math.max(10,+e.target.value||10))}/></label><button className="play wide" onClick={play}>ROLL</button><div className="message">{message}</div></div>}
function Roulette({player,debit,settle,message,setMessage}:{player:Player;debit:(n:number)=>boolean;settle:(s:number,p:number,l:string)=>void;message:string;setMessage:(s:string)=>void}){const [bet,setBet]=useState(100),[choice,setChoice]=useState<'red'|'black'|'green'>('red'),[result,setResult]=useState<number|null>(null);function play(){if(!debit(bet))return;const r=rnd(37);setResult(r);const color=r===0?'green':r%2?'red':'black';const p=color===choice?Math.floor(bet*(choice==='green'?35:2)):0;if(p)settle(bet,p,`Roulette ${r} ${color}`);setMessage(color===choice?`Number ${r} — won ${money(p)}`:`Number ${r} — ${color}`)}return <div className="game-card center"><div className={`roulette-ball ${result===0?'green':result&&result%2?'red':'black'}`}>{result??'?'}</div><div className="choice-row">{(['red','black','green'] as const).map(c=><button className={choice===c?'selected':''} key={c} onClick={()=>setChoice(c)}>{c.toUpperCase()}</button>)}</div><label>Stake <input type="number" value={bet} min={10} onChange={e=>setBet(Math.max(10,+e.target.value||10))}/></label><button className="play wide" onClick={play}>SPIN</button><div className="message">{message}</div></div>}
function Slots({player,debit,settle,message,setMessage}:{player:Player;debit:(n:number)=>boolean;settle:(s:number,p:number,l:string)=>void;message:string;setMessage:(s:string)=>void}){const [bet,setBet]=useState(100),[reels,setReels]=useState(['🍒','🍋','7️⃣']),symbols=['🍒','🍋','🔔','⭐','7️⃣','💎'];function spin(){if(!debit(bet))return;const r=[symbols[rnd(symbols.length)],symbols[rnd(symbols.length)],symbols[rnd(symbols.length)]];setReels(r);const same=r[0]===r[1]&&r[1]===r[2],two=r[0]===r[1]||r[1]===r[2]||r[0]===r[2];const p=same?bet*20:two?bet*3:0;if(p)settle(bet,p,`Slots ${r.join(' ')}`);setMessage(p?`Winner — +${money(p)}`:'No match') }return <div className="game-card center"><div className="slots">{reels.map((r,i)=><div key={i}>{r}</div>)}</div><p>3 matching symbols ×20 · 2 matching ×3</p><label>Stake <input type="number" value={bet} min={10} onChange={e=>setBet(Math.max(10,+e.target.value||10))}/></label><button className="play wide" onClick={spin}>SPIN</button><div className="message">{message}</div></div>}
function Recent({rounds}:{rounds:Round[]}){return <section className="recent panel"><h3>YOUR RECENT GAMES</h3>{rounds.length?rounds.slice(0,10).map(r=><div className="line" key={r.id}><span>{new Date(r.at).toLocaleTimeString()} · {r.label}</span><b className={r.payout?'win':''}>{r.payout?`+${money(r.payout)}`:`-${money(r.stake)}`}</b></div>):<div className="muted">No rounds yet.</div>}</section>}

function Admin({store,setStore,reset}:{store:Store;setStore:React.Dispatch<React.SetStateAction<Store>>;reset:()=>void}){const [selected,setSelected]=useState(store.current),[amount,setAmount]=useState(1000),[reason,setReason]=useState('Admin adjustment'),[search,setSearch]=useState('');const target=store.players.find(p=>p.id===selected);const filtered=store.players.filter(p=>p.username.toLowerCase().includes(search.toLowerCase()));function adjust(delta:number){if(!target)return;setStore(s=>({...s,players:s.players.map(p=>p.id===target.id?{...p,credits:Math.max(0,p.credits+delta)}:p)}));}function select(id:string){setSelected(id);setStore(s=>({...s,current:id}))}return <main className="admin"><div className="admin-head"><div><small>ADMIN CONTROL CENTER</small><h1>Virtual Credit Management</h1><p>Demo administration for the local browser build.</p></div><button onClick={reset}>Reset demo data</button></div><div className="stats"><div><small>Players</small><b>{store.players.length}</b></div><div><small>Total virtual credits</small><b>{money(store.players.reduce((a,p)=>a+p.credits,0))}</b></div><div><small>Game rounds</small><b>{store.rounds.length}</b></div><div><small>Active</small><b>{store.players.filter(p=>p.active).length}</b></div></div><div className="admin-grid"><section className="panel"><h3>PLAYERS</h3><input className="search" placeholder="Search player" value={search} onChange={e=>setSearch(e.target.value)}/><div className="player-list">{filtered.map(p=><button className={selected===p.id?'player selected':'player'} key={p.id} onClick={()=>select(p.id)}><span><b>{p.username}</b><small>{p.active?'Active':'Offline'}</small></span><strong>{money(p.credits)}</strong></button>)}</div></section><section className="panel credit-box"><h3>ADJUST CREDITS</h3>{target?<><div className="selected-player"><span>{target.username}</span><b>{money(target.credits)}</b></div><label>Amount<input type="number" min="1" value={amount} onChange={e=>setAmount(Math.max(1,+e.target.value||1))}/></label><label>Reason<input value={reason} onChange={e=>setReason(e.target.value)}/></label><div className="adjust"><button onClick={()=>adjust(amount)}>＋ ADD CREDITS</button><button className="danger" onClick={()=>adjust(-amount)}>− DEDUCT CREDITS</button></div><p className="muted">Reason is recorded conceptually in this local demo. For production, store immutable admin transactions server-side.</p></>:<p>Select a player.</p>}</section></div><section className="panel"><h3>RECENT PLATFORM ACTIVITY</h3>{store.rounds.slice(0,20).map(r=><div className="line" key={r.id}><span>{new Date(r.at).toLocaleString()} · {gameNames[r.game]} · {r.label}</span><b>{r.payout?`+${money(r.payout)}`:`-${money(r.stake)}`}</b></div>)}</section></main>}

export default App;
