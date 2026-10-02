export type GameId = 'keno' | 'aviator' | 'dice' | 'roulette' | 'slots'
export type Player = { id: string; username: string; phone: string; credits: number; active: boolean; joined: number; role?: 'player' | 'admin' }
export type Round = { id: string; at: number; game: GameId; stake: number; payout: number; label: string }
export const nums = () => Array.from({ length: 80 }, (_, i) => i + 1)
export const rnd = (max: number) => Math.floor(Math.random() * max)
export const id = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
export const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)
export const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
export const PAY: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 5, 5: 12, 6: 30, 7: 80, 8: 200, 9: 500, 10: 2000 }
