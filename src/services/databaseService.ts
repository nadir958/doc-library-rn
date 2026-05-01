import { Platform } from 'react-native';
import { DocumentModel, FolderModel, NewDocument, NewFolder, NewPage, PageModel } from '../types/models';

// ============================================
// DATABASE SERVICE — Miroir des Repositories Dart
// ============================================

type SQLiteModule = typeof import('expo-sqlite');
type SQLiteDatabase = Awaited<ReturnType<SQLiteModule['openDatabaseAsync']>>;

const webDb = Platform.OS === 'web'
  ? require('./databaseService.web') as typeof import('./databaseService.web')
  : null;

let _db: SQLiteDatabase | null = null;

async function getDb(): Promise<SQLiteDatabase> {
  if (_db) return _db;
  const SQLite = require('expo-sqlite') as SQLiteModule;
  _db = await SQLite.openDatabaseAsync('doc_library.db');
  await _db.execAsync('PRAGMA journal_mode = WAL;');
  return _db;
}

export async function initDatabase(): Promise<void> {
  if (webDb) return webDb.initDatabase();
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      full_ocr_search_text TEXT,
      folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_path TEXT NOT NULL,
      original_path TEXT NOT NULL,
      ocr_text TEXT,
      notes TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
    CREATE INDEX IF NOT EXISTS idx_pages_document_id ON pages(document_id);
    CREATE INDEX IF NOT EXISTS idx_pages_order ON pages(sort_order);
  `);

  try {
    await db.execAsync('ALTER TABLE folders ADD COLUMN tags TEXT NOT NULL DEFAULT "[]"');
  } catch (e) {
    // Column might already exist, ignore
  }
}

// ======= FOLDERS =======

export async function getAllFolders(): Promise<FolderModel[]> {
  if (webDb) return webDb.getAllFolders();
  const db = await getDb();
  const rows = await db.getAllAsync<any>('SELECT * FROM folders ORDER BY created_at DESC');
  return rows.map(rowToFolder);
}

export async function createFolder(name: string, tags: string[] = []): Promise<number> {
  if (webDb) return webDb.createFolder(name, tags);
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO folders (name, created_at, tags) VALUES (?, ?, ?)',
    name,
    new Date().toISOString(),
    JSON.stringify(tags)
  );
  return result.lastInsertRowId;
}

export async function deleteFolder(id: number): Promise<void> {
  if (webDb) return webDb.deleteFolder(id);
  const db = await getDb();
  await db.runAsync('DELETE FROM folders WHERE id = ?', id);
}

// ======= DOCUMENTS =======

export async function getAllDocuments(): Promise<DocumentModel[]> {
  if (webDb) return webDb.getAllDocuments();
  const db = await getDb();
  const rows = await db.getAllAsync<any>('SELECT * FROM documents ORDER BY created_at DESC');
  return rows.map(rowToDocument);
}

export async function getDocumentById(id: number): Promise<DocumentModel | null> {
  if (webDb) return webDb.getDocumentById(id);
  const db = await getDb();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM documents WHERE id = ? LIMIT 1',
    id
  );
  return row ? rowToDocument(row) : null;
}

export async function searchDocuments(query: string): Promise<DocumentModel[]> {
  if (webDb) return webDb.searchDocuments(query);
  const db = await getDb();
  const q = `%${query}%`;
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM documents WHERE title LIKE ? OR full_ocr_search_text LIKE ? ORDER BY created_at DESC',
    q, q
  );
  return rows.map(rowToDocument);
}

export async function filterDocumentsByTag(tag: string): Promise<DocumentModel[]> {
  if (webDb) return webDb.filterDocumentsByTag(tag);
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM documents WHERE tags LIKE ? ORDER BY created_at DESC",
    `%"${tag}"%`
  );
  return rows.map(rowToDocument);
}

export async function filterDocumentsByFolder(folderId: number): Promise<DocumentModel[]> {
  if (webDb) return webDb.filterDocumentsByFolder(folderId);
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM documents WHERE folder_id = ? ORDER BY created_at DESC',
    folderId
  );
  return rows.map(rowToDocument);
}

export async function saveDocument(doc: NewDocument, pages: NewPage[]): Promise<number> {
  if (webDb) return webDb.saveDocument(doc, pages);
  const db = await getDb();
  const docResult = await db.runAsync(
    'INSERT INTO documents (title, created_at, tags, full_ocr_search_text, folder_id) VALUES (?, ?, ?, ?, ?)',
    doc.title,
    doc.createdAt,
    JSON.stringify(doc.tags),
    doc.fullOcrSearchText ?? null,
    doc.folderId ?? null
  );
  const docId = docResult.lastInsertRowId;

  for (const page of pages) {
    await db.runAsync(
      'INSERT INTO pages (image_path, original_path, ocr_text, notes, sort_order, document_id) VALUES (?, ?, ?, ?, ?, ?)',
      page.imagePath, page.originalPath, page.ocrText ?? null, page.notes ?? null, page.order, docId
    );
  }

  return docId;
}

export async function deleteDocument(id: number): Promise<void> {
  if (webDb) return webDb.deleteDocument(id);
  const db = await getDb();
  await db.runAsync('DELETE FROM documents WHERE id = ?', id);
}

export async function updateDocumentMetadata(
  id: number,
  updates: { title?: string; tags?: string[]; fullOcrSearchText?: string; folderId?: number | null }
): Promise<void> {
  if (webDb) return webDb.updateDocumentMetadata(id, updates);
  const db = await getDb();
  const sets: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) { sets.push('title = ?'); values.push(updates.title); }
  if (updates.tags !== undefined) { sets.push('tags = ?'); values.push(JSON.stringify(updates.tags)); }
  if (updates.fullOcrSearchText !== undefined) { sets.push('full_ocr_search_text = ?'); values.push(updates.fullOcrSearchText); }
  if (updates.folderId !== undefined) { sets.push('folder_id = ?'); values.push(updates.folderId); }

  if (sets.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE documents SET ${sets.join(', ')} WHERE id = ?`, ...values);
}

