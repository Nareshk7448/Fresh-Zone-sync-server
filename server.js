const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
    status: "PLACED",
    estimatedDurationMinutes: 12,
    assignedDeliveryPartnerId: null,
    assignedDeliveryPartnerName: null,
    assignedDeliveryPartnerPhone: null,
    driverCurrentLatitude: 13.0694,
    driverCurrentLongitude: 80.1948,
    orderTimeMillis: Date.now(),
    deliveryOtp: "5192"
  }
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "online",
    service: "Koyambedu Quick-Commerce Global Relay",
    activeOrders: orders.length,
    timestamp: new Date().toISOString()
  });
});

// 1. Get All Orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// 2. Get Pending Orders (For Delivery Partner Radar)
app.get('/api/orders/pending', (req, res) => {
  const pending = orders.filter(o => o.status === 'PLACED');
  res.json(pending);
});

// 3. Get Single Order (For Customer Live Tracking & Handover)
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.orderId === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.json(order);
});

// 4. Place New Order (Customer App)
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

  console.log(`[CLOUD] New Order Placed: #${newOrder.orderId} | Total: ₹${newOrder.totalAmount}`);
  res.status(201).json(newOrder);
});

// 5. Accept Order (Delivery Partner App)
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

// 6. Update Order Status (PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED)
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

// 7. Stream Live Driver GPS Coordinates (From Rider Phone to Cloud)
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

// 8. Admin Fleet Oversight: Get Active Driver Locations
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
  console.log(`📦 Orders endpoint: http://localhost:${PORT}/api/orders`);
  console.log(`=======================================================`);
});
