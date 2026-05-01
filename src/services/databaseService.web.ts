import { DocumentModel, FolderModel, NewDocument, NewPage, PageModel } from '../types/models';

interface WebDatabase {
  nextFolderId: number;
  nextDocumentId: number;
  nextPageId: number;
  folders: FolderModel[];
  documents: DocumentModel[];
  pages: PageModel[];
}

const STORAGE_KEY = 'doc-library-web-db';

function createEmptyDb(): WebDatabase {
  return {
    nextFolderId: 1,
    nextDocumentId: 1,
    nextPageId: 1,
    folders: [],
    documents: [],
    pages: [],
  };
}

function readDb(): WebDatabase {
  if (typeof window === 'undefined') {
    return createEmptyDb();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createEmptyDb();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WebDatabase>;
    return {
      nextFolderId: parsed.nextFolderId ?? 1,
      nextDocumentId: parsed.nextDocumentId ?? 1,
      nextPageId: parsed.nextPageId ?? 1,
      folders: parsed.folders ?? [],
      documents: parsed.documents ?? [],
      pages: parsed.pages ?? [],
    };
  } catch {
    return createEmptyDb();
  }
}

function writeDb(db: WebDatabase): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function sortByCreatedAtDesc<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function initDatabase(): Promise<void> {
  const db = readDb();
  writeDb(db);
}

export async function getAllFolders(): Promise<FolderModel[]> {
  const db = readDb();
  return sortByCreatedAtDesc(db.folders);
}

export async function createFolder(name: string, tags: string[] = []): Promise<number> {
  const db = readDb();
  const normalizedName = name.trim();

  if (db.folders.some(folder => folder.name === normalizedName)) {
    throw new Error('A folder with this name already exists.');
  }

  const folder: FolderModel = {
    id: db.nextFolderId,
    name: normalizedName,
    createdAt: new Date().toISOString(),
    tags,
  };

  db.nextFolderId += 1;
  db.folders.push(folder);
  writeDb(db);
  return folder.id;
}

export async function deleteFolder(id: number): Promise<void> {
  const db = readDb();
  db.folders = db.folders.filter(folder => folder.id !== id);
  db.documents = db.documents.map(document =>
    document.folderId === id ? { ...document, folderId: null } : document
  );
  writeDb(db);
}

export async function getAllDocuments(): Promise<DocumentModel[]> {
  const db = readDb();
  return sortByCreatedAtDesc(db.documents);
}

export async function getDocumentById(id: number): Promise<DocumentModel | null> {
  const db = readDb();
  return db.documents.find(document => document.id === id) ?? null;
}

export async function searchDocuments(query: string): Promise<DocumentModel[]> {
  const db = readDb();
  const lowerQuery = query.toLowerCase();

  return sortByCreatedAtDesc(
    db.documents.filter(document =>
      document.title.toLowerCase().includes(lowerQuery) ||
      (document.fullOcrSearchText ?? '').toLowerCase().includes(lowerQuery)
    )
  );
}

export async function filterDocumentsByTag(tag: string): Promise<DocumentModel[]> {
  const db = readDb();
  return sortByCreatedAtDesc(
    db.documents.filter(document => document.tags.includes(tag))
  );
}

export async function filterDocumentsByFolder(folderId: number): Promise<DocumentModel[]> {
  const db = readDb();
  return sortByCreatedAtDesc(
    db.documents.filter(document => document.folderId === folderId)
  );
}

export async function saveDocument(doc: NewDocument, pages: NewPage[]): Promise<number> {
  const db = readDb();
  const documentId = db.nextDocumentId;

  const document: DocumentModel = {
    id: documentId,
    title: doc.title,
    createdAt: doc.createdAt,
    tags: doc.tags,
    fullOcrSearchText: doc.fullOcrSearchText ?? null,
    folderId: doc.folderId ?? null,
  };

  db.nextDocumentId += 1;
  db.documents.push(document);

  for (const page of pages) {
    db.pages.push({
      id: db.nextPageId,
      imagePath: page.imagePath,
      originalPath: page.originalPath,
      ocrText: page.ocrText ?? null,
      notes: page.notes ?? null,
      order: page.order,
      documentId,
    });
    db.nextPageId += 1;
  }

  writeDb(db);
  return documentId;
}

export async function deleteDocument(id: number): Promise<void> {
  const db = readDb();
  db.documents = db.documents.filter(document => document.id !== id);
  db.pages = db.pages.filter(page => page.documentId !== id);
  writeDb(db);
}

export async function updateDocumentMetadata(
  id: number,
  updates: { title?: string; tags?: string[]; fullOcrSearchText?: string; folderId?: number | null }
): Promise<void> {
  const db = readDb();
  db.documents = db.documents.map(document => {
    if (document.id !== id) {
      return document;
    }

    return {
      ...document,
      ...(updates.title !== undefined ? { title: updates.title } : null),
      ...(updates.tags !== undefined ? { tags: updates.tags } : null),
      ...(updates.fullOcrSearchText !== undefined ? { fullOcrSearchText: updates.fullOcrSearchText } : null),
      ...(updates.folderId !== undefined ? { folderId: updates.folderId } : null),
    };
  });
  writeDb(db);
}

export async function getPagesForDocument(docId: number): Promise<PageModel[]> {
  const db = readDb();
  return db.pages
    .filter(page => page.documentId === docId)
    .sort((a, b) => a.order - b.order);
}

export async function deletePage(id: number): Promise<void> {
  const db = readDb();
  db.pages = db.pages.filter(page => page.id !== id);
  writeDb(db);
}

export async function addPageToDocument(docId: number, page: NewPage): Promise<number> {
  const db = readDb();
  const newPage: PageModel = {
    id: db.nextPageId,
    imagePath: page.imagePath,
    originalPath: page.originalPath,
    ocrText: page.ocrText ?? null,
    notes: page.notes ?? null,
    order: page.order,
    documentId: docId,
  };

  db.nextPageId += 1;
  db.pages.push(newPage);
  writeDb(db);
  return newPage.id;
}

export async function updatePageNotes(id: number, notes: string): Promise<void> {
  const db = readDb();
  db.pages = db.pages.map(page =>
    page.id === id ? { ...page, notes } : page
  );
  writeDb(db);
}

export async function deleteAllData(): Promise<void> {
  writeDb(createEmptyDb());
}

export async function getAllTags(): Promise<string[]> {
  const db = readDb();
  const tagSet = new Set<string>();

  for (const document of db.documents) {
    document.tags.forEach(tag => tagSet.add(tag));
  }

  return Array.from(tagSet);
}
