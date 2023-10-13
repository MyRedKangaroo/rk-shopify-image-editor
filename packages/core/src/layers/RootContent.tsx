import React, { FC, HTMLProps } from 'react';
import { LayerComponentProps } from '../types';
import { getGradientBackground, GradientStyle, ImageContent, ImageContentProps } from '@lidojs/core';
import { VideoContent, VideoContentProps } from './VideoContent';

export interface RootContentProps extends LayerComponentProps, Omit<HTMLProps<HTMLDivElement>, 'color'> {
    color: string | null;
    gradientBackground: {
        colors: string[];
        style: GradientStyle;
    } | null;
    image?: (ImageContentProps['image'] & { transparency: number }) | null;
    video?: VideoContentProps['video'] | null;
}
export const RootContent: FC<RootContentProps> = ({
    boxSize,
    color,
    gradientBackground,
    image,
    video,
    position,
    rotate,
    ...props
}) => {
    return (
        <div
            css={{
                position: 'absolute',
                overflow: 'hidden',
                pointerEvents: 'auto',
                width: boxSize.width,
                height: boxSize.height,
            }}
            {...props}
        >
            <div
                css={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: boxSize.width,
                    height: boxSize.height,
                    background: gradientBackground
                        ? getGradientBackground(gradientBackground.colors, gradientBackground.style)
                        : color || '#fff',
                }}
            />
            {image && (
                <div css={{ width: boxSize.width, height: boxSize.height }}>
                    <ImageContent image={image} boxSize={boxSize} rotate={rotate} position={position} />
                </div>
            )}
            {video && (
                <div css={{ width: boxSize.width, height: boxSize.height }}>
                    <VideoContent video={video} boxSize={boxSize} rotate={rotate} position={position} />
                </div>
            )}
        </div>
    );
};
