import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert to base64 for ImgBB
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'IMGBB_API_KEY not configured' },
        { status: 500 }
      );
    }

    const imgbbForm = new FormData();
    imgbbForm.append('key', apiKey);
    imgbbForm.append('image', base64);

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbForm,
    });

    const result = await res.json();

    if (!result.success) {
      console.error('ImgBB error:', result);
      return Response.json({ error: 'Error uploading image' }, { status: 500 });
    }

    return Response.json({ url: result.data.url });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Error uploading image' }, { status: 500 });
  }
}
