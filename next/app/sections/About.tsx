// app/sections/About.tsx
import Image from 'next/image';

interface AboutProps {
  data?: {
    aboutHeading?: string;
    aboutDescription1?: string;
    aboutDescription1Image?: string;
    aboutDescription2?: string;
    aboutDescription2Image?: string;
  }
}

export default function About({ data }: AboutProps) {
  return (
    <section className="bg-white pt-[32px] pb-[81px] md:py-[54px]">
      <div className="container mx-auto px-4">
        <h2 className="heading-2 text-3xl font-bold mb-8">{data?.aboutHeading}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="text-lg text-gray-700 mb-6">{data?.aboutDescription1}</p>
            {data?.aboutDescription1Image && (
              <Image
                src={data.aboutDescription1Image}
                alt="About section image 1"
                width={600}
                height={400}
                className="rounded-lg shadow-md"
              />
            )}
          </div>
          
          <div>
            <p className="text-lg text-gray-700 mb-6">{data?.aboutDescription2}</p>
            {data?.aboutDescription2Image && (
              <Image
                src={data.aboutDescription2Image}
                alt="About section image 2"
                width={600}
                height={400}
                className="rounded-lg shadow-md"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}