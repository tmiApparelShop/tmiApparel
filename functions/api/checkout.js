export async function onRequestPost(context) {
  // 1. Grab the secure environment variables from Cloudflare
  const { env, request } = context;
  const printifyApiKey = env.PRINTIFY_API_KEY;
  const printifyShopId = env.PRINTIFY_SHOP_ID;

  // If the keys are missing in the Cloudflare dashboard, stop immediately
  if (!printifyApiKey || !printifyShopId) {
    return new Response(JSON.stringify({ error: "Server Configuration Error: Missing Keys" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 2. Read the cart and shipping data sent from your React frontend
    const orderData = await request.json();

    // 3. Construct the official Printify Order payload
    const printifyPayload = {
      external_id: `TMI-${Date.now()}`, // Generates a unique order number based on the timestamp
      label: "Too Much Information Apparel Order", 
      line_items: orderData.cartItems.map(item => ({
        variant_id: item.id, // For a live order, this MUST be the specific Printify Variant ID
        quantity: item.quantity
      })),
      shipping_method: 1, // 1 = Standard Shipping
      send_shipping_notification: true,
      address_to: {
        first_name: orderData.shipping.firstName,
        last_name: orderData.shipping.lastName,
        email: orderData.shipping.email,
        phone: orderData.shipping.phone,
        country: orderData.shipping.country,
        region: orderData.shipping.state,
        address1: orderData.shipping.address,
        city: orderData.shipping.city,
        zip: orderData.shipping.zip
      }
    };

    // 4. Send the secure POST request directly from Cloudflare to Printify
    const printifyResponse = await fetch(`https://api.printify.com/v1/shops/${printifyShopId}/orders.json`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${printifyApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(printifyPayload)
    });

    const result = await printifyResponse.json();

    // Catch any errors Printify throws (e.g., out of stock, missing address fields)
    if (!printifyResponse.ok) {
      console.error("Printify API Error:", result);
      return new Response(JSON.stringify({ error: "Order failed at Printify", details: result }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 5. Send a success message back to the React frontend
    return new Response(JSON.stringify({ success: true, order_id: result.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
