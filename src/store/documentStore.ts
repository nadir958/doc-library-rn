import { create } from 'zustand';
import { DocumentModel } from '../types/models';
import * as db from '../services/databaseService';
import { recognizeText } from '../services/ocrService';

// Miroir de DocumentNotifier (Riverpod) + documentListProvider

interface DocumentState {
  documents: DocumentModel[];
  allTags: string[];
  isLoading: boolean;
  error: string | null;
}

interface DocumentActions {
  loadDocuments: () => Promise<void>;
  search: (query: string) => Promise<void>;
  filterByTag: (tag: string | null) => Promise<void>;
  filterByFolder: (folderId: number | null) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  updateMetadata: (id: number, updates: { title?: string; tags?: string[]; folderId?: number | null }) => Promise<void>;
  processCapture: (imagePaths: string[], options?: { folderId?: number; title?: string }) => Promise<void>;
  addPagesToDocument: (docId: number, imagePaths: string[]) => Promise<void>;
  refreshTags: () => Promise<void>;
}

export const useDocumentStore = create<DocumentState & DocumentActions>((set, get) => ({
  documents: [],
  allTags: [],
  isLoading: false,
  error: null,

  loadDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const docs = await db.getAllDocuments();
      const tags = await db.getAllTags();
      set({ documents: docs, allTags: tags, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  search: async (query) => {
    set({ isLoading: true });
    try {
      const docs = query.trim()
        ? await db.searchDocuments(query)
        : await db.getAllDocuments();
      set({ documents: docs, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  filterByTag: async (tag) => {
    set({ isLoading: true });
    try {
      const docs = tag ? await db.filterDocumentsByTag(tag) : await db.getAllDocuments();
      set({ documents: docs, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  filterByFolder: async (folderId) => {
    set({ isLoading: true });
    try {
      const docs = folderId !== null
        ? await db.filterDocumentsByFolder(folderId)
        : await db.getAllDocuments();
      set({ documents: docs, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  deleteDocument: async (id) => {
    try {
      await db.deleteDocument(id);
      set(state => ({ documents: state.documents.filter(d => d.id !== id) }));
      await get().refreshTags();
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  updateMetadata: async (id, updates) => {
    try {
      await db.updateDocumentMetadata(id, updates);
      set(state => ({
        documents: state.documents.map(d =>
          d.id === id ? { ...d, ...updates, tags: updates.tags ?? d.tags } : d
        ),
      }));
      await get().refreshTags();
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  // Miroir de CaptureNotifier.processCapture
  processCapture: async (imagePaths, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const pages = await Promise.all(
        imagePaths.map(async (path, i) => ({
          imagePath: path,
          originalPath: path,
          ocrText: await recognizeText(path),
          notes: null,
          order: i,
          documentId: 0, // Sera mis à jour par saveDocument
        }))
      );

      const fullOcrText = pages.map(p => p.ocrText).join('\n');
      const now = new Date();
      const defaultTitle = `Scan du ${now.getDate()}/${now.getMonth() + 1}`;
      const title = options.title || defaultTitle;

      const newDoc = {
        title,
        createdAt: now.toISOString(),
        tags: [],
        fullOcrSearchText: fullOcrText || null,
        folderId: options.folderId ?? null,
      };

      await db.saveDocument(newDoc, pages);
      await get().loadDocuments();
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  // Miroir de CaptureNotifier.addPagesToDocument
  addPagesToDocument: async (docId, imagePaths) => {
    set({ isLoading: true, error: null });
    try {
      const existingPages = await db.getPagesForDocument(docId);
      const startOrder = existingPages.length;

      for (let i = 0; i < imagePaths.length; i++) {
        const text = await recognizeText(imagePaths[i]);
        await db.addPageToDocument(docId, {
          imagePath: imagePaths[i],
          originalPath: imagePaths[i],
          ocrText: text,
          notes: null,
          order: startOrder + i,
          documentId: docId,
        });
      }

      await get().loadDocuments();
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  refreshTags: async () => {
    const tags = await db.getAllTags();
    set({ allTags: tags });
  },
}));
