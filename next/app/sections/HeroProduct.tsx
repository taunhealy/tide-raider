export default function HeroProduct() {
  return (
    <section className="hero-product-section pt-[54px] pb-[121px] md:pt-[54px] md:pb-[121.51px] md:px-[121.51px] bg-[var(--color-bg-secondary)]">
      <div className="product-container px-4 flex flex-col">
        <h3 className="heading-3 text-[32px] md:text-[54px] font-semibold pb-[16px] md:pb-[32px]">
          Daily Surf Hints
        </h3>
        <div className="hero-product-explainer-container flex flex-col md:flex-row gap-[32px] md:gap-[54px] md:pl-[54px] max-w-full ">
          <div className="hero-product-explainer-card flex flex-col gap-[24px] md:gap-[36px]">
            <p className="hero-product-explainer-card-description max-w-[36ch] min-h-[54px] md:min-h-[81px] text-base md:text-lg">
              Get daily surf spot recommendations and wave insights, based on surf data and local knowledge.
            </p>
            <div className="image-container relative overflow-hidden w-full md:w-[540px] h-[200px] md:h-[300px]">
              <img 
                src="/screen-1.png" 
                alt="Surf Report" 
                className="absolute w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-150 cursor-zoom-in"
              />
            </div>
          </div>
          <div className="hero-product-explainer-card flex flex-col gap-[24px] md:gap-[36px]">
            <p className="hero-product-explainer-card-description min-h-[54px] max-w-[36ch] md:min-h-[81px] text-base md:text-lg">
              Filter search results by factors such as break, location, skill level, size, crime and shark activity.
            </p>
            <div className="rounded-lg *:rounded-lg image-container relative overflow-hidden w-full md:w-[182.25px] h-[200px] md:h-[273.375px]">
              <img 
                src="/screen-1.png" 
                alt="Surf Report" 
                className="rounded-lgabsolute w-full h-full object-cover transition-transform duration-300 hover:scale-150 cursor-zoom-in"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

