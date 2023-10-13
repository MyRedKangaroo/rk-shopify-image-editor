import Slider from '../common/slider/Slider';
import React, { useRef, useState } from 'react';
import { useEditor } from '../hooks';
import SettingButton from './SettingButton';
import Popover from '../common/popover/Popover';
import CheckIcon from '@duyank/icons/regular/Check';

const PageControl = () => {
    const labelScaleOptionRef = useRef<HTMLDivElement>(null);
    const [openScaleOptions, setOpenScaleOptions] = useState(false);
    const { actions, activePage, totalPages, scale } = useEditor((state) => ({
        activePage: state.activePage,
        totalPages: state.pages.length,
        scale: state.scale,
    }));

    const handleChangeScale = (value: number) => {
        actions.setScale(value / 100);
    };
    return (
        <div css={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 700 }}>
            {/* <div css={{ flexGrow: 1 }}>
                Page {activePage + 1} / {totalPages}
            </div> */}
            <div
                css={{ flexShrink: 0, display: 'grid', gridAutoFlow: 'column', gridColumnGap: 8, alignItems: 'center' }}
            >
                <div css={{ width: 200, paddingRight: 8 }}>
                    <Slider
                        hideInput={true}
                        hideLabel={true}
                        value={scale * 100}
                        min={10}
                        max={500}
                        onChange={handleChangeScale}
                    />
                </div>
                <SettingButton ref={labelScaleOptionRef} onClick={() => setOpenScaleOptions(true)}>
                    <div css={{ width: 48, textAlign: 'center' }}>{Math.round(scale * 100)}%</div>
                </SettingButton>
                <Popover
                    open={openScaleOptions}
                    anchorEl={labelScaleOptionRef.current}
                    placement={'top-end'}
                    onClose={() => setOpenScaleOptions(false)}
                >
                    <div css={{ padding: '8px 0' }}>
                        {[300, 200, 150, 100, 75, 50, 25, 10].map((s) => (
                            <div
                                key={s}
                                css={{
                                    padding: '0 8px',
                                    display: 'flex',
                                    height: 40,
                                    minWidth: 100,
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    ':hover': {
                                        backgroundColor: 'rgba(64,87,109,.07)',
                                    },
                                }}
                                onClick={() => {
                                    actions.setScale(s / 100);
                                    setOpenScaleOptions(false);
                                }}
                            >
                                <span css={{ padding: '0 8px', whiteSpace: 'nowrap', flexGrow: 1 }}>{s}%</span>
                                {s / 100 === scale && <CheckIcon />}
                            </div>
                        ))}
                    </div>
                </Popover>
            </div>
        </div>
    );
};

export default PageControl;