// ======= PAGES =======

export async function getPagesForDocument(docId: number): Promise<PageModel[]> {
  if (webDb) return webDb.getPagesForDocument(docId);
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM pages WHERE document_id = ? ORDER BY sort_order ASC',
    docId
  );
  return rows.map(rowToPage);
}

export async function deletePage(id: number): Promise<void> {
  if (webDb) return webDb.deletePage(id);
  const db = await getDb();
  await db.runAsync('DELETE FROM pages WHERE id = ?', id);
}

export async function addPageToDocument(docId: number, page: NewPage): Promise<number> {
  if (webDb) return webDb.addPageToDocument(docId, page);
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO pages (image_path, original_path, ocr_text, notes, sort_order, document_id) VALUES (?, ?, ?, ?, ?, ?)',
    page.imagePath, page.originalPath, page.ocrText ?? null, page.notes ?? null, page.order, docId
  );
  return result.lastInsertRowId;
}

export async function updatePageNotes(id: number, notes: string): Promise<void> {
  if (webDb) return webDb.updatePageNotes(id, notes);
  const db = await getDb();
  await db.runAsync('UPDATE pages SET notes = ? WHERE id = ?', notes, id);
}

export async function deleteAllData(): Promise<void> {
  if (webDb) return webDb.deleteAllData();
  const db = await getDb();
  await db.execAsync('DELETE FROM pages; DELETE FROM documents; DELETE FROM folders;');
}

export async function getAllTags(): Promise<string[]> {
  if (webDb) return webDb.getAllTags();
  const db = await getDb();
  const rows = await db.getAllAsync<{ tags: string }>('SELECT tags FROM documents');
  const tagSet = new Set<string>();
  for (const row of rows) {
    try {
      const tags: string[] = JSON.parse(row.tags);
      tags.forEach(t => tagSet.add(t));
    } catch {}
  }
  return Array.from(tagSet);
}

// ======= Row mappers =======

function rowToFolder(row: any): FolderModel {
  return { 
    id: row.id, 
    name: row.name, 
    createdAt: row.created_at,
    tags: (() => { try { return row.tags ? JSON.parse(row.tags) : []; } catch { return []; } })(),
  };
}

function rowToDocument(row: any): DocumentModel {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    tags: (() => { try { return JSON.parse(row.tags); } catch { return []; } })(),
    fullOcrSearchText: row.full_ocr_search_text ?? null,
    folderId: row.folder_id ?? null,
  };
}

function rowToPage(row: any): PageModel {
  return {
    id: row.id,
    imagePath: row.image_path,
    originalPath: row.original_path,
    ocrText: row.ocr_text ?? null,
    notes: row.notes ?? null,
    order: row.sort_order,
    documentId: row.document_id,
  };
}
