import { v2 as cloudinary } from "cloudinary";
import { Parser } from "json2csv";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

type FolderConfig = {
  key: string;
  group: string;
  prefix: string;
};

const folders: FolderConfig[] = [
  { key: "frontdesigns", group: "Front", prefix: "BL-F" },
  { key: "backdesigns", group: "Back", prefix: "BL-B" },
  { key: "sleevedesign", group: "Sleeve", prefix: "BL-SL" },
  { key: "designstyle", group: "Style", prefix: "BL-ST" },
];

// 🔁 Fetch images with pagination
async function fetchImages(folder: string) {
  let allResources: any[] = [];
  let nextCursor: string | undefined = undefined;

  console.log(`📂 Fetching folder: ${folder}`);

  do {
    const res: any = await cloudinary.search
      .expression(`folder:blouse/${folder}`)
      .max_results(100)
      .next_cursor(nextCursor)
      .execute();

    if (res.resources?.length) {
      allResources.push(...res.resources);
    }

    nextCursor = res.next_cursor;
  } while (nextCursor);

  console.log(`✅ ${folder}: ${allResources.length} images fetched`);
  return allResources;
}

// 🧠 Generate CSV
async function generateCSV() {
  let allData: any[] = [];

  for (const folder of folders) {
    const images = await fetchImages(folder.key);

    images.forEach((img: any, index: number) => {
      const fileName = img.public_id?.split("/").pop() || `design-${index + 1}`;

      allData.push({
        retailer_id: `${folder.prefix}-${index + 1}`,
        item_group_id: `BLOUSE-${folder.group.toUpperCase()}`,

        // ✅ REQUIRED FIELDS
        title: `Blouse ${folder.group} Design ${index + 1}`,
        description: `Premium blouse ${folder.group.toLowerCase()} design for custom tailoring`,

        image_link: img.secure_url,

        availability: "in stock",
        price: "0 INR",
        condition: "new",

        link: img.secure_url,

        color: "Multi",
        gender: "female",
        google_product_category: "Apparel & Accessories > Clothing",

        // ✅ REQUIRED FIX
        country_of_origin: "India",
      });
    });
  }

  if (allData.length === 0) {
    console.log("❌ No data found. Check Cloudinary folders.");
    return;
  }

  const parser = new Parser({
    fields: [
      "retailer_id",
      "item_group_id",
      "title",
      "description",
      "image_link",
      "availability",
      "price",
      "condition",
      "link",
      "color",
      "gender",
      "google_product_category",
      "country_of_origin",
    ],
  });

  const csv = parser.parse(allData);

  fs.writeFileSync("blouse_catalog_interakt.csv", csv);

  console.log(`🎉 CSV generated successfully with ${allData.length} items`);
}

generateCSV().catch((err) => {
  console.error("❌ Error generating CSV:", err);
});
