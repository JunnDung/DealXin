import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY ?? "masterKey",
});

const INDEX = "deals";

async function configureIndex() {
  console.log("Configuring index...");
  const index = client.index(INDEX);

  await index.updateSettings({
    searchableAttributes: ["title", "description", "platform", "categoryName"],
    filterableAttributes: [
      "platform",
      "categoryId",
      "status",
      "discountPercent",
    ],
    sortableAttributes: [
      "createdAt",
      "discountPercent",
      "salePrice",
      "score",
    ],
    rankingRules: [
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
    ],
  });
  console.log("Index configured.");
}

async function reindex() {
  // This script should be run AFTER connecting to the database directly
  // For now, it just clears and shows instructions
  console.log("Meilisearch reindex script");
  console.log("Run: npx tsx scripts/reindex-search.ts");
}

reindex().catch(console.error);
