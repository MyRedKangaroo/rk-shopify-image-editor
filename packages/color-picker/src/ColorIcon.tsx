import React, { forwardRef, ForwardRefRenderFunction, HTMLProps, PropsWithChildren } from 'react';
import { Color } from '@lidojs/utils';

interface ColorIconProps extends Omit<HTMLProps<HTMLDivElement>, 'selected'> {
    color: string;
    selected: string | null;
}
const ColorIcon: ForwardRefRenderFunction<HTMLDivElement, PropsWithChildren<ColorIconProps>> = (
    { color, selected, children, ...props },
    ref,
) => {
    return (
        <div
            ref={ref}
            css={{ paddingBottom: '100%', position: 'relative', width: '100%', cursor: 'pointer' }}
            {...props}
        >
            <div
                css={{
                    backgroundColor: '#fff',
                    backgroundPosition: '0 0, 6px 6px',
                    backgroundSize: '12px 12px',
                    inset: 0,
                    position: 'absolute',
                    backgroundImage:
                        'linear-gradient(-45deg,rgba(57,76,96,.15) 25%,transparent 25%,transparent 75%,rgba(57,76,96,.15) 75%),linear-gradient(-45deg,rgba(57,76,96,.15) 25%,transparent 25%,transparent 75%,rgba(57,76,96,.15) 75%)',
                }}
            >
                <div
                    css={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: color,
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        boxShadow: 'inset 0 0 0 1px rgba(57,76,96,.15)',
                    }}
                />
                <div
                    css={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 4,
                        boxShadow:
                            selected && new Color(selected).toRgbString() === new Color(color).toRgbString()
                                ? `0 0 0 1px #3d8eff,inset 0 0 0 2px #009ef7,inset 0 0 0 4px #fff`
                                : undefined,
                    }}
                />
            </div>
            {children}
        </div>
    );
};

export default forwardRef<HTMLDivElement, ColorIconProps>(ColorIcon);
