import React, { FC, Fragment, PropsWithChildren } from 'react';
import { RootContent, RootContentProps } from '@lidojs/core';

export type RootLayerProps = RootContentProps;

const RootLayer: FC<PropsWithChildren<RootLayerProps>> = ({
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
    return (
        <Fragment>
            <RootContent
                boxSize={boxSize}
                position={position}
                rotate={rotate}
                gradientBackground={gradientBackground}
                color={color}
                image={image}
                video={video ? { ...video, autoPlay: true } : undefined}
                scale={scale}
            />
            {children}
        </Fragment>
    );
};

export default RootLayer;
