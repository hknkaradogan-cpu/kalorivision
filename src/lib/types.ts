export type Meal = 'kahvalti' | 'ogle' | 'aksam' | 'ara';
export const MEALS: { id: Meal; ad: string; ikon: string }[] = [
  { id: 'kahvalti', ad: 'Kahvaltı', ikon: '🍳' },
  { id: 'ogle', ad: 'Öğle yemeği', ikon: '🍲' },
  { id: 'aksam', ad: 'Akşam yemeği', ikon: '🍽️' },
  { id: 'ara', ad: 'Ara öğün', ikon: '🍎' },
];
export interface Nut { kcal: number; p: number; c: number; f: number; lif?: number; seker?: number; tuz?: number }
export interface Entry extends Nut { id: string; date: string; meal: Meal; ad: string; gram: number }
export interface Profile {
  ad: string; yas: number; boy: number; kilo: number; cinsiyet: 'e' | 'k';
  aktivite: number; hedefKilo: number; hedef: 'ver' | 'koru' | 'al'; alerjiler: string; tercih: string;
  hamile?: boolean; hamileAy?: number; diyabet?: boolean;
}
export interface AppState {
  profile?: Profile; entries: Entry[]; water: Record<string, number>; waterGoal: number;
  weights: { date: string; kg: number }[]; hatirlatma: boolean; steps: Record<string, number>; suBas: number; suBit: number; suAralik: number;
}
export const emptyState = (): AppState => ({ entries: [], water: {}, waterGoal: 2000, weights: [], hatirlatma: false, steps: {}, suBas: 8, suBit: 22, suAralik: 2 });
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const sum = (es: Nut[]): Nut => es.reduce((a, e) => ({
  kcal: a.kcal + e.kcal, p: a.p + e.p, c: a.c + e.c, f: a.f + e.f,
  lif: (a.lif ?? 0) + (e.lif ?? 0), seker: (a.seker ?? 0) + (e.seker ?? 0), tuz: (a.tuz ?? 0) + (e.tuz ?? 0),
}), { kcal: 0, p: 0, c: 0, f: 0, lif: 0, seker: 0, tuz: 0 });
export const scale = (n: Nut, per100: boolean, gram: number): Nut => {
  const k = per100 ? gram / 100 : 1;
  const r = (v?: number) => (v === undefined ? undefined : Math.round(v * k * 10) / 10);
  return { kcal: Math.round(n.kcal * k), p: r(n.p)!, c: r(n.c)!, f: r(n.f)!, lif: r(n.lif), seker: r(n.seker), tuz: r(n.tuz) };
};
