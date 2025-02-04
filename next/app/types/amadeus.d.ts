declare module "amadeus" {
  export default class Amadeus {
    constructor(config: { clientId: string; clientSecret: string });

    referenceData: {
      locations: {
        get(params: {
          keyword: string;
          subType: string;
          page: { limit: number };
        }): Promise<{ data: any[] }>;
      };
    };

    static location: {
      any: string;
    };
  }
}
