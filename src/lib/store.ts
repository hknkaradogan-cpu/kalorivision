import { get, set, del } from 'idb-keyval';
import { AppState, emptyState } from './types';
const KEY = 'kalorivision-state-v1';
export async function load(): Promise<AppState> {
  try { return { ...emptyState(), ...((await get(KEY)) ?? {}) }; } catch { return emptyState(); }
}
export async function save(s: AppState) { try { await set(KEY, s); } catch (e) { console.error('Kayıt hatası', e); } }
export async function wipe() { try { await del(KEY); } catch { /* yoksay */ } }
