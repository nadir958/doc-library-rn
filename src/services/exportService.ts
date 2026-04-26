import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { DocumentModel, PageModel } from '../types/models';

// Miroir de ExportService.dart
export async function generateAndSharePdf(document: DocumentModel, pages: PageModel[]): Promise<void> {
  // Convertir chaque image en base64
  const imagesHtml = await Promise.all(
    pages.map(async (page) => {
      try {
        const base64 = await FileSystem.readAsStringAsync(page.imagePath, {
          encoding: 'base64' as any,
        });
        return `
          <div style="page-break-after: always; display: flex; justify-content: center; align-items: center; height: 100vh;">
            <img src="data:image/jpeg;base64,${base64}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
          </div>
        `;
      } catch {
        return '<div style="page-break-after: always;"><p>Image non disponible</p></div>';
      }
    })
  );

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${document.title}</title>
        <style>
          body { margin: 0; padding: 0; font-family: sans-serif; }
          div { box-sizing: border-box; }
        </style>
      </head>
      <body>
        ${imagesHtml.join('')}
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });

  // Renommer le fichier avec le titre du document
  const sanitizedTitle = document.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const cacheDir = FileSystem.cacheDirectory ?? '';
  const finalUri = `${cacheDir}${sanitizedTitle}.pdf`;
  await FileSystem.moveAsync({ from: uri, to: finalUri });

  // Partager le fichier
  await Sharing.shareAsync(finalUri, {
    mimeType: 'application/pdf',
    dialogTitle: `Partager: ${document.title}`,
  });
}
