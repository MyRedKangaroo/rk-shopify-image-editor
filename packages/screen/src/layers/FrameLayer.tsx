import React, { FC } from 'react';
import { BoxSize, Delta, FrameContent, FrameContentProps } from '@lidojs/core';

export interface FrameLayerProps extends FrameContentProps {
    image: {
        url: string;
        thumb: string;
        position: Delta;
        rotate: number;
        boxSize: BoxSize;
    } | null;
}
const FrameLayer: FC<FrameLayerProps> = ({
    clipPath,
    image,
    color,
    gradientBackground,
    boxSize,
    position,
    rotate,
    scale,
}) => {
    return (
        <div
            css={{
                transformOrigin: '0 0',
            }}
            style={{
                width: boxSize.width / scale,
                height: boxSize.height / scale,
                transform: `scale(${scale})`,
            }}
        >
            <FrameContent
                clipPath={clipPath}
                scale={scale}
                color={color}
                gradientBackground={gradientBackground}
                image={image}
                boxSize={boxSize}
                rotate={rotate}
                position={position}
            />
        </div>
    );
};

export default FrameLayer;
