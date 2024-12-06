'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const CollectionPage = ({ params }: { params: { collection: string } }) => {
    const router = useRouter();

    useEffect(() => {
        router.push(`/dashboard/${params.collection}/dashboard`);
    }, [router]);

    return null;
};

export default CollectionPage;
