// functions/api/products.js

export async function onRequestGet(context) {
  const { env } = context;
  const printifyKey = env.PRINTIFY_API_KEY;
  const printifyShopId = env.PRINTIFY_SHOP_ID;
  const printfulKey = env.PRINTFUL_API_KEY;

  if (!printifyKey || !printfulKey || !printifyShopId) {
    return new Response(JSON.stringify({ error: "Missing API Keys" }), { status: 500 });
  }

  try {
    let unifiedProducts = [];

    // 1. Fetch from Printify
    const printifyRes = await fetch(`https://api.printify.com/v1/shops/${printifyShopId}/products.json`, {
      headers: { "Authorization": `Bearer ${printifyKey}` }
    });
    
    if (printifyRes.ok) {
      const printifyData = await printifyRes.json();
      const pfyProducts = printifyData.data.map(item => ({
        id: item.id,
        name: item.title,
        // Printify returns prices in cents, so we divide by 100
        price: `$${(item.variants[0].price / 100).toFixed(2)}`,
        img: item.images[0]?.src || "",
        provider: "printify"
      }));
      unifiedProducts = [...unifiedProducts, ...pfyProducts];
    }

    // 2. Fetch from Printful
    const printfulRes = await fetch("https://api.printful.com/store/products", {
      headers: { "Authorization": `Bearer ${printfulKey}` }
    });

    if (printfulRes.ok) {
      const printfulData = await printfulRes.json();
      const pflProducts = printfulData.result.map(item => ({
        id: item.id,
        name: item.name,
        price: "View Item", // Printful requires a secondary API call for specific pricing
        img: item.thumbnail_url,
        provider: "printful"
      }));
      unifiedProducts = [...unifiedProducts, ...pflProducts];
    }

    // 3. Send combined catalog back to React
    return new Response(JSON.stringify(unifiedProducts), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), { status: 500 });
  }
}
