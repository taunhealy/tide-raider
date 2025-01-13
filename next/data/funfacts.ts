export interface FunFact {
    id: number;
    fact: string;
    category: 'marine-life' | 'surf-history' | 'environment' | 'culture';
    source?: string;
    sourceUrl?: string;
  }
  
  export const funFacts: FunFact[] = [
    {
      id: 1,
      fact: "The Cape Peninsula has over 72 unique surf breaks within a 100km radius of Cape Town.",
      category: 'surf-history',
      source: 'Zigzag Surfing Magazine',
      sourceUrl: 'https://www.zigzag.co.za'
    },
    {
      id: 2,
      fact: "False Bay is home to one of the largest Great White Shark populations in the world, though sightings have decreased since 2017 due to the presence of Orcas.",
      category: 'marine-life',
      source: 'Shark Spotters Research',
      sourceUrl: 'https://sharkspotters.org.za/research'
    },
    {
      id: 3,
      fact: "The water temperature difference between the Atlantic and Indian Ocean sides of the Cape can be up to 8°C during summer months.",
      category: 'environment'
    },
    {
      id: 4,
      fact: "Muizenberg is considered the birthplace of surfing in South Africa, with the first recorded wave riding in 1919.",
      category: 'surf-history'
    },
    {
      id: 5,
      fact: "The Cape Doctor (strong SE wind) can blow at speeds over 100km/h and creates the famous 'tablecloth' effect on Table Mountain.",
      category: 'environment'
    },
    {
      id: 6,
      fact: "The Dungeons big wave spot near Hout Bay can produce waves up to 60 feet (18m) high during winter swells.",
      category: 'surf-history'
    },
    {
      id: 7,
      fact: "Southern Right Whales visit the Cape waters between June and December, often visible from popular surf spots.",
      category: 'marine-life'
    },
    {
      id: 8,
      fact: "The Cape Peninsula experiences two peak swell seasons: May-August (winter) and December-February (summer).",
      category: 'environment'
    },
    {
      id: 9,
      fact: "Long Beach in Kommetjie has produced more professional surfers than any other break in South Africa.",
      category: 'culture'
    },
    {
      id: 10,
      fact: "The Red Bull Big Wave Africa competition at Dungeons ran from 1999 to 2008, putting Cape Town on the global big wave map.",
      category: 'surf-history'
    },
    {
      id: 33,
      fact: "Waves for Change, founded in Muizenberg in 2011, pioneered surf therapy in Africa and now helps over 1000 youth annually dealing with trauma and stress.",
      category: 'culture',
      source: 'Waves for Change Organization',
      sourceUrl: 'https://wavesforchange.org.za'
    },
    {
      id: 14,
      fact: "The Benguela Current brings nutrient-rich upwellings that support over 1,500 marine species but also create the Cape's notoriously cold Atlantic waters.",
      category: 'environment',
      source: 'South African Environmental Observation Network (SAEON)',
      sourceUrl: 'https://www.saeon.ac.za'
    },
    {
      id: 22,
      fact: "Octopuses in False Bay have been observed using kelp fronds to ride currents, showing tool use among marine life.",
      category: 'marine-life',
      source: 'Two Oceans Aquarium Research',
      sourceUrl: 'https://www.twooceansaquarium.org.za'
    },
    {
      id: 32,
      fact: "Abalone poaching has reduced the population by 96% since the 1960s, significantly impacting local reef ecosystems.",
      category: 'environment',
      source: 'Department of Environmental Affairs, South Africa',
      sourceUrl: 'https://www.environment.gov.za'
    },
    {
      id: 40,
      fact: "During the sardine run, over 18,000 dolphins have been recorded surfing the waves along the Cape coast.",
      category: 'marine-life',
      source: 'Marine Mammal Research Unit, University of Pretoria',
      sourceUrl: 'https://www.up.ac.za/marine-mammal-research'
    },
    {
      id: 12,
      fact: "The African penguin colony at Boulders Beach declined from 3,900 breeding pairs in 2004 to just 1,068 in 2019.",
      category: 'marine-life',
      source: 'South African National Parks (SANParks) Annual Report 2019',
      sourceUrl: 'https://www.sanparks.org.za'
    },
    {
      id: 13,
      fact: "The Two Oceans Aquarium has successfully rehabilitated and released over 600 sea turtles since 2009.",
      category: 'marine-life',
      source: 'Two Oceans Aquarium Foundation',
      sourceUrl: 'https://www.twooceansaquarium.org.za'
    },

    {
      id: 18,
      fact: "Muizenberg's Surfer's Corner contributes approximately R100 million annually to the local economy through surf tourism.",
      category: 'culture',
      source: 'City of Cape Town Economic Development Department, 2021',
      sourceUrl: 'https://www.cityofcapetown.gov.za'
    },
    {
      id: 19,
      fact: "The Red Bull Big Wave Africa competition at Dungeons featured waves up to 25 feet (7.6m) high in its final year, 2008.",
      category: 'surf-history',
      source: 'Red Bull Sports Archives',
      sourceUrl: 'https://redbull.com'
    },
    {
      id: 20,
      fact: "The Cape fur seal population in the Peninsula has grown from 36,000 in 1970 to over 75,000 in 2020.",
      category: 'marine-life',
      source: 'Department of Environment, Forestry and Fisheries Marine Research',
      sourceUrl: 'https://www.environment.gov.za'
    },
    {
      id: 21,
      fact: "The Save Our Seas Shark Education Centre in Kalk Bay has educated over 50,000 children about marine conservation since 2008.",
      category: 'culture',
      source: 'Save Our Seas Foundation Annual Report 2022',
      sourceUrl: 'https://saveourseas.org.za'
    },
    {
      id: 23,
      fact: "False Bay experiences an average of 84 days per year with waves over 2 meters, based on 10-year wave buoy data.",
      category: 'environment',
      source: 'CSIR Wave Climate Study 2020',
      sourceUrl: 'https://www.csir.co.za'
    },
    {
      id: 24,
      fact: "Over 40% of Cape Town's coastal kelp forests have been impacted by climate change in the last 30 years.",
      category: 'environment',
      source: 'UCT Marine Research Institute Climate Impact Study 2021',
      sourceUrl: 'https://www.uct.ac.za'
    },
    {
      id: 25,
      fact: "The Waves for Change surf therapy program has expanded to 5 countries, helping over 2000 youth annually since its Cape Town founding.",
      category: 'culture',
      source: 'Waves for Change Impact Report 2023',
      sourceUrl: 'https://wavesforchange.org.za'
    },
    {
      id: 27,
      fact: "The Cape of Good Hope MPA (Marine Protected Area) protects over 1,000 square kilometers of ocean ecosystem.",
      category: 'environment',
      source: 'Department of Environmental Affairs Protected Areas Register',
      sourceUrl: 'https://www.environment.gov.za'
    },
    {
      id: 28,
      fact: "Kommetjie's surf tourism industry has grown by 300% since 2010, creating over 200 local jobs.",
      category: 'culture',
      source: 'Western Cape Tourism Economic Impact Study 2022',
      sourceUrl: 'https://www.western-cape.gov.za'
    },
    {
      id: 29,
      fact: "Cape Town hosts South Africa's oldest continuous surfing competition, the Tiger's Milk Winter Classic, running since 1969.",
      category: 'surf-history',
      source: 'Surfing South Africa Historical Records',
      sourceUrl: 'https://surfing-south-africa.org.za'
    },
    {
      id: 30,
      fact: "The Two Oceans region hosts 3,800 marine species, representing 15% of known marine species worldwide.",
      category: 'marine-life',
      source: 'South African Institute for Aquatic Biodiversity',
      sourceUrl: 'https://www.saib.org.za'
    },
    {
      id: 31,
      fact: "The Cape Town Marine Protected Area Network contributes R300 million annually to the local economy through tourism.",
      category: 'environment',
      source: 'WWF-SA Marine Programme Economic Assessment 2022',
      sourceUrl: 'https://www.wwf.org.za'
    },
    {
      id: 34,
      fact: "Fish Hoek has recorded the highest number of shark sightings of any Western Cape surf spot, with over 800 recorded sightings between 2006-2021, leading to its reputation as the 'sharkiest' surf spot in the region.",
      category: 'marine-life',
      source: 'Shark Spotters Programme Data Report 2021',
      sourceUrl: 'https://sharkspotters.org.za'
    },
    {
      id: 35,
      fact: "The Surfers' Watch program, established in Muizenberg in 2014, has created a network of over 200 local surfers who volunteer to patrol beaches and parking areas, reducing crime by 75% and creating employment for local youth as beach safety ambassadors.",
      category: 'culture',
      source: 'Muizenberg Improvement District Annual Report 2023',
      sourceUrl: 'https://muizenberg.org.za'
    },
    {
      id: 37,
      fact: "Betty's Bay Marine Protected Area has increased its fish populations by over 500% since its establishment in 1990, showing the effectiveness of no-take zones.",
      category: 'environment',
      source: 'Department of Forestry, Fisheries and Environment Status Report 2023',
      sourceUrl: 'https://www.environment.gov.za'
    },
    {
      id: 38,
      fact: "The Cape's Marine Protected Areas network has helped recover the endangered Red Steenbras population by 60% in protected zones since 2010.",
      category: 'marine-life',
      source: 'South African National Biodiversity Institute Marine Report 2023',
      sourceUrl: 'https://www.sanbi.org.za'
    },
    {
      id: 40,
      fact: "The Robben Island Marine Protected Area, established in 2019, protects crucial penguin feeding grounds and has led to a 15% increase in successful breeding pairs.",
      category: 'marine-life',
      source: 'Department of Environmental Affairs Protected Areas Report 2023',
      sourceUrl: 'https://www.environment.gov.za'
    },
    {
      id: 41,
      fact: "Dungeons was first surfed in 1984 by Pierre de Villiers and Peter Button, who paddled out during a massive winter swell. The spot remained relatively unknown until the Red Bull Big Wave Africa event began in 1999.",
      category: 'surf-history',
      source: 'Zigzag Magazine Archives, 30th Anniversary Edition',
      sourceUrl: 'https://www.zigzag.co.za'
    },
    {
      id: 42,
      fact: "Dunes, in the Cape Peninsula, experiences a unique phenomenon where waves can break both left and right simultaneously due to a V-shaped reef formation, creating what locals call 'Mirror Image' waves.",
      category: 'environment',
      source: 'Cape Town Coastal Dynamics Study, UCT Oceanography Department 2021',
      sourceUrl: 'https://www.uct.ac.za'
    },
    {
      id: 43,
      fact: "The Outer Kom reef break holds the record for the biggest documented wave surfed in South Africa, measuring 60 feet (18.3m) during the winter swell of 2017.",
      category: 'surf-history',
      source: 'World Surf League Big Wave Documentation 2017',
      sourceUrl: 'https://worldsurfleague.com'
    },
    {
      id: 44,
      fact: "Muizenberg's 'Surfer's Corner' averages 300 learner surfers per day during peak season, making it the most active surf teaching beach in Africa.",
      category: 'culture',
      source: 'City of Cape Town Beach Tourism Report 2022',
      sourceUrl: 'https://www.cityofcapetown.gov.za'
    },
    {
      id: 45,
      fact: "Long Beach in Kommetjie has produced 8 national surfing champions since 1985, more than any other single break in South Africa.",
      category: 'surf-history',
      source: 'Surfing South Africa Competition Records',
      sourceUrl: 'https://surfing-south-africa.org.za'
    },
    {
      id: 46,
      fact: "Heather Price became the first woman to surf Dungeons in 1999, paving the way for female big wave surfing in South Africa.",
      category: 'surf-history',
      source: 'Zigzag Magazine Historical Archives',
      sourceUrl: 'https://www.zigzag.co.za'
    },
    {
      id: 47,
      fact: "The Cave at Kalk Bay was first surfed in the 1960s, but only becomes surfable approximately 5-10 times per year when specific swell direction, size, and wind conditions align.",
      category: 'surf-history',
      source: 'Cape Town Surf Heritage Collection',
      sourceUrl: 'https://www.cityofcapetown.gov.za'
    },
    {
      id: 48,
      fact: "Mike Schlebach and Grant 'Twiggy' Baker completed the first documented tow-in session at Sunset Reef in 2006, on waves estimated at 25 feet.",
      category: 'surf-history',
      source: 'Surfing South Africa Historical Records',
      sourceUrl: 'https://surfing-south-africa.org.za'
    },
    {
      id: 49,
      fact: "The Llandudno Surf Lifesaving Club, established in 1953, is one of the oldest surf clubs in South Africa and helped pioneer modern surf rescue techniques.",
      category: 'culture',
      source: 'Western Province Surf Lifesaving Archives',
      sourceUrl: 'https://www.western-cape.gov.za'
    },
    {
      id: 50,
      fact: "The 'Crayfish Factory' break in Kommetjie only works on big winter swells and got its name from the abandoned rock lobster processing plant nearby.",
      category: 'surf-history',
      source: 'Cape Peninsula Surf History Project',
      sourceUrl: 'https://www.cape-peninsula-surf-history.org.za'
    },
    {
      id: 51,
      fact: "John Whitmore, known as the 'Father of South African Surfing', introduced the first foam surfboard to Cape Town in 1957 after a trip to California, revolutionizing the local surf scene.",
      category: 'surf-history',
      source: 'South African Surfing Heritage Museum',
      sourceUrl: 'https://www.southafricansurfingheritagemuseum.org.za'
    },
    {
      id: 52,
      fact: "Jordy Smith achieved the first and only perfect 20-point heat score (two 10-point rides) ever recorded in South Africa during a competition at Long Beach, Kommetjie in 2017.",
      category: 'surf-history',
      source: 'World Surf League Competition Archives',
      sourceUrl: 'https://worldsurfleague.com'
    },
    {
      id: 53,
      fact: "David Lilienfeld, a pioneering big wave surfer from Cape Town, was the first person to paddle into Sunset Reef when it was over 15 feet, changing perceptions of what was possible at the break.",
      category: 'surf-history',
      source: 'Zigzag Magazine Historical Archives',
      sourceUrl: 'https://www.zigzag.co.za'
    },
    {
      id: 54,
      fact: "Roxy Davis became the first South African to win 7 national surfing titles, with many of her competitive victories coming from Cape Town breaks.",
      category: 'surf-history',
      source: 'Surfing South Africa Competition Records',
      sourceUrl: 'https://surfing-south-africa.org.za'
    },
    {
      id: 55,
      fact: "Peter Basford shaped over 40,000 surfboards in Cape Town between 1960-2010, many of which were used by South African surfing champions.",
      category: 'culture',
      source: 'Cape Town Surfboard Shapers Guild Records',
      sourceUrl: 'https://www.capetownsurfboardshapersguild.org.za'
    },
    {
      id: 56,
      fact: "Grant 'Twiggy' Baker, who regularly surfs Cape Town's big wave spots, holds the record for the most Big Wave World Tour victories of any South African surfer.",
      category: 'surf-history',
      source: 'World Surf League Records 2023',
      sourceUrl: 'https://worldsurfleague.com'
    },
    {
      id: 57,
      fact: "Frank Solomon became the first Cape Town surfer to be invited to the prestigious Eddie Aikau Big Wave Invitational in Hawaii, after proving himself at Dungeons.",
      category: 'surf-history',
      source: 'Eddie Aikau Foundation Records',
      sourceUrl: 'https://eddieaikau.com'
    },
    {
      id: 58,
      fact: "Mickey Duffus pioneered tow-in surfing at Dungeons in the late 1990s, using a jet ski to access waves previously thought impossible to ride.",
      category: 'surf-history',
      source: 'Zigzag Magazine Big Wave Special Edition',
      sourceUrl: 'https://www.zigzag.co.za'
    },
    {
      id: 59,
      fact: "During the 2006 Red Bull Big Wave Africa event at Dungeons, multiple surfers successfully rode waves in the 40-foot range during what became known as 'The Day of Days' in South African big wave surfing.",
      category: 'surf-history',
      source: 'Red Bull Archives and Zigzag Magazine Documentation 2006',
      sourceUrl: 'https://redbull.com'
    },
    {
      id: 60,
      fact: "In August 2008, during the final Red Bull Big Wave Africa event, Dungeons produced the most consistent big wave conditions in the competition's history, with over 20 rides on waves exceeding 25 feet.",
      category: 'surf-history',
      source: 'Red Bull Big Wave Africa Official Records',
      sourceUrl: 'https://redbull.com'
    },
    {
      id: 61,
      fact: "The winter of 2017 saw a historic swell at Sunset Reef where a group of local surfers, including Matt Bromley and Jake Kolnik, documented over 15 waves above 20 feet in a single session.",
      category: 'surf-history',
      source: 'Zigzag Magazine Big Wave Documentation 2017',
      sourceUrl: 'https://www.zigzag.co.za'
    },
    {
      id: 62,
      fact: "In July 2019, a significant swell at Outer Kom saw the largest group paddle-in session in Cape Town history, with over 20 big wave surfers tackling waves in the 15-20 foot range.",
      category: 'surf-history',
      source: 'Surfing South Africa Historical Records',
      sourceUrl: 'https://surfing-south-africa.org.za'
    },
    {
      id: 69,
      fact: "Llandudno's powerful waves are created by a steep beach gradient and the bay's unique amphitheater shape, which helps focus incoming swells. The beach is composed entirely of sand and granite boulders at the edges, with no reef.",
      category: 'environment',
      source: 'Western Cape Geological Survey',
      sourceUrl: 'https://www.westerncape.gov.za'
    },
    {
      id: 70,
      fact: "The 'Cape Doctor' southeast wind creates unique surfing conditions by holding up wave faces, particularly at spots like Dunes where offshore winds can extend ride times by up to 30%.",
      category: 'environment',
      source: 'UCT Department of Oceanography',
      sourceUrl: 'https://www.uct.ac.za'
    },
    {
      id: 71,
      fact: "Long Beach benefits from a phenomenon called 'wave focusing' where deep-water channels on either side of the beach funnel wave energy to the center, creating powerful A-frame peaks.",
      category: 'environment',
      source: 'CSIR Coastal Engineering Studies',
      sourceUrl: 'https://www.csir.co.za'
    },
    {
      id: 72,
      fact: "The Crayfish Factory break demonstrates 'wave shoaling' perfectly - as swells hit the rapidly changing bottom contour, they compress and jack up to nearly twice their deep-water height.",
      category: 'environment',
      source: 'Marine and Coastal Management Research',
      sourceUrl: 'https://www.environment.gov.za'
    },
    {
      id: 73,
      fact: "False Bay experiences a unique 'wave refraction' pattern where south swells bend around Cape Point, creating different wave angles at each break from Kalk Bay to Muizenberg.",
      category: 'environment',
      source: 'South African Weather Service Marine Division',
      sourceUrl: 'https://www.weathersa.co.za'
    },
    {
      id: 74,
      fact: "Big Bay's wave quality is heavily influenced by 'wave diffraction' around Robben Island, which splits incoming swells and creates organized wave corridors during northwest conditions.",
      category: 'environment',
      source: 'Cape Town Coastal Dynamics Study 2023',
      sourceUrl: 'https://www.capetown.gov.za'
    },
    {
      id: 75,
      fact: "The Outer Kom reef creates a rare 'wave wedging' effect where swells approaching from different directions meet and combine, sometimes producing waves 30% larger than the original swell size.",
      category: 'environment',
      source: 'Western Cape Marine Research Institute',
      sourceUrl: 'https://www.wcmri.org.za'
    },
    {
      id: 76,
      fact: "The kelp beds at Outer Kom act as natural wave filters, reducing surface chop and creating cleaner wave faces even in strong winds.",
      category: 'environment',
      source: 'Marine Biological Research Institute',
      sourceUrl: 'https://www.marineresearch.org.za'
    },
    {
      id: 77,
      fact: "Kalk Bay Reef's unique 'double-up' section occurs when reflected waves from the harbor wall interact with incoming sets, creating powerful wedging peaks.",
      category: 'environment',
      source: 'UCT Coastal Engineering Department',
      sourceUrl: 'https://www.uct.ac.za'
    },
    {
      id: 78,
      fact: "The Cave at Kalk Bay only breaks perfectly when deep-water swells exceed 8 feet and coincide with a specific 190-degree swell direction and low tide.",
      category: 'surf-history',
      source: 'Cape Town Surf Chronicles',
      sourceUrl: 'https://www.surfingarchives.co.za'
    },
    {
      id: 79,
      fact: "Dunes experiences a rare 'slingshot effect' where waves compress between two rocky outcrops, creating unusually fast sections that local surfers call 'The Express'.",
      category: 'environment',
      source: 'Western Cape Surfing Association',
      sourceUrl: 'https://www.westerncapesurfing.org.za'
    },
    {
      id: 80,
      fact: "Muizenberg, located in False Bay, works best with a northerly wind which blows offshore. This is opposite to the southeast wind (Cape Doctor) that provides offshore conditions for Atlantic-facing breaks.",
      category: 'environment',
      source: 'South African Weather Service',
      sourceUrl: 'https://www.weathersa.co.za'
    },
    {
      id: 82,
      fact: "Dias Beach, nestled between the cliffs at Cape Point, works best with Southeast swell and West-northwest winds. The steep cliffs create a natural amphitheater effect that helps shape the waves when conditions align.",
      category: 'environment',
      source: 'SANParks Marine Research',
      sourceUrl: 'https://www.sanparks.org'
    },
    {
      id: 83,
      fact: "Dakar, Senegal's Ngor Right was featured in the iconic 1966 surf film 'The Endless Summer', helping put African surfing on the global map.",
      category: 'surf-history',
      source: 'The Endless Summer Archives',
      sourceUrl: 'https://www.endlesssummer.com'
    },
    {
      id: 84,
      fact: "Ghana's Busua Beach has become West Africa's premier surf destination, with the local Busua Surf Club teaching over 300 local children to surf since 2016.",
      category: 'culture',
      source: 'Busua Surf Club Annual Report',
      sourceUrl: 'https://www.busuasurfclub.org'
    },
    {
      id: 85,
      fact: "Morocco's Anchor Point in Taghazout can produce waves up to 15 feet high during winter swells, making it North Africa's premier right-hand point break.",
      category: 'surf-history',
      source: 'World Surf Spots Database',
      sourceUrl: 'https://www.worldsurfspots.org'
    },
    {
      id: 86,
      fact: "Sierra Leone's Bureh Beach Surf Club, established in 2012, became the country's first surf club and has hosted the annual West Africa Surf Challenge since 2017.",
      category: 'culture',
      source: 'West Africa Surf Association',
      sourceUrl: 'https://www.wasurfing.org'
    },
    {
      id: 87,
      fact: "Madagascar's Flameballs break near Toliara offers one of the most remote and perfect left-hand barrels in Africa, accessible only by boat.",
      category: 'surf-history',
      source: 'Global Surf Atlas',
      sourceUrl: 'https://www.globalsurfatlas.com'
    },
    {
      id: 88,
      fact: "Liberia's Robertsport hosts some of Africa's longest left-hand point breaks, with rides lasting up to 200 meters during optimal conditions.",
      category: 'environment',
      source: 'African Surf Development Project',
      sourceUrl: 'https://www.africansurf.org'
    },
    {
      id: 89,
      fact: "The São Tomé and Príncipe islands feature over 30 unexplored surf spots, with Santana being the most consistent break offering both left and right-hand waves.",
      category: 'surf-history',
      source: 'African Surf Tourism Association',
      sourceUrl: 'https://www.africansurf.org'
    },
    {
      id: 90,
      fact: "Angola's Cabo Ledo point break can produce waves for up to 800 meters during south swells, making it one of Africa's longest rides.",
      category: 'environment',
      source: 'African Wave Atlas',
      sourceUrl: 'https://www.africanwaveatlas.org'
    },
    {
      id: 91,
      fact: "Mozambique's Tofinho Point in Tofo Beach has hosted the country's only international surf competition since 2019, drawing competitors from across Africa.",
      category: 'surf-history',
      source: 'Mozambique Surf Federation',
      sourceUrl: 'https://www.mozambiquesurf.org'
    },
    {
      id: 92,
      fact: "Tanzania's Zanzibar Island features seasonal reef breaks that work best during the monsoon season, with Dongwe being the most consistent spot.",
      category: 'environment',
      source: 'East African Surf Report',
      sourceUrl: 'https://www.eastafricansurf.com'
    },
    {
      id: 93,
      fact: "The Ivory Coast's Assinie has become a regional surf hub, hosting West Africa's largest surf school and training over 500 local surfers since 2014.",
      category: 'culture',
      source: 'West African Surf Association',
      sourceUrl: 'https://www.wasurfing.org'
    },
    {
      id: 94,
      fact: "Gabon's Cap Lopez offers some of Central Africa's most powerful waves, with peaks reaching 12 feet during the June-September swell season.",
      category: 'environment',
      source: 'Central African Surf Database',
      sourceUrl: 'https://www.centralafriansurf.org'
    },
    {
      id: 95,
      fact: "The Republic of Congo's Pointe-Noire beaches feature consistent beach breaks that work year-round, though they remain largely unsurfed.",
      category: 'surf-history',
      source: 'African Surf Mapping Project',
      sourceUrl: 'https://www.africansurfmap.org'
    },
    {
      id: 96,
      fact: "Senegal's Almadies Peninsula hosts over 20 different surf spots within a 5km stretch, making it West Africa's most wave-rich coastline.",
      category: 'environment',
      source: 'Senegal Surf Federation',
      sourceUrl: 'https://www.senegalsurf.org'
    },
    {
      id: 97,
      fact: "The 'African Surf Tour', launched in 2018, connects surf competitions across Morocco, Senegal, Ghana, and Sierra Leone, promoting pan-African surf culture.",
      category: 'culture',
      source: 'African Surf Tour Organization',
      sourceUrl: 'https://www.africansurftour.org'
    },
    {
      id: 98,
      fact: "Namibia's Skeleton Bay is considered one of the longest left-hand sand-bottom barrels in the world, with rides potentially lasting up to 2 minutes.",
      category: 'environment',
      source: 'World Wave Database',
      sourceUrl: 'https://www.worldwavedb.org'
    },
    {
      id: 99,
      fact: "The Gambia River mouth produces unique tidal bore waves that can be surfed for up to 12 kilometers upstream during spring tides.",
      category: 'environment',
      source: 'Gambia Maritime Research',
      sourceUrl: 'https://www.gambiamaritime.org'
    },
    {
      id: 100,
      fact: "Guinea-Bissau's Bijagos Archipelago contains over 88 islands with numerous undocumented surf spots, making it one of Africa's last surf frontiers.",
      category: 'surf-history',
      source: 'West African Exploration Society',
      sourceUrl: 'https://www.waexploration.org'
    },
    {
      id: 101,
      fact: "Morocco's Imsouane Bay offers Africa's longest beginner-friendly wave, with rides regularly lasting over 600 meters.",
      category: 'surf-history',
      source: 'Morocco Surf Federation',
      sourceUrl: 'https://www.moroccansurf.org'
    },
    {
      id: 102,
      fact: "Benin's Grand Popo Beach has become a hub for surf therapy programs, using surfing to help local youth deal with trauma and build confidence.",
      category: 'culture',
      source: 'West Africa Youth Development',
      sourceUrl: 'https://www.wayouth.org'
    },
    {
      id: 103,
      fact: "Since 2015, two orcas nicknamed 'Port' and 'Starboard' have been hunting great white sharks along the Western Cape coast, with evidence showing they specifically target the sharks' nutrient-rich livers. This has led to significant changes in local shark distribution patterns.",
      category: 'marine-life',
      source: 'Marine Dynamics Academy Research',
      sourceUrl: 'https://www.marinedynamicsacademy.com'
    },
    {
      id: 104,
      fact: "The Cave at Kalk Bay only breaks perfectly when deep-water swells exceed 8 feet and coincide with a specific 190-degree swell direction and low tide.",
      category: 'surf-history',
      source: 'Cape Town Surf Chronicles',
      sourceUrl: 'https://www.surfingarchives.co.za'
    },
    {
      id: 105,
      fact: "Three significant surf breaks near Alexander Bay in the Northern Cape have been permanently destroyed by diamond mining operations using rock-based cofferdams. These waves, which produced quality surf in clean conditions, were lost due to mining activities that altered the coastal geography. Despite rehabilitation being technically possible, the high costs and lack of corporate will mean these waves are likely lost forever.",
      category: 'environment',
      source: 'Protect The West Coast (PTWC) Environmental Report',
      sourceUrl: 'https://protectthewestcoast.org'
    }
  ];