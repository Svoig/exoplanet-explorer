/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "exoplanet-explorer",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-2",
          profile: input?.stage === "production" ? "exoplanet-production" : "exoplanet-dev"
        }
      }
    };
  },
  async run() {
    const systemCatalog = new sst.aws.Dynamo("SystemCatalog", {
      deletionProtection: true,
      fields: {
        pk: "string",
        sk: "string",
        gsi1pk: "string",
        gsi1sk: "string"
      },
      primaryIndex: {
        hashKey: "pk",
        rangeKey: "sk"
      },
      globalIndexes: {
        gsi1: {
          hashKey: "gsi1pk",
          rangeKey: "gsi1sk"
        }
      }
    });

    const ingestSeedExoplanets = new sst.aws.Function("IngestSeedExoplanets", {
      handler: "packages/core/functions/ingestSeedExoplanets.handler",
      link: [systemCatalog],
      timeout: "5 minutes"
    });

    // For cached planet images, etc
    const uploads = new sst.aws.Bucket("Uploads", {
      access: "cloudfront"
    });

    const web = new sst.aws.Nextjs("Web", {
      path: "packages/web",
      // TODO: Add `uploads` back in when using S3
      // link: [systemCatalog, uploads],
      link: [systemCatalog],
      environment: {
        STAGE: $app.stage,
      },
      // Add when domain is set up through Route53
      // domain: {
      //   name: "some-cool-domain.com"
      // },
    });

    return {
      webUrl: web.url,
      systemCatalogTable: systemCatalog.name,
      uploadsBucket: uploads.name,
      ingestSeedExoplanetsFunction: ingestSeedExoplanets.name
    };
  },
});
