const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory daily vegetable catalog (synchronized with Koyambedu wholesale market rates)
let vegetables = [
  { id: "veg_1", nameEnglish: "Country Tomato", nameTamil: "நாட்டு தக்காளி", unit: "kg", weightLabel: "500 g", marketPricePerUnit: 35.0, discountPercentage: 10.0, isAvailable: true, category: "DAILY_ESSENTIALS", emoji: "🍅" },
  { id: "veg_2", nameEnglish: "Bellary Onion", nameTamil: "பெல்லாரி வெங்காயம்", unit: "kg", weightLabel: "1 kg", marketPricePerUnit: 45.0, discountPercentage: 5.0, isAvailable: true, category: "DAILY_ESSENTIALS", emoji: "🧅" },
  { id: "veg_3", nameEnglish: "Small Sambar Onion", nameTamil: "சின்ன வெங்காயம்", unit: "kg", weightLabel: "500 g", marketPricePerUnit: 75.0, discountPercentage: 0.0, isAvailable: true, category: "SAMBAR_SPECIAL", emoji: "🧅" },
  { id: "veg_4", nameEnglish: "Fresh Potato", nameTamil: "உருளைக்கிழங்கு", unit: "kg", weightLabel: "1 kg", marketPricePerUnit: 38.0, discountPercentage: 10.0, isAvailable: true, category: "DAILY_ESSENTIALS", emoji: "🥔" },
  { id: "veg_5", nameEnglish: "Country Drumstick", nameTamil: "நாட்டு முருங்கைக்காய்", unit: "kg", weightLabel: "500 g", marketPricePerUnit: 60.0, discountPercentage: 15.0, isAvailable: true, category: "SAMBAR_SPECIAL", emoji: "🥢" },
  { id: "veg_6", nameEnglish: "Green Brinjal", nameTamil: "பச்சை கத்தரிக்காய்", unit: "kg", weightLabel: "500 g", marketPricePerUnit: 40.0, discountPercentage: 0.0, isAvailable: true, category: "SAMBAR_SPECIAL", emoji: "🍆" },
  { id: "veg_7", nameEnglish: "Tender Lady's Finger", nameTamil: "பிஞ்சு வெண்டைக்காய்", unit: "kg", weightLabel: "500 g", marketPricePerUnit: 48.0, discountPercentage: 12.0, isAvailable: true, category: "SAMBAR_SPECIAL", emoji: "🥬" },
  { id: "veg_8", nameEnglish: "Ooty Carrot", nameTamil: "ஊட்டி கேரட்", unit: "kg", weightLabel: "500 g", marketPricePerUnit: 65.0, discountPercentage: 8.0, isAvailable: true, category: "ROOTS_EXOTIC", emoji: "🥕" },
  { id: "veg_9", nameEnglish: "French Beans", nameTamil: "பீன்ஸ்", unit: "kg", weightLabel: "500 g", marketPricePerUnit: 70.0, discountPercentage: 0.0, isAvailable: true, category: "DAILY_ESSENTIALS", emoji: "🫛" },
  { id: "veg_10", nameEnglish: "Spicy Green Chilli", nameTamil: "கார பச்சை மிளகாய்", unit: "kg", weightLabel: "250 g", marketPricePerUnit: 50.0, discountPercentage: 10.0, isAvailable: true, category: "ROOTS_EXOTIC", emoji: "🌶️" },
  { id: "veg_11", nameEnglish: "Old Ginger", nameTamil: "பழைய இஞ்சி", unit: "kg", weightLabel: "250 g", marketPricePerUnit: 140.0, discountPercentage: 5.0, isAvailable: true, category: "ROOTS_EXOTIC", emoji: "🫚" },
  { id: "veg_12", nameEnglish: "Fresh Coriander Leaves", nameTamil: "கொத்தமல்லி தழை", unit: "bunch", weightLabel: "1 bunch", marketPricePerUnit: 15.0, discountPercentage: 0.0, isAvailable: true, category: "LEAFY_GREENS", emoji: "🌿" },
  { id: "veg_13", nameEnglish: "Curry Leaves", nameTamil: "கருவேப்பிலை", unit: "bunch", weightLabel: "1 bunch", marketPricePerUnit: 10.0, discountPercentage: 0.0, isAvailable: true, category: "LEAFY_GREENS", emoji: "🍃" }
];

