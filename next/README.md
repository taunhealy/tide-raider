This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Fetching & Caching Surf Conditions:

graph TD

    A[HeroProduct loads] --> B[Fetch surf-conditions]
    B --> C[API scrapes data if needed]
    C --> D[Store in Redis cache]
    C --> E[Calculate beach ratings]
    E --> F[Store in database]
    G[User visits Raid page] --> H[Check Redis cache]
    H --> I[Return cached data]
    H --> J[Use stored beach ratings]
    __________________________

Session Usage

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    // Usage when querying relationships:

const event = await prisma.event.findUnique({
where: { id: eventId },
select: { userId: true } // Foreign key to user
});

//
When to use which:
Use id when referring to:
The primary key of the current user (session.user.id)
Any entity's own ID (event.id, board.id, etc)

Use userId when referring to:
A foreign key relationship to the user (event.userId, board.userId)

// In [...nextauth].ts configuration
callbacks: {
session({ session, user }) {
session.user.id = user.id; // Ensures database ID is in session
return session;
}
}

---

    📁 app

├── 📁 components
│ ├── 📁 boards
│ │ ├── BoardAvailabilityCalendar.tsx # Calendar view for board availability
│ │ ├── BoardContactForm.tsx # Existing form to be updated
│ │ └── BoardDetails.tsx # Existing board details
│ ├── 📁 rental-request
│ │ ├── RequestChat.tsx # Implemented chat component
│ │ ├── RequestStatusBadge.tsx # Status indicator component
│ │ └── RequestsList.tsx # List of rental requests
│ └── 📁 ui
│ └── Calendar.tsx # Reusable calendar component
├── 📁 api
│ ├── 📁 rental-requests
│ │ ├── route.ts # Implemented main request endpoint
│ │ └── [id]/route.ts # Need to implement for request management
│ ├── 📁 messages
│ │ └── route.ts # Implemented chat messages endpoint
│ └── 📁 availability
│ └── route.ts # Need to implement for availability checks
├── 📁 lib
│ ├── availability.ts # Implemented availability functions
│ ├── pusher.ts # Need to implement Pusher config
│ └── email.ts # Need to implement email service
└── 📁 types
└── rental.ts # Need to update with new types

📁 prisma
└── schema.prisma # Need to add new models

## Blog Post Region/Country Filtering System

The application implements a dynamic blog post filtering system based on geographic regions and countries:

### How It Works

1. **Content Creation in Sanity**:

   - Blog posts are tagged with specific countries using the `RegionReferenceInput` component
   - Countries are organized by continent for easier selection

2. **Dynamic Region-to-Country Mapping**:

   - When a user selects a region in the BeachContainer component, the system:
     - Queries the database to find which country the region belongs to
     - Fetches blog posts tagged with that country
   - This avoids hardcoding region-to-country mappings

3. **API Endpoints**:

   - `/api/regions/details`: Gets country information for a specific region
   - `/api/blog-posts`: Fetches blog posts filtered by country or continent

4. **Components**:
   - `BlogPostsSidebar`: Displays filtered blog posts based on the selected region
   - Uses React Query for efficient data fetching and caching

This approach allows content to be tagged at the country level while enabling region-specific filtering on the frontend, creating a more intuitive user experience.
