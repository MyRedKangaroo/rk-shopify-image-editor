import React from 'react';
import { ShapeContent, ShapeContentProps } from '@lidojs/core';
import { LayerComponent } from '@lidojs/editor';

export type ShapeLayerProps = ShapeContentProps;
const ShapeLayer: LayerComponent<ShapeLayerProps> = ({
    boxSize,
    shape,
    color,
    gradientBackground,
    roundedCorners = 0,
    scale = 1,
    rotate,
    position,
    border,
}) => {
    return (
        <div
            css={{
                transformOrigin: '0 0',
            }}
            style={{
                width: boxSize.width / (scale || 1),
                height: boxSize.height / (scale || 1),
                transform: `scale(${scale || 1})`,
            }}
        >
            <ShapeContent
                shape={shape}
                color={color}
                roundedCorners={roundedCorners}
                gradientBackground={gradientBackground}
                boxSize={boxSize}
                rotate={rotate}
                scale={scale}
                position={position}
                border={border}
            />
        </div>
    );
};

ShapeLayer.info = {
    name: 'Shape',
    type: 'Shape',
};
export default ShapeLayer;
