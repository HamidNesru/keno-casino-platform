export type GameId = 'keno' | 'aviator' | 'dice' | 'roulette' | 'slots';
export type Round = { id:string; at:number; game:GameId; stake:number; payout:number; label:string };
export type Player = { id:string; username:string; credits:number; active:boolean; joined:number };

export const PAY: Record<number, Record<number, number>> = {
  1:{1:3},2:{2:9},3:{2:2,3:25},4:{2:1,3:4,4:90},5:{3:2,4:12,5:300},
  6:{3:1,4:4,5:50,6:800},7:{3:1,4:2,5:20,6:100,7:1500},
  8:{4:2,5:10,6:50,7:300,8:2500},9:{4:1,5:5,6:25,7:100,8:1000,9:4000},
  10:{0:5,5:2,6:10,7:50,8:250,9:2000,10:10000}
};
export const fmt=(n:number)=>Math.floor(n).toLocaleString('en-US');
export const nums=()=>Array.from({length:80},(_,i)=>i+1);
export function rnd(n:number){const a=new Uint32Array(1); const lim=Math.floor(4294967296/n)*n; let x:number; do{crypto.getRandomValues(a);x=a[0]}while(x>=lim);return x%n}
export function shuffle<T>(a:T[]){const x=[...a];for(let i=x.length-1;i>0;i--){const j=rnd(i+1);[x[i],x[j]]=[x[j],x[i]]}return x}
export const id=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