// In-memory persistent order store (backed by process lifecycle)
let orders = [
  {
    orderId: "KB-101",
    customerAddress: {
      customerName: "Ramesh Kumar",
      customerPhone: "+91 98401 23456",
      fullAddressText: "Plot 45, 3rd Main Rd, MMDA Colony, Arumbakkam",
      landmark: "Near MMDA Park",
      latitude: 13.0682,
      longitude: 80.2030,
      distanceFromKoyambeduKm: 1.1,
      estimatedDurationMinutes: 12
    },
    items: [
      {
        vegetable: {
          id: "veg_1",
          nameEnglish: "Country Tomato",
          nameTamil: "நாட்டு தக்காளி",
          unit: "kg",
          weightLabel: "500 g",
          marketPricePerUnit: 35.0,
          discountPercentage: 10.0,
          category: "DAILY_ESSENTIALS",
          emoji: "🍅"
        },
        quantity: 2.0
      },
      {
        vegetable: {
          id: "veg_2",
          nameEnglish: "Bellary Onion",
          nameTamil: "பெல்லாரி வெங்காயம்",
          unit: "kg",
          weightLabel: "1 kg",
          marketPricePerUnit: 45.0,
          discountPercentage: 5.0,
          category: "DAILY_ESSENTIALS",
          emoji: "🧅"
        },
        quantity: 1.5
      }
    ],
    subtotal: 127.5,
    deliveryFee: 20.0,
    totalAmount: 147.5,
    paymentMethod: "CASH_ON_DELIVERY",
    isPaidOnline: false,
    status: "DELIVERED",
    estimatedDurationMinutes: 12,
    assignedDeliveryPartnerId: "DP_CHENNAI_1",
    assignedDeliveryPartnerName: "Karthik Raja (Partner)",
    assignedDeliveryPartnerPhone: "+91 94440 98765",
    driverCurrentLatitude: 13.0682,
    driverCurrentLongitude: 80.2030,
    orderTimeMillis: Date.now() - 3600000,
    deliveryOtp: "5192"
  }
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "online",
    service: "Koyambedu Quick-Commerce Global Relay",
    activeOrders: orders.length,
    catalogItems: vegetables.length,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// VEGETABLE CATALOG & DAILY PRICING ENDPOINTS
// ==========================================

// 1. Get Live Vegetable Catalog & Prices
app.get('/api/vegetables', (req, res) => {
  res.json(vegetables);
});

// 2. Vendor Admin: Update Daily Market Price & Discount %
app.post('/api/vegetables/prices', (req, res) => {
  const updates = Array.isArray(req.body) ? req.body : [req.body];
  let updatedCount = 0;

  for (const item of updates) {
    const id = item.id || item.vegId;
    const veg = vegetables.find(v => v.id === id);
    if (veg) {
      if (item.marketPricePerUnit != null) veg.marketPricePerUnit = Number(item.marketPricePerUnit);
      if (item.discountPercentage != null) veg.discountPercentage = Number(item.discountPercentage);
      if (item.isAvailable != null) veg.isAvailable = Boolean(item.isAvailable);
      updatedCount++;
      console.log(`[CLOUD RATE UPDATE] ${veg.nameEnglish} -> Price: ₹${veg.marketPricePerUnit}, Disc: ${veg.discountPercentage}%, Avail: ${veg.isAvailable}`);
    }
  }

  res.json({
    success: true,
    updatedCount,
    vegetables
  });
});

// 3. Full Vegetable Catalog Sync
app.post('/api/vegetables/sync', (req, res) => {
  if (Array.isArray(req.body) && req.body.length > 0) {
    vegetables = req.body;
    console.log(`[CLOUD CATALOG SYNC] Full catalog updated with ${vegetables.length} items`);
    res.json({ success: true, count: vegetables.length, vegetables });
  } else {
    res.status(400).json({ error: "Expected non-empty array of vegetables" });
  }
});

// ==========================================
// ORDER LIFECYCLE ENDPOINTS
// ==========================================

// 4. Get All Orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// 5. Get Pending Orders (For Delivery Partner Radar)
app.get('/api/orders/pending', (req, res) => {
  const pending = orders.filter(o => o.status === 'PLACED');
  res.json(pending);
});

// 6. Get Single Order (For Customer Live Tracking & Handover)
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.orderId === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.json(order);
});

