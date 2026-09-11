import Dexie, { type EntityTable } from 'dexie';
import { supabase } from './supabase';

export interface SyncQueueItem {
  id: string; // idempotency key / UUID
  table: 'trees' | 'tasks' | 'tree_photos' | 'activity_logs' | 'profiles' | 'projects' | 'clusters';
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  created_at: string;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'COMPLETED';
  retry_count: number;
  last_error?: string;
}

const db = new Dexie('SurviveFirstDB') as Dexie & {
  sync_queue: EntityTable<SyncQueueItem, 'id'>;
  // Local cache tables (mirroring Supabase)
  trees: EntityTable<any, 'id'>;
  tasks: EntityTable<any, 'id'>;
  profiles: EntityTable<any, 'id'>;
  projects: EntityTable<any, 'id'>;
  clusters: EntityTable<any, 'id'>;
};

db.version(2).stores({
  sync_queue: 'id, table, status, created_at',
  trees: 'id, public_id, project_id, cluster_id, owner_id, status, registration_status, risk_level',
  tasks: 'id, tree_id, assigned_to, status',
  profiles: 'id, role',
  projects: 'id, organization_id',
  clusters: 'id, project_id'
});

export { db };

/**
 * Enqueue an offline action.
 * If online and live mode is active, attempt immediate sync.
 */
export const enqueueAction = async (item: Omit<SyncQueueItem, 'created_at' | 'status' | 'retry_count'>) => {
  const queueItem: SyncQueueItem = {
    ...item,
    created_at: new Date().toISOString(),
    status: 'PENDING',
    retry_count: 0
  };
  await db.sync_queue.add(queueItem);
  
  if (navigator.onLine) {
    processSyncQueue();
  }
};

/**
 * Process the offline sync queue.
 * Pushes local changes to Supabase.
 */
export const processSyncQueue = async () => {
  if (!navigator.onLine) return;

  const pending = await db.sync_queue.where('status').equals('PENDING').toArray();
  if (pending.length === 0) return;

  for (const item of pending) {
    try {
      await db.sync_queue.update(item.id, { status: 'SYNCING' });

      let finalPayload = { ...item.payload };

      if (item.table === 'tree_photos' && item.action === 'INSERT' && finalPayload.photo_base64) {
        const base64Data = finalPayload.photo_base64;
        const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        const fileName = `${finalPayload.tree_id}/${item.id}.jpg`;
        const { data: storageData, error: storageError } = await supabase!.storage
          .from('tree_photos')
          .upload(fileName, blob, { upsert: true });

        if (storageError) throw storageError;

        finalPayload.photo_url = storageData.path;
        delete finalPayload.photo_base64;
      }

      if (item.action === 'INSERT') {
        const { error } = await supabase!.from(item.table).insert(finalPayload);
        if (error) throw error;
      } else if (item.action === 'UPDATE') {
        const { error } = await supabase!.from(item.table).update(finalPayload).eq('id', finalPayload.id);
        if (error) throw error;
      }

      await db.sync_queue.update(item.id, { status: 'COMPLETED' });
      await db.sync_queue.delete(item.id); // Clean up
    } catch (err: any) {
      console.error('Sync error:', err);
      // Let it stay in the queue but marked as pending if we want to retry on next loop, 
      // or if retry > 5, mark FAILED
      await db.sync_queue.update(item.id, { 
        status: item.retry_count > 5 ? 'FAILED' : 'PENDING',
        retry_count: item.retry_count + 1,
        last_error: err.message
      });
    }
  }
};


export const syncDownstream = async () => {
  if (!navigator.onLine || !supabase) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Fetch projects
    const { data: projects } = await supabase.from('projects').select('*');
    if (projects) {
      await db.projects.clear();
      await db.projects.bulkPut(projects);
    }

    // Fetch clusters
    const { data: clusters } = await supabase.from('clusters').select('*');
    if (clusters) {
      await db.clusters.clear();
      await db.clusters.bulkPut(clusters);
    }
    
    // Fetch trees
    const { data: trees } = await supabase.from('trees').select('*');
    if (trees) {
      await db.trees.clear();
      await db.trees.bulkPut(trees);
    }
    
    // Fetch tasks
    const { data: tasks } = await supabase.from('tasks').select('*');
    if (tasks) {
      await db.tasks.clear();
      await db.tasks.bulkPut(tasks);
    }
  } catch (e) {
    console.error('Downstream sync failed', e);
  }
};
