// ============================================
// MODELS — Miroirs des modèles Dart/Isar
// ============================================

export interface FolderModel {
  id: number;
  name: string;
  createdAt: string; // ISO string
  tags?: string[];
}

export interface DocumentModel {
  id: number;
  title: string;
  createdAt: string; // ISO string
  tags: string[];    // Stocké comme JSON string en DB
  fullOcrSearchText: string | null;
  folderId: number | null;
}

export interface PageModel {
  id: number;
  imagePath: string;
  originalPath: string;
  ocrText: string | null;
  notes: string | null;
  order: number;
  documentId: number;
}

// Pour les créations (sans id)
export type NewFolder = Omit<FolderModel, 'id'>;
export type NewDocument = Omit<DocumentModel, 'id'>;
export type NewPage = Omit<PageModel, 'id'>;
