export type StoryCategory =
  | "Travel"
  | "Wipeouts"
  | "Crime"
  | "Favourite Sessions"
  | "Wildlife Encounters";

export type StoryBeach = {
  id: string;
  name: string;
};

export interface Story {
  id: string;
  title: string;
  beach?: StoryBeach;
  date: string;
  details: string;
  link?: string;
  category: StoryCategory;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}
