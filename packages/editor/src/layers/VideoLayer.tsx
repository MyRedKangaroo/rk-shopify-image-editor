import React from 'react';
import { useEditor, useLayer, useSelectedLayers } from '../hooks';
import { VideoContent, VideoContentProps } from '@lidojs/core';
import { LayerComponent } from '@lidojs/editor';

export type VideoLayerProps = VideoContentProps;

const VideoLayer: LayerComponent<VideoLayerProps> = ({ video, boxSize, position, rotate }) => {
    const { actions, pageIndex, id } = useLayer();
    const { selectedLayerIds } = useSelectedLayers();
    const { imageEditor } = useEditor((state) => ({ imageEditor: state.imageEditor }));

    return (
        <div
            css={{
                pointerEvents: 'auto',
                visibility:
                    imageEditor && imageEditor.pageIndex === pageIndex && imageEditor.layerId === id
                        ? 'hidden'
                        : undefined,
            }}
            onDoubleClick={() =>
                selectedLayerIds.includes(id) && actions.openImageEditor({ position, rotate, boxSize, video })
            }
        >
            <VideoContent video={video} boxSize={boxSize} rotate={rotate} position={position} />
        </div>
    );
};

VideoLayer.info = {
    name: 'Video',
    type: 'Video',
};
export default VideoLayer;
