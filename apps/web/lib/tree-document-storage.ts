import type { TreeDocument } from '@/lib/stores/tree-store';

const STORAGE_PREFIX = 'pucktree:tree:';
const DOCUMENT_VERSION = 1;

interface StoredTreeDocument {
  version: number;
  document: TreeDocument;
}

function isTreeDocument(value: unknown): value is TreeDocument {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<TreeDocument>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.rootTradeId === 'string' &&
    Boolean(candidate.tradesById && typeof candidate.tradesById === 'object') &&
    Boolean(candidate.assetsById && typeof candidate.assetsById === 'object')
  );
}

/**
 * Migrates persisted or imported documents to the current browser format.
 * Version 0 was the unwrapped document format used before versioned storage.
 */
export function migrateTreeDocument(value: unknown): TreeDocument | null {
  if (isTreeDocument(value)) return value;
  if (!value || typeof value !== 'object') return null;

  const stored = value as Partial<StoredTreeDocument>;
  if (stored.version === DOCUMENT_VERSION && isTreeDocument(stored.document)) {
    return stored.document;
  }

  return null;
}

export function readTreeDocument(treeId: string): TreeDocument | null {
  if (typeof window === 'undefined') return null;

  try {
    return migrateTreeDocument(JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}${treeId}`) ?? 'null'));
  } catch {
    return null;
  }
}

export function writeTreeDocument(treeId: string, document: TreeDocument): void {
  if (typeof window === 'undefined') return;

  const stored: StoredTreeDocument = { version: DOCUMENT_VERSION, document };
  window.localStorage.setItem(`${STORAGE_PREFIX}${treeId}`, JSON.stringify(stored));
}
