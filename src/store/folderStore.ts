import { create } from 'zustand';
import { FolderModel } from '../types/models';
import * as db from '../services/databaseService';

interface FolderState {
  folders: FolderModel[];
  isLoading: boolean;
}

interface FolderActions {
  loadFolders: () => Promise<void>;
  createFolder: (name: string, tags?: string[]) => Promise<number>;
  deleteFolder: (id: number) => Promise<void>;
}

export const useFolderStore = create<FolderState & FolderActions>((set) => ({
  folders: [],
  isLoading: false,

  loadFolders: async () => {
    set({ isLoading: true });
    try {
      const folders = await db.getAllFolders();
      set({ folders, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createFolder: async (name, tags = []) => {
    const id = await db.createFolder(name, tags);
    const folders = await db.getAllFolders();
    set({ folders });
    return id;
  },

  deleteFolder: async (id) => {
    await db.deleteFolder(id);
    set(state => ({ folders: state.folders.filter(f => f.id !== id) }));
  },
}));
