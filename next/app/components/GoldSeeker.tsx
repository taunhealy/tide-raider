import Image from "next/image";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ["latin"] });

export default function GoldSeeker() {
  return (
    <div className="sticky top-[5 0vh] mt-6 bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="relative h-full">
      </div>
      <div className="p-4"> 
        <h3 className={`${inter.className} text-md font-normal text-gray-800`}>
        Seek the loot that loots for ye, ye swashbuckler!
        </h3>
      </div>
    </div>
  );
}