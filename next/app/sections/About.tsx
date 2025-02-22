// app/sections/About.tsx
import Image from "next/image";

interface AboutProps {
  data?: {
    aboutHeading?: string;
    aboutDescription1?: string;
    aboutDescription1Image?: string;
    aboutDescription2?: string;
    aboutDescription2Image?: string;
  };
}

export default function About({ data }: AboutProps) {
  return (
    <section className="bg-white py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <div className="order-2 lg:order-1">
            {data?.aboutDescription1Image && (
              <Image
                src={data.aboutDescription1Image}
                alt="About section image 1"
                width={600}
                height={400}
                className="w-full h-auto rounded-lg shadow-md object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="font-primary text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">
              {data?.aboutHeading}
            </h2>
            <p className="font-primary text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
              {data?.aboutDescription1}
            </p>
            <p className="font-primary text-base sm:text-lg text-gray-700">
              {data?.aboutDescription2}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
