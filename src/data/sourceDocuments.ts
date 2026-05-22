export type SourceDocument = {
  id: string;
  title: string;
  imageUrl: string;
  note?: string;
};

function publicAsset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

export const sourceDocuments: SourceDocument[] = [
  {
    id: 'littfeld-training-plan-2026',
    title: 'Trainingsplan Littfeld 2026',
    imageUrl: publicAsset('source-documents/training-plans/trainingsplan-littfeld-2026.png'),
  },
  {
    id: 'hilchenbach-training-plan-2026',
    title: 'Trainingsplan Hilchenbach 2026',
    imageUrl: publicAsset('source-documents/training-plans/trainingsplan-hilchenbach-2026.png'),
    note: 'Hinweis: Im Hilchenbach-Bild steht Sommer 2025, es wird hier aber als Trainingsplan 2026 geführt.',
  },
];
