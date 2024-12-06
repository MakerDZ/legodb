'use client';

import React, { PropsWithChildren, useState } from 'react';
import clsx from 'clsx';

interface BounceWrapperProps {
    className?: string;
}

const BounceWrapper: React.FC<PropsWithChildren<BounceWrapperProps>> = ({
    children,
    className,
}) => {
    const [isBouncing, setIsBouncing] = useState(false);

    const handleClick = () => {
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 600);
    };

    return (
        <div
            className={clsx(className, { 'animate-smooth-bounce': isBouncing })}
            onClick={handleClick}
        >
            {children}
        </div>
    );
};

export default BounceWrapper;
