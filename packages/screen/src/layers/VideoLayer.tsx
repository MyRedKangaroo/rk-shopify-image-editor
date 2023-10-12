import React from 'react';
import { BoxSize, Delta, VideoContent, VideoContentProps } from '@lidojs/core';
import { LayerComponent } from '@lidojs/editor';

export interface VideoLayerProps extends VideoContentProps {
    video: {
        url: string;
        position: Delta;
        rotate: number;
        boxSize: BoxSize;
        transparency?: number;
    };
}

const VideoLayer: LayerComponent<VideoLayerProps> = ({ video, boxSize, position, rotate }) => {
    return <VideoContent video={{ ...video, autoPlay: true }} boxSize={boxSize} rotate={rotate} position={position} />;
};

VideoLayer.info = {
    name: 'Video',
    type: 'Video',
};
export default VideoLayer;
