import { Board as PrismaBoard } from "@prisma/client";

export interface BoardWithRelations extends PrismaBoard {
  user?: {
    name: string;
    image?: string | null;
  };
  availableBeaches?: {
    beach: {
      name: string;
      region: {
        name: string;
      };
    };
  }[];
  isForSale?: boolean;
  salePrice?: number | null;
}
