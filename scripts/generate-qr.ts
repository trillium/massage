import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QR_API = "https://api.qrcode-monkey.com//qr/custom";
const OUTPUT_DIR = path.join(__dirname, "../generated/qrcodes");

const colors = {
  teal: "#2dd4bf",
  slate: "#1f1f1f",
  golden: "#ffbd4a",
  white: "#fff",
};

type ColorPreset = keyof typeof colors;

interface QRConfig {
  bodyColor: string;
  bgColor: string;
  eyeBall1Color: string;
  eyeBall2Color: string;
  eyeBall3Color: string;
  eye1Color: string;
  eye2Color: string;
  eye3Color: string;
  body: string;
  eye: string;
  eyeBall: string;
  erf1: string[];
  erf2: string[];
  erf3: string[];
  brf1: string[];
  brf2: string[];
  brf3: string[];
}

const defaultConfig: QRConfig = {
  bodyColor: colors.teal,
  bgColor: colors.slate,
  eye1Color: colors.teal,
  eye2Color: colors.teal,
  eye3Color: colors.teal,
  eyeBall1Color: colors.golden,
  eyeBall2Color: colors.golden,
  eyeBall3Color: colors.golden,
  body: "round",
  eye: "frame2",
  eyeBall: "ball2",
  erf1: [],
  erf2: [],
  erf3: [],
  brf1: [],
  brf2: [],
  brf3: [],
};

interface QRPayload {
  erf1?: string[];
  erf2?: string[];
  erf3?: string[];
  brf1?: string[];
  brf2?: string[];
  brf3?: string[];
}

async function generateQRCode(
  url: string,
  filename: string,
  preset: ColorPreset = "teal"
): Promise<void> {
  const config = { ...defaultConfig };

  const bgColor = preset === "teal" ? colors.slate : colors.white;
  const fgColor = colors[preset];

  config.bodyColor = fgColor;
  config.bgColor = bgColor;
  config.eye1Color = fgColor;
  config.eye2Color = fgColor;
  config.eye3Color = fgColor;
  config.eyeBall1Color = preset === "teal" ? colors.golden : fgColor;
  config.eyeBall2Color = preset === "teal" ? colors.golden : fgColor;
  config.eyeBall3Color = preset === "teal" ? colors.golden : fgColor;

  const payload = {
    data: url,
    config,
    size: 2000,
    download: "imageUrl",
    file: "png",
  };

  try {
    console.log(`📱 Generating QR code for: ${url}`);
    console.log(`🎨 Color preset: ${preset}`);

    const response = await fetch(QR_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = (await response.json()) as { imageUrl: string };

    if (!data.imageUrl) {
      throw new Error("No imageUrl in response");
    }

    const imageUrl = data.imageUrl.startsWith("http")
      ? data.imageUrl
      : `https:${data.imageUrl}`;

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Image download failed: ${imageResponse.status}`);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const filepath = path.join(OUTPUT_DIR, filename);
    const buffer = await imageResponse.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));

    console.log(`✅ Saved to: ${filepath}`);
  } catch (error) {
    console.error("❌ Error generating QR code:", error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Usage: pnpm tsx scripts/generate-qr.ts <url> <filename> [preset]

Arguments:
  url       - URL to encode in QR code (e.g., https://example.com)
  filename  - Output filename (e.g., qr-code.png)
  preset    - Color preset: teal (default), slate, golden, white

Examples:
  pnpm tsx scripts/generate-qr.ts https://booking.example.com qr-booking.png
  pnpm tsx scripts/generate-qr.ts https://booking.example.com qr-booking-golden.png golden
`);
    process.exit(1);
  }

  const url = args[0];
  const filename = args[1];
  const preset = (args[2] as ColorPreset) || "teal";

  if (!Object.keys(colors).includes(preset)) {
    console.error(`❌ Unknown preset: ${preset}`);
    console.error(`Available: ${Object.keys(colors).join(", ")}`);
    process.exit(1);
  }

  await generateQRCode(url, filename, preset);
}

main();
