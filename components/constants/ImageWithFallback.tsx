"use client";
import React, { useState, useEffect, HTMLProps } from 'react';

interface ImageWithFallbackProps extends HTMLProps<HTMLImageElement> {
    src: string;
    fallbackSrc: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, fallbackSrc, ...rest }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasErrored, setHasErrored] = useState(false);

    // Update imgSrc when src prop changes
    useEffect(() => {
        setImgSrc(src);
        setHasErrored(false);
    }, [src]);

    const handleError = () => {
        if (!hasErrored && imgSrc !== fallbackSrc) {
            setHasErrored(true);
            setImgSrc(fallbackSrc);
        }
    };

    return (
        <img
            {...rest}
            loading='lazy'
            src={imgSrc}
            onError={handleError}
        />
    );
};

export default ImageWithFallback;