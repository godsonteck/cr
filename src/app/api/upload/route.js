import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return Response.json({ error: 'Only JPEG, PNG, and WebP images are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'Image must be smaller than 5MB.' }, { status: 400 });
    }

    // Generate a clean filename
    const ext = file.name.split('.').pop().toLowerCase();
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')                // remove extension
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')             // clean characters
      .replace(/(^-|-$)/g, '')                 // trim dashes
      .slice(0, 40);                            // max 40 chars

    const fileName = `${safeName}-${timestamp}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');

    // Make sure the upload folder exists
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(uploadDir, fileName), buffer);

    const publicPath = `/images/products/${fileName}`;

    return Response.json({ success: true, path: publicPath });
  } catch (err) {
    console.error('[Upload API] Error:', err);
    return Response.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
