import React, { forwardRef, ForwardRefRenderFunction, PropsWithChildren } from 'react';
import { BoxSize, Delta, getTransformStyle } from '@lidojs/core';

interface TransformLayerProps {
    boxSize: BoxSize;
    rotate: number;
    position: Delta;
    transparency?: number;
}
const TransformLayer: ForwardRefRenderFunction<HTMLDivElement, PropsWithChildren<TransformLayerProps>> = (
    { boxSize, rotate, position, transparency, children },
    ref,
) => {
    return (
        <div
            ref={ref}
            css={{
                touchAction: 'pan-x pan-y pinch-zoom',
                pointerEvents: 'auto',
                position: 'absolute',
            }}
            style={{
                width: boxSize.width,
                height: boxSize.height,
                transform: getTransformStyle({ position, rotate }),
                opacity: transparency,
            }}
        >
            {children}
        </div>
    );
};

export default forwardRef<HTMLDivElement, PropsWithChildren<TransformLayerProps>>(TransformLayer);
