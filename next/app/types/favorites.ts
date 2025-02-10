export interface Favorite {
  id: string;
  title: string;
  videoLink: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
    bio: string;
    id: string;
    image: string;
  };
  description?: string;
}
