import React, { Fragment, PropsWithChildren } from 'react';
import { useLayer } from '../hooks';
import { LayerComponent } from '@lidojs/editor';
import { BoxSize, Delta, RootContent, RootContentProps } from '@lidojs/core';

export interface RootLayerProps extends Omit<RootContentProps, 'image'> {
    image?: {
        url: string;
        thumb: string;
        position: Delta;
        rotate: number;
        boxSize: BoxSize;
        transparency: number;
    } | null;
}
const RootLayer: LayerComponent<PropsWithChildren<RootLayerProps>> = ({
    boxSize,
    children,
    color,
    gradientBackground,
    image,
    video,
    position,
    rotate,
    scale,
}) => {
    const { actions } = useLayer();
    return (
        <Fragment>
            <RootContent
                boxSize={boxSize}
                position={position}
                rotate={rotate}
                gradientBackground={gradientBackground}
                color={color}
                image={image}
                video={video}
                scale={scale}
                onDoubleClick={() =>
                    (image || video) && actions.openImageEditor({ boxSize, position, rotate, image, video })
                }
            />
            {children}
        </Fragment>
    );
};

RootLayer.info = {
    name: 'Main',
    type: 'Root',
};
export default RootLayer;
