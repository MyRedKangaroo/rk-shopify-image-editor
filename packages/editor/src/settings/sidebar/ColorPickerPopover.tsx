import Popover from '../../common/popover/Popover';
import React, { FC, Fragment, PropsWithChildren, useRef, useState } from 'react';
import { ColorPicker } from '@lidojs/color-picker';
import { Color } from '@lidojs/utils';

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    event: 'click' | 'doubleClick';
}

const ColorPickerPopover: FC<PropsWithChildren<ColorPickerProps>> = ({ color, event, onChange, children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [openColorPicker, setOpenColorPicker] = useState(false);

    return (
        <Fragment>
            <div
                ref={containerRef}
                css={{ cursor: 'pointer' }}
                onClick={() => event === 'click' && setOpenColorPicker(true)}
                onDoubleClick={() => event === 'doubleClick' && setOpenColorPicker(true)}
            >
                {children}
            </div>
            <Popover
                open={openColorPicker}
                anchorEl={containerRef.current}
                placement={'bottom'}
                offsets={{ bottom: { y: 8, x: 0 } }}
                onClose={() => setOpenColorPicker(false)}
            >
                <div css={{ padding: 16, width: 280 }}>
                    <ColorPicker color={new Color(color).toHex()} onChange={onChange} />
                </div>
            </Popover>
        </Fragment>
    );
};

export default ColorPickerPopover;
