import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { NextResponse } from 'next/server';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const runtime = 'edge';

export async function POST(request: Request) {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
        return new NextResponse('Invalid or missing content-type header.', {
            status: 400,
        });
    }

    const filename = request.headers.get('x-vercel-filename') || 'file.txt';
    const fileType = `.${contentType.split('/')[1]}`;
    const timestamp = Date.now();
    const finalName = filename.includes(fileType)
        ? `${filename}-${timestamp}`
        : `${filename}-${timestamp}${fileType}`;

    try {
        const blob = await request.blob();
        const storageRef = ref(storage, finalName);
        await uploadBytes(storageRef, blob, { contentType });
        const downloadURL = await getDownloadURL(storageRef);

        return new NextResponse(JSON.stringify({ downloadURL }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return new NextResponse(`Error: ${error}`, {
            status: 500,
        });
    }
}
