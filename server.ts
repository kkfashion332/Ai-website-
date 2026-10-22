import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Gemini 3.8 Flash AI Product Analyzer
app.post('/api/analyze-product', async (req: Request, res: Response) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64' });
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json(generateHeuristicProductData());
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const promptText = `Analyze this clothing product image. Return ONLY valid JSON: 'title' (SEO friendly fashion title), 'mrp' (realistic Indian integer price in INR, e.g. 1499), 'sellingPrice' (discounted integer price in INR, e.g. 599), 'sizes' (e.g. 'S, M, L' or 'Free Size'), 'shopName' (default: 'WOW COLLECTION'), 'category' (e.g. 'Polo T-Shirts', 'Men\\'s Polo', 'Kurtas', 'Saree Fest', 'Denim', 'Western', 'Accessories'), 'description' (a brief 1-2 sentence premium product highlight). No markdown, no triple backticks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ parts: [{ inlineData: { data: cleanBase64, mimeType } }, { text: promptText }] }],
      config: {
        systemInstruction: "You are an expert Indian fashion cataloguer for Myntra. Analyze clothing images and return JSON without markdown.",
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || '';
    let parsedData: any = {};

    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch {
      parsedData = generateHeuristicProductData();
    }

    const mrp = Number(parsedData.mrp) || 1299;
    const sellingPrice = Number(parsedData.sellingPrice) || Math.round(mrp * 0.45);
    const discountPercent = Math.max(5, Math.round(((mrp - sellingPrice) / mrp) * 100));

    res.json({
      title: parsedData.title || 'Exclusive Designer Fashion Apparel',
      mrp,
      sellingPrice,
      discountPercent,
      sizes: parsedData.sizes || 'S, M, L, XL',
      shopName: parsedData.shopName || 'WOW COLLECTION',
      category: parsedData.category || 'Trending',
      description: parsedData.description || 'Premium craftsmanship featuring durable weave and modern comfort silhouette.',
    });
  } catch (error) {
    res.json(generateHeuristicProductData());
  }
});

function generateHeuristicProductData() {
  const styles = [
    { title: "Slim Fit Pique Contrast Polo T-Shirt", category: "Men's Polo", mrp: 1499, sellingPrice: 599, sizes: "S, M, L, XL" },
    { title: "Woven Silk Embroidered Festive Kurta", category: "Festive Wear", mrp: 2799, sellingPrice: 999, sizes: "M, L, XL, XXL" },
    { title: "Distressed Mid-Rise Straight Fit Jeans", category: "Denim", mrp: 2299, sellingPrice: 849, sizes: "30, 32, 34, 36" },
    { title: "Traditional Jacquard Woven Art Silk Saree", category: "Saree Fest", mrp: 3499, sellingPrice: 1299, sizes: "Free Size" },
  ];
  const chosen = styles[Math.floor(Math.random() * styles.length)];
  return {
    ...chosen,
    discountPercent: Math.round(((chosen.mrp - chosen.sellingPrice) / chosen.mrp) * 100),
    shopName: "WOW COLLECTION",
    description: "Tailored with precision from selected breathable textiles for signature elegance.",
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
