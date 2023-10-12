import React, { FC } from 'react';
import { TextContent, TextContentProps } from '@lidojs/core';

export type TextLayerProps = TextContentProps;

const TextLayer: FC<TextLayerProps> = ({
    text,
    boxSize,
    scale,
    fonts,
    colors,
    fontSizes,
    effect,
    rotate,
    position,
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
            <TextContent
                text={text}
                scale={scale}
                fonts={fonts}
                colors={colors}
                fontSizes={fontSizes}
                effect={effect}
                boxSize={boxSize}
                rotate={rotate}
                position={position}
            />
        </div>
    );
};

export default TextLayer;
