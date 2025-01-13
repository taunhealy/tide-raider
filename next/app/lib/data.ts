import { beachData, type Beach } from "@/app/types/beaches";

export async function getBeaches(): Promise<Beach[]> {
  return beachData;
}