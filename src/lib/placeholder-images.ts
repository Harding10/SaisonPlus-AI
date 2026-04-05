// import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = [
  {
    id: '1',
    description: 'Champ de riz en Côte d\'Ivoire',
    imageUrl: '/placeholder-rice.jpg',
    imageHint: 'Riz paddy'
  },
  {
    id: '2',
    description: 'Plantation de tomates',
    imageUrl: '/placeholder-tomato.jpg',
    imageHint: 'Tomates mûres'
  },
  {
    id: '3',
    description: 'Champ de maïs',
    imageUrl: '/placeholder-corn.jpg',
    imageHint: 'Épis de maïs'
  }
];
