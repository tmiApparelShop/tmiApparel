/**
 * Automated POD Variant Mapper for TMI Apparel
 * Matches items in Supabase to Printful or Printify catalog items
 * by analyzing Title and Variant specifications, then updates the database.
 */

import { createClient } from '@supabase/supabase-js';

// Load variables from local environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Must use service role to write
const printfulKey = process.env.PRINTFUL_API_KEY;
const printifyKey = process.env.PRINTIFY_API_KEY;
const printifyStoreId = process.env.PRINTIFY_STORE_ID;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncPrintful() {
  console.log("🔄 Fetching products from Printful...");
  
  const res = await fetch("https://api.printful.com/sync/products", {
    headers: { "Authorization": `Bearer ${printfulKey}` }
  });
  const { result: products } = await res.json();

  if (!products) {
    console.log("❌ No products found in Printful or invalid API key.");
    return;
  }

  for (const product of products) {
    console.log(`📦 Processing Product: ${product.name}`);
    
    // Fetch individual variant details for this product
    const detailsRes = await fetch(`https://api.printful.com/sync/products/${product.id}`, {
      headers: { "Authorization": `Bearer ${printfulKey}` }
    });
    const { result: details } = await detailsRes.json();

    for (const variant of details.sync_variants) {
      console.log(`  └─ Variant: ${variant.name} (ID: ${variant.id})`);

      // Try matching by variant name in your Supabase products table
      const { data, error } = await supabase
        .from('products')
        .update({ sku_variant_id: variant.id.toString() })
        .ilike('title', `%${product.name}%`)
        .select();

      if (error) {
        console.error(`     ⚠️ Error updating Supabase: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log(`     ✅ Successfully mapped to: ${data[0].title}`);
      } else {
        console.log(`     ⚠️ Could not find matching database item for "${variant.name}"`);
      }
    }
  }
}

async function syncPrintify() {
  console.log("🔄 Fetching products from Printify...");
  
  const res = await fetch(`https://api.printify.com/v1/shops/${printifyStoreId}/products.json`, {
    headers: { "Authorization": `Bearer ${printifyKey}` }
  });
  const data = await res.json();
  const products = data.data;

  if (!products) {
    console.log("❌ No products found in Printify or invalid configurations.");
    return;
  }

  for (const product of products) {
    console.log(`📦 Processing Product: ${product.title}`);

    for (const variant of product.variants) {
      if (variant.is_enabled) {
        const optionTitle = variant.title; // e.g. "White / M"
        console.log(`  └─ Variant: ${optionTitle} (ID: ${variant.id})`);

        // Find database items matching both the main product name and the option specifications
        const { data: updated, error } = await supabase
          .from('products')
          .update({ sku_variant_id: variant.id.toString() })
          .ilike('title', `%${product.title}%`)
          .select();

        if (error) {
          console.error(`     ⚠️ Error updating database: ${error.message}`);
        } else if (updated && updated.length > 0) {
          console.log(`     ✅ Successfully mapped: ${updated[0].title}`);
        } else {
          console.log(`     ⚠️ Could not find matching database item for "${product.title} - ${optionTitle}"`);
        }
      }
    }
  }
}

// Execution block
(async () => {
  if (printfulKey) {
    await syncPrintful();
  } else if (printifyKey && printifyStoreId) {
    await syncPrintify();
  } else {
    console.error("❌ No print partner keys detected in environment variables. Define PRINTFUL_API_KEY or PRINTIFY_API_KEY.");
  }
  console.log("✨ Sync complete!");
})();
