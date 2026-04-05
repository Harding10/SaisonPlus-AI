import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';

const DB_NAME = 'SaisonPlusOfflineDB';
const STORE_NAME = 'scouting_pins';

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (e: any) => {
      const idb = e.target.result;
      if (!idb.objectStoreNames.contains(STORE_NAME)) {
        idb.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e) => reject(e);
  });
}

export async function savePinOffline(pinData: any) {
  try {
    const idb = await initDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    store.add({ ...pinData, timestamp: Date.now() });
    console.log('[SaisonPlus] Pin sauvegardé hors-ligne');
  } catch (err) {
    console.error('Erreur IndexedDB', err);
  }
}

export async function syncOfflinePins(userId: string) {
  if (!navigator.onLine) return; // Still offline

  try {
    const idb = await initDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = async () => {
      const pins = request.result;
      if (pins.length === 0) return;

      console.log(`[SaisonPlus] Synchronisation de ${pins.length} pin(s) vers Firestore...`);

      for (const pin of pins) {
        try {
          const colRef = collection(db, 'scouting_pins');
          const data = {
            userId: userId || 'anonymous',
            lat: pin.lat,
            lng: pin.lng,
            note: pin.note || '',
            timestamp: pin.timestamp,
            syncTime: Date.now()
          };
          
          await addDoc(colRef, data);
        } catch (err: any) {
          if (err.code === 'permission-denied') {
            const contextualError = new FirestorePermissionError({
              path: 'scouting_pins',
              operation: 'create',
              requestResourceData: { userId: userId || 'anonymous', ...pin }
            });
            console.error(contextualError.message);
            // Optionally throw or just log for now
          } else {
            console.error('[SaisonPlus] Erreur sync pin individuel:', err);
          }
        }
      }

      // Vider le store après sync
      const txClear = idb.transaction(STORE_NAME, 'readwrite');
      txClear.objectStore(STORE_NAME).clear();
      console.log('[SaisonPlus] Synchronisation terminée !');
    };
  } catch (err) {
    console.error('Erreur lors de la synchronisation', err);
  }
}

export function registerOfflineSync(userId: string) {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
       syncOfflinePins(userId);
    });
  }
}
