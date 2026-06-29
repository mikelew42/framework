// Fal0 generation script — run with: node public/framework/ext/Fal/0/gen.mjs "your prompt"
import { fal } from '@fal-ai/client';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GEN_DIR = path.join(__dirname, 'gen');

fal.config({ credentials: process.env.FAL_KEY });

const MODEL = 'xai/grok-imagine-image';

async function generate(prompt, opts = {}) {
  const input = {
    prompt,
    num_images: 1,
    aspect_ratio: opts.aspect_ratio ?? '1:1',
    resolution: opts.resolution ?? '1k',
    output_format: 'jpeg',
  };

  console.log(`Model: ${MODEL}`);
  console.log(`Prompt: ${prompt}`);
  console.log(`Cost: ~$0.02`);
  console.log('Submitting...');

  const started = Date.now();
  const result = await fal.subscribe(MODEL, { input, logs: true });
  const duration_ms = Date.now() - started;

  const image_url = result.data?.images?.[0]?.url ?? result.data?.image?.url;
  if (!image_url) throw new Error('No image URL in response: ' + JSON.stringify(result.data));

  // Download image
  const img_buf = Buffer.from(await (await fetch(image_url)).arrayBuffer());

  // Save file
  const id = crypto.randomBytes(4).toString('hex');
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const ext = input.output_format === 'jpeg' ? 'jpg' : 'png';
  const filename = `${ts}_${id}.${ext}`;
  const filepath = path.join(GEN_DIR, filename);

  await fs.mkdir(GEN_DIR, { recursive: true });
  await fs.writeFile(filepath, img_buf);

  // Sidecar metadata
  const meta = {
    model: MODEL,
    input,
    request_id: result.requestId,
    image_url,
    duration_ms,
    timestamp: new Date().toISOString(),
    filename,
  };
  await fs.writeFile(filepath.replace(/\.\w+$/, '.json'), JSON.stringify(meta, null, 2));

  console.log(`Saved: ${filepath}`);
  console.log(`Duration: ${duration_ms}ms`);
  return { filepath, meta };
}

// Run from CLI: node gen.mjs "a red apple on a white surface"
const prompt = process.argv[2] ?? 'a glowing neon spiral on a dark background, digital art';
await generate(prompt);
