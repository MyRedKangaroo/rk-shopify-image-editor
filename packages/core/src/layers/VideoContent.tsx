import React, { FC } from 'react';
import { BoxSize, Delta, LayerComponentProps } from '../types';
import { getTransformStyle } from '@lidojs/core';

export interface VideoContentProps extends LayerComponentProps {
    video: {
        url: string;
        position: Delta;
        rotate: number;
        boxSize: BoxSize;
        transparency?: number;
        autoPlay?: boolean;
    };
}
export const VideoContent: FC<VideoContentProps> = ({ video, boxSize }) => {
    return (
        <div
            css={{
                overflow: 'hidden',
                pointerEvents: 'auto',
                width: boxSize.width,
                height: boxSize.height,
            }}
        >
            <div
                css={{
                    width: video.boxSize.width,
                    height: video.boxSize.height,
                    transform: getTransformStyle({ position: video.position, rotate: video.rotate }),
                    position: 'relative',
                    userSelect: 'none',
                    opacity: video.transparency,
                }}
            >
                <video
                    css={{ objectFit: 'fill', width: '100%', height: '100%' }}
                    crossOrigin="anonymous"
                    autoPlay={video.autoPlay}
                    muted={true}
                    src={video.url}
                />
            </div>
        </div>
    );
};
