// Define the base rental item type without Prisma dependency
export interface RentalItemWithRelations {
  id: string;
  name: string;
  description?: string;
  itemType: string;
  rentPrice: number;
  images: string[];
  thumbnail?: string | null;
  specifications: any;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isActive: boolean;
  user: {
    name: string;
    image: string | null;
  };
  availableBeaches: Array<{
    id: string;
    rentalItemId: string;
    beachId: string;
    beach: {
      id: string;
      name: string;
      region: {
        id: string;
        name: string;
      };
    };
  }>;
  // Make these optional since they're missing in your actual data
  price?: number;
  imageUrls?: string[];
  category?: string;
  rentalRequests?: RentalRequestWithRelations[];
}

// Define the rental request type without Prisma dependency
export interface RentalRequestWithRelations {
  id: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  rentalItemId: string;
  renterId: string;
  ownerId: string;
  beachId: string;
  rentalItem: Omit<RentalItemWithRelations, "rentalRequests">;
  renter: {
    id: string;
    name: string;
    image: string | null;
  };
  owner: {
    id: string;
    name: string;
    image: string | null;
  };
  beach: {
    name: string;
    region: {
      name: string;
    };
  };
  messages: RentalMessageWithSender[];
}

// Define the message type with sender
export interface RentalMessageWithSender {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}

// Define the basic message type
export interface RentalMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface SurfboardSpecifications {
  type: string;
  length: number;
  finSetup: string;
}

export interface MotorbikeSpecifications {
  make: string;
  model: string;
  year: number;
  engineSize: number;
}

export interface ScooterSpecifications {
  make: string;
  model: string;
  year: number;
  maxSpeed: number;
}

export type RentalSpecifications =
  | SurfboardSpecifications
  | MotorbikeSpecifications
  | ScooterSpecifications;
