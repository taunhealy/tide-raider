import Image from "next/image";

interface HeroProductContent {
  title?: string;
  leftDescription?: string;
  rightDescription?: string;
  leftImage?: string;
  filterItems?: Array<{
    type: string;
    icon: string;
  }>;
}

export default async function HeroProduct({
  data,
}: {
  data?: HeroProductContent;
}) {
  // Early return with skeleton loader if no data
  if (!data) {
    return (
      <section className="hero-product-section pt-[54px] pb-[121px] md:pt-[54px] md:pb-[121.51px] md:px-[121.51px] bg-[var(--color-bg-secondary)]">
        <div className="product-container px-4 flex flex-col">
          {/* Title skeleton */}
          <div className="h-[54px] w-2/3 bg-gray-200 animate-pulse rounded-lg mb-[32px]" />

          <div className="hero-product-explainer-container flex flex-col md:flex-row gap-[32px] md:gap-[21px] md:pl-[54px]">
            {/* Left content skeleton */}
            <div className="flex flex-col gap-4">
              <div className="h-[81px] w-[360px] bg-gray-200 animate-pulse rounded-lg" />
              <div className="w-full md:w-[540px] h-[200px] md:h-[300px] bg-gray-200 animate-pulse rounded-lg" />
            </div>

            {/* Right content skeleton */}
            <div className="flex flex-col gap-4">
              <div className="h-[24px] w-[200px] bg-gray-200 animate-pulse rounded-lg" />
              <div className="w-full md:w-[540px] h-[200px] md:h-[300px] bg-gray-200 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Debug log to see what data we're receiving
  console.log("HeroProduct component received:", {
    hasData: !!data,
    title: data?.title || "Using fallback",
    hasLeftDescription: !!data?.leftDescription,
    hasRightDescription: !!data?.rightDescription,
    hasLeftImage: !!data?.leftImage,
    filterItemsCount: data?.filterItems?.length || 0,
    rawData: data,
  });

  // Use data with default values
  const {
    title = "Daily Surf Hints",
    leftDescription = "",
    rightDescription = "",
    leftImage = "/screen-1.png",
    filterItems = null,
  } = data;

  // Add default filter items if none provided
  const displayFilterItems = filterItems ?? [
    { type: "Break", icon: "/images/wave-types/beach-break.jpg" },
    { type: "Location", icon: "/images/wave-types/point-break.jpg" },
    { type: "Skill", icon: "/images/wave-types/reef-break.jpg" },
    { type: "Size", icon: "/images/wave-types/beach-reef-break.jpg" },
    { type: "Crime", icon: "/images/icons/crime.jpg" },
    { type: "Shark", icon: "/images/icons/shark.jpg" },
  ];

  return (
    <section className="hero-product-section pt-[54px] pb-[121px] md:pt-[54px] md:pb-[121.51px] md:px-[121.51px] bg-[var(--color-bg-secondary)]">
      <div className="product-container px-4 flex flex-col">
        <h3 className="heading-3 text-[32px] md:text-[54px] font-semibold pb-[16px] md:pb-[32px]">
          {title}
        </h3>
        <div className="hero-product-explainer-container flex flex-col md:flex-row gap-[32px] md:gap-[21px] md:pl-[54px] max-w-full">
          <div className="hero-product-explainer-card flex flex-col">
            <p className="hero-product-explainer-card-description max-w-[36ch] min-h-[54px] md:min-h-[81px] text-base md:text-lg">
              {leftDescription}
            </p>
            <div className="image-container relative overflow-hidden w-full md:w-[540px] h-[200px] md:h-[300px]">
              <img
                src={leftImage}
                alt="Surf Report"
                className="absolute w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-150 cursor-zoom-in"
              />
            </div>
          </div>

          <div className="hero-product-explainer-card flex flex-col gap-2 ">
            <div className="flex flex-col gap-2">
              <p className="hero-product-explainer-card-description gap-2 text-base md:text-base font-medium">
                Filter search results by:
              </p>
              <div className="flex flex-wrap gap-3"></div>
            </div>

            <div className="rounded-lg bg-[var(--color-brand-tertiary)]/10 backdrop-blur-sm p-[16px]] w-full md:w-[540px] h-[200px] md:h-[300px]">
              <div className="grid grid-cols-2 gap-4 h-full max-w-[320px] place-content-center">
                {displayFilterItems.map((item: any) => (
                  <div
                    key={item.type}
                    className="group relative flex flex-col items-center gap-2 transform transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="relative w-[108px] z-0 h-[108px] rounded-full overflow-hidden border-4 border-white/20 shadow-lg hover:shadow-[var(--color-tertiary)]/50">
                      <Image
                        src={item.icon}
                        alt={`${item.type} icon`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <span className="absolute -bottom-2 z-10 opacity-100 bottom-[-24px] md:opacity-0 md:bottom-[-2px] group-hover:opacity-100 group-hover:bottom-[-24px] transition-all duration-300 text-sm font-medium bg-[var(--color-tertiary)] text-white px-3 py-1 rounded-full shadow-lg">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
