
export const categories = ['Smartphones', 'Laptops', 'Accessories', 'Wearables', 'Audio', 'Gaming'];

export const initialCart = [
  { id: 1, name: "iPhone 15 Pro Max", price: 1199, qty: 1 },
  { id: 2, name: "Samsung Galaxy S24", price: 999, qty: 1 }
];

export const products = [
  { id: 1, name: 'iPhone 15 Pro Max', price: 1199, oldPrice: 1299, category: 'Smartphones', rating: 4.9, reviews: 256, desc: 'Latest flagship with A17 Pro chip, stunning camera and durable design.', specs: { cpu: 'A17 Pro', ram: '8GB', storage: '256GB-1TB', display: '6.7" Super Retina XDR', camera: '48MP Main + 12MP Ultra + 12MP 5x' }, image: '📱' },
  { id: 2, name: 'Samsung Galaxy S24', price: 999, oldPrice: 1099, category: 'Smartphones', rating: 4.8, reviews: 189, desc: 'Powerful Android flagship with advanced AI features and bright Dynamic AMOLED display.', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB/512GB', display: '6.2" Dynamic AMOLED', camera: '50MP Main + 10MP + 10MP' }, image: '📱' },
  { id: 3, name: 'MacBook Pro 16"', price: 2499, category: 'Laptops', rating: 4.9, reviews: 342, desc: 'Professional powerhouse laptop with M3 Max chip for demanding workloads.', specs: { cpu: 'M3 Max', ram: '36GB', storage: '1TB SSD', display: '16" Liquid Retina XDR', gpu: '30-core GPU' }, image: '💻' },
  { id: 4, name: 'Dell XPS 15', price: 1899, oldPrice: 2099, category: 'Laptops', rating: '4.7', reviews: 214, desc: 'Premium Windows workstation with an excellent OLED display and powerful RTX graphics.', specs: { cpu: 'Intel Core i9', ram: '32GB DDR5', storage: '1TB NVMe SSD', display: '15.6" OLED 3.5K', gpu: 'RTX 4070' }, image: '💻' },
  { id: 5, name: 'Sony WH-1000XM5', price: 399, category: 'Audio', rating: 4.8, reviews: 521, desc: 'Industry-leading noise canceling headphones with exceptional sound quality and comfort.', specs: { driver: '30mm', freq: '20-20kHz', battery: '8-12 hours', weight: '250g', features: 'ANC, Multipoint Connect' }, image: '🎧' },
  { id: 6, name: 'Apple AirPods Pro', price: 249, category: 'Audio', rating: 4.6, reviews: 412, desc: 'Premium wireless earbuds with Active Noise Cancellation and Spatial Audio.', specs: { driver: 'Dynamic drivers', freq: '20Hz-20kHz', battery: '6 hours', charge: '30 hours with case', features: 'ANC, Spatial Audio' }, image: '🎧' },
  { id: 7, name: 'Apple Watch Ultra', price: 799, category: 'Wearables', rating: 4.7, reviews: 298, desc: 'Ultimate action sports watch made from Titanium with advanced GPS capabilities.', specs: { display: '1.92" Retina', battery: '36+ hours', water: '100m', materials: 'Titanium', features: 'GPS, Cellular, Always-On' }, image: '⌚' },
  { id: 8, name: 'iPad Pro 12.9"', price: 1099, category: 'Accessories', rating: 4.8, reviews: 367, desc: 'Powerful creative device using the M2 chip, perfect for design and video editing.', specs: { cpu: 'M2', ram: '8GB', storage: '128GB-2TB', display: '12.9" Mini-LED', features: 'Face ID, ProMotion 120Hz' }, image: '📱' },
  { id: 9, name: 'PlayStation 5', price: 499, category: 'Gaming', rating: 4.9, reviews: 645, desc: 'Next-gen gaming console offering blazing-fast loading and immersive haptic feedback.', specs: { cpu: 'Custom 8-core AMD', ram: '16GB GDDR6', storage: '825GB SSD', gpu: 'RDNA 2 GPU', fps: 'Up to 120fps' }, image: '🎮' },
  { id: 10, name: 'RTX 4090 GPU', price: 1999, category: 'Gaming', rating: 4.8, reviews: 423, desc: 'Ultimate gaming graphics card for 4K and high refresh rate gaming.', specs: { memory: '24GB GDDR6X', cuda: '16384 cores', power: '575W', raytracing: 'Yes', dlss: '3.0' }, image: '🎮' },
  { id: 11, name: 'Google Pixel 8 Pro', price: 999, category: 'Smartphones', rating: 4.7, reviews: 256, desc: 'AI-powered smartphone with the Tensor G3 chip and a fantastic computational camera.', specs: { cpu: 'Tensor G3', ram: '12GB', storage: '128GB/256GB', display: '6.7" OLED', camera: '50MP + 48MP + 48MP' }, image: '📱' },
  { id: 12, name: 'Lenovo ThinkPad X1', price: 1299, category: 'Laptops', rating: 4.6, reviews: 198, desc: 'Business laptop excellence known for its durability and comfortable keyboard.', specs: { cpu: 'Intel Core i7', ram: '16GB DDR5', storage: '512GB SSD', display: '14" FHD', battery: '15+ hours' }, image: '💻' }
];

export const blogs = [
  { id: 1, title: 'iPhone 15 Pro Review: Best Camera Yet', date: 'Nov 15, 2024', comments: 45, excerpt: 'Deep dive into the new A17 Pro chip and camera capabilities' },
  { id: 2, title: 'Best Gaming Laptops 2024', date: 'Nov 10, 2024', comments: 38, excerpt: 'Top 5 gaming laptops with RTX 4090 performance' },
  { id: 3, title: 'AI Integration in Modern Gadgets', date: 'Nov 8, 2024', comments: 62, excerpt: 'How AI is revolutionizing consumer electronics' },
  { id: 4, title: 'Wireless Audio Tech Guide', date: 'Nov 5, 2024', comments: 29, excerpt: 'Understanding codec quality and latency' },
  { id: 5, title: 'Wearable Tech Fitness Comparison', date: 'Nov 1, 2024', comments: 35, excerpt: 'Apple Watch vs Fitbit vs Garmin analysis' },
  { id: 6, title: '5G vs WiFi 6: What You Need to Know', date: 'Oct 28, 2024', comments: 51, excerpt: 'Speed, coverage, and practical differences explained' }
];
