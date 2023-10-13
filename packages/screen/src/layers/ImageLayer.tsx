import React from 'react';
import { BoxSize, Delta, ImageContent, ImageContentProps } from '@lidojs/core';
import { LayerComponent } from '@lidojs/editor';

export interface ImageLayerProps extends ImageContentProps {
    image: {
        url: string;
        thumb: string;
        position: Delta;
        rotate: number;
        boxSize: BoxSize;
        transparency?: number;
    };
}

const ImageLayer: LayerComponent<ImageLayerProps> = ({ image, boxSize, position, rotate }) => {
    return <ImageContent image={image} boxSize={boxSize} rotate={rotate} position={position} />;
};

ImageLayer.info = {
    name: 'Image',
    type: 'Image',
};
export default ImageLayer;
