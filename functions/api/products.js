export async function onRequestGet(context) {
  const { env } = context;
  const printifyKey = env.PRINTIFY_API_KEY;
  const printifyShopId = env.PRINTIFY_SHOP_ID;
  const printfulKey = env.PRINTFUL_API_KEY;

  if (!printifyKey || !printifyShopId) {
    return new Response(JSON.stringify({ error: "Server Configuration Error: Missing Keys" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let unifiedProducts = [];

    // 1. Fetch Printify Catalog
    const printifyRes = await fetch(`https://api.printify.com/v1/shops/${printifyShopId}/products.json`, {
      headers: { "Authorization": `Bearer ${printifyKey}` }
    });
    
    if (printifyRes.ok) {
      const printifyData = await printifyRes.json();
      const pfyProducts = printifyData.data.map(item => ({
        id: item.id,
        name: item.title,
        price: (item.variants[0].price / 100).toFixed(2), // Formats cents to standard USD
        img: item.images[0]?.src || "",
        provider: "printify"
      }));
      unifiedProducts = [...unifiedProducts, ...pfyProducts];
    }

    // 2. Fetch Printful Catalog (Optional: Only runs if key is provided)
    if (printfulKey) {
      const printfulRes = await fetch("https://api.printful.com/store/products", {
        headers: { "Authorization": `Bearer ${printfulKey}` }
      });

      if (printfulRes.ok) {
        const printfulData = await printfulRes.json();
        const pflProducts = printfulData.result.map(item => ({
          id: item.id,
          name: item.name,
          price: "29.99", // Printful requires secondary endpoint for exact variant pricing
          img: item.thumbnail_url,
          provider: "printful"
        }));
        unifiedProducts = [...unifiedProducts, ...pflProducts];
      }
    }

    return new Response(JSON.stringify(unifiedProducts), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to sync inventory" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
