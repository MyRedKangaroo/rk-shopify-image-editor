import React from 'react';
import { LayerComponent } from '@lidojs/editor';
import { SvgContent, SvgContentProps } from '@lidojs/core';

export type SvgLayerProps = SvgContentProps;
const SvgLayer: LayerComponent<SvgLayerProps> = ({ boxSize, ...props }) => {
    return (
        <div
            css={{
                transformOrigin: '0 0',
            }}
            style={{
                width: boxSize.width,
                height: boxSize.height,
            }}
        >
            <SvgContent boxSize={boxSize} {...props} />
        </div>
    );
};

SvgLayer.info = {
    name: 'Svg',
    type: 'Svg',
};
export default SvgLayer;
