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
    <section className="about-section bg-white pt-[32px] pb-[81px] md:py-[54px]">
      <div className="about-container container mx-auto px-4">
        <div className="about-content grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="about-image-wrapper">
            {data?.aboutDescription1Image && (
              <Image
                src={data.aboutDescription1Image}
                alt="About section image 1"
                width={600}
                height={400}
                className="about-image rounded-lg shadow-md"
              />
            )}
          </div>

          <div className="about-text-content">
            <h2 className="about-heading heading-2 text-3xl font-bold mb-8">
              {data?.aboutHeading}
            </h2>
            <p className="about-description text-lg text-gray-700 mb-6">
              {data?.aboutDescription1}
            </p>
            <p className="about-description text-lg text-gray-700 mb-6">
              {data?.aboutDescription2}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