// 7. Place New Order (Customer App)
app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder.orderId) {
    newOrder.orderId = "KB-" + (100 + orders.length + 1);
  }
  newOrder.orderTimeMillis = newOrder.orderTimeMillis || Date.now();
  newOrder.status = newOrder.status || 'PLACED';

  // Check if exists
  const existingIndex = orders.findIndex(o => o.orderId === newOrder.orderId);
  if (existingIndex >= 0) {
    orders[existingIndex] = newOrder;
  } else {
    orders.unshift(newOrder);
  }

  console.log(`[CLOUD] New Order Placed: #${newOrder.orderId} | Customer: ${newOrder.customerAddress?.customerName} | Total: ₹${newOrder.totalAmount}`);
  res.status(201).json(newOrder);
});

// 8. Accept Order (Delivery Partner App)
app.put('/api/orders/:id/accept', (req, res) => {
  const { partnerId, partnerName, partnerPhone, driverLat, driverLng } = req.body;
  const order = orders.find(o => o.orderId === req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.status = 'ACCEPTED';
  order.assignedDeliveryPartnerId = partnerId || "DP_CHENNAI_1";
  order.assignedDeliveryPartnerName = partnerName || "Karthik Raja (Partner)";
  order.assignedDeliveryPartnerPhone = partnerPhone || "+91 94440 98765";
  if (driverLat != null) order.driverCurrentLatitude = driverLat;
  if (driverLng != null) order.driverCurrentLongitude = driverLng;

  console.log(`[CLOUD] Order Accepted: #${order.orderId} by ${order.assignedDeliveryPartnerName}`);
  res.json(order);
});

// 9. Update Order Status (PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED)
app.put('/api/orders/:id/status', (req, res) => {
  const { status, driverLat, driverLng } = req.body;
  const order = orders.find(o => o.orderId === req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.status = status;
  if (driverLat != null) order.driverCurrentLatitude = driverLat;
  if (driverLng != null) order.driverCurrentLongitude = driverLng;

  console.log(`[CLOUD] Order Status Changed: #${order.orderId} -> ${status}`);
  res.json(order);
});

// 10. Stream Live Driver GPS Coordinates (From Rider Phone to Cloud)
app.post('/api/orders/:id/location', (req, res) => {
  const { latitude, longitude } = req.body;
  const order = orders.find(o => o.orderId === req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.driverCurrentLatitude = latitude;
  order.driverCurrentLongitude = longitude;

  res.json({
    success: true,
    orderId: order.orderId,
    driverCurrentLatitude: latitude,
    driverCurrentLongitude: longitude
  });
});

// 11. Admin Fleet Oversight: Get Active Driver Locations
app.get('/api/drivers', (req, res) => {
  const activeOrders = orders.filter(o =>
    o.status === 'ACCEPTED' || o.status === 'PICKED_UP' || o.status === 'OUT_FOR_DELIVERY'
  );

  const drivers = activeOrders.map(o => ({
    orderId: o.orderId,
    partnerName: o.assignedDeliveryPartnerName,
    partnerPhone: o.assignedDeliveryPartnerPhone,
    latitude: o.driverCurrentLatitude,
    longitude: o.driverCurrentLongitude,
    status: o.status,
    customerAddress: o.customerAddress
  }));

  res.json(drivers);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Koyambedu Veg Delivery Global Cloud Sync API running`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🥦 Vegetables endpoint: http://localhost:${PORT}/api/vegetables`);
  console.log(`📦 Orders endpoint: http://localhost:${PORT}/api/orders`);
  console.log(`=======================================================`);
});
