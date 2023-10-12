import React, { PropsWithChildren } from 'react';
import { LayerComponentProps } from '@lidojs/core';
import { LayerComponent } from '@lidojs/editor';

export interface GroupLayerProps extends LayerComponentProps {
    scale: number;
}

const GroupLayer: LayerComponent<PropsWithChildren<GroupLayerProps>> = ({ boxSize, scale, children }) => {
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
            {children}
        </div>
    );
};

GroupLayer.info = {
    name: 'Group',
    type: 'Group',
};

export default GroupLayer;
