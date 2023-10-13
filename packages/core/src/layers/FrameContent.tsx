import React, { FC } from 'react';
import { getTransformStyle } from './common';
import { BoxSize, Delta, GradientStyle, LayerComponentProps } from '../types';
import { getGradientBackground } from './background';

export interface FrameContentProps extends LayerComponentProps {
    clipPath: string;
    scale: number;
    color: string | null;
    gradientBackground: {
        colors: string[];
        style: GradientStyle;
    } | null;
    image: {
        url: string;
        position: Delta;
        rotate: number;
        boxSize: BoxSize;
    } | null;
}
export const FrameContent: FC<FrameContentProps> = ({ clipPath, image, color, gradientBackground }) => {
    return (
        <div
            css={{
                width: '100%',
                height: '100%',
                clipPath,
                background: gradientBackground
                    ? getGradientBackground(gradientBackground.colors, gradientBackground.style)
                    : color ?? undefined,
            }}
        >
            {image && (
                <div
                    css={{
                        width: image.boxSize.width,
                        height: image.boxSize.height,
                        transform: getTransformStyle({ position: image.position, rotate: image.rotate }),
                        position: 'relative',
                        userSelect: 'none',
                    }}
                >
                    <img
                        src={image.url}
                        css={{
                            objectFit: 'fill',
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            pointerEvents: 'none',
                        }}
                    />
                </div>
            )}
        </div>
    );
};
