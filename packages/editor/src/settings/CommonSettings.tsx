import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useSelectedLayers, useEditor } from '../hooks';
import LayerSidebar from './sidebar/LayerSidebar';
import SettingButton from './SettingButton';
import TransparencyIcon from '@duyank/icons/external/Transparency';
import LockKeyIcon from '@duyank/icons/regular/LockKey';
import LockKeyOpenIcon from '@duyank/icons/regular/LockKeyOpen';
import Slider from '../common/slider/Slider';
import Popover from '../common/popover/Popover';
import { isRootLayer } from '../ultils/layer/layers';
import { RootLayerProps } from '../layers/RootLayer';

const CommonSettings = () => {
    const transparencyButtonRef = useRef<HTMLDivElement>(null);
    const resizeButtonRef = useRef<HTMLDivElement>(null);
    const widthRef = useRef<HTMLInputElement>(null);
    const heightRef = useRef<HTMLInputElement>(null);
    const [openTransparencySetting, setOpenTransparencySetting] = useState(false);
    const [openResizeSetting, setOpenResizeSetting] = useState(false);
    const [lockSiteAspect, setLockSizeAspect] = useState(false);
    const { selectedLayers, selectedLayerIds } = useSelectedLayers();
    const { actions, activePage, sidebar, pageSize, isPageLocked } = useEditor((state) => ({
        activePage: state.activePage,
        sidebar: state.sidebar,
        pageSize: state.pageSize,
        isPageLocked: state.pages[state.activePage] && state.pages[state.activePage].layers.ROOT.data.locked,
    }));
    const [size, setSize] = useState(pageSize);
    useEffect(() => {
        setSize(pageSize);
    }, [pageSize]);
    const { transparency } = useMemo(() => {
        return Object.entries(selectedLayers).reduce(
            (acc, [, layer]) => {
                if (isRootLayer(layer)) {
                    acc.transparency = Math.max(
                        acc.transparency,
                        typeof layer.data.props.image?.transparency !== 'undefined'
                            ? layer.data.props.image.transparency
                            : 1,
                    );
                } else {
                    acc.transparency = Math.max(
                        acc.transparency,
                        typeof layer.data.props.transparency !== 'undefined' ? layer.data.props.transparency : 1,
                    );
                }
                return acc;
            },
            { transparency: 0 },
        );
    }, [selectedLayers]);
    const isLocked = !!selectedLayers.find((l) => l.data.locked);
    const toggleLock = () => {
        if (isLocked) {
            actions.unlock(activePage, selectedLayerIds);
        } else {
            actions.lock(activePage, selectedLayerIds);
        }
    };
    const updateTransparency = (transparency: number) => {
        selectedLayerIds.forEach((layerId) => {
            if (layerId === 'ROOT') {
                actions.history.throttle(2000).setProp<RootLayerProps>(activePage, layerId, {
                    image: {
                        transparency: transparency / 100,
                    },
                });
            } else {
                actions.history.throttle(2000).setProp(activePage, layerId, {
                    transparency: transparency / 100,
                });
            }
        });
    };
    useEffect(() => {
        setOpenTransparencySetting(false);
    }, [JSON.stringify(selectedLayerIds)]);

    const handleChangeSize = (value: string, type: 'width' | 'height') => {
        const ratio = size.width / size.height;
        const v = parseInt(value, 10);
        if (type === 'width') {
            if (lockSiteAspect) {
                (heightRef.current as HTMLInputElement).value = String(Math.round((v / ratio) * 10) / 10);
            }
            setSize({ ...size, width: v });
        }
        if (type === 'height') {
            if (lockSiteAspect) {
                (widthRef.current as HTMLInputElement).value = String(Math.round(v * ratio * 10) / 10);
            }
            setSize({ ...size, height: v });
        }
    };

    const isDisabledResize = useMemo(() => size.width < 100 || size.height < 100, [size]);

    const handleResize = () => {
        if (isDisabledResize) return;
        actions.changePageSize(size);
        setOpenResizeSetting(false);
    };
    return (
        <Fragment>
            <div
                css={{
                    display: 'grid',
                    alignItems: 'center',
                    gridAutoFlow: 'column',
                    gridGap: 8,
                }}
            >
                <SettingButton onClick={() => actions.setSidebar('LAYER_MANAGEMENT')}>
                    <span css={{ padding: '0 4px' }}>Position</span>
                </SettingButton>

                {selectedLayerIds.length > 0 && !isLocked && !isPageLocked && (
                    <Fragment>
                        {(!isRootLayer(selectedLayers[0]) ||
                            (isRootLayer(selectedLayers[0]) && selectedLayers[0].data.props.image)) && (
                            <Fragment>
                                <div css={{ height: 24, width: `1px`, background: 'rgba(57,76,96,.15)' }} />
                                <SettingButton
                                    ref={transparencyButtonRef}
                                    css={{ fontSize: 20 }}
                                    onClick={() => setOpenTransparencySetting(true)}
                                >
                                    <TransparencyIcon />
                                </SettingButton>
                                <Popover
                                    open={openTransparencySetting}
                                    anchorEl={transparencyButtonRef.current}
                                    placement={'bottom-end'}
                                    onClose={() => setOpenTransparencySetting(false)}
                                    offsets={{
                                        'bottom-end': { x: 0, y: 8 },
                                    }}
                                >
                                    <div css={{ padding: 16 }}>
                                        <Slider
                                            label={'Transparency'}
                                            defaultValue={transparency * 100}
                                            onChange={updateTransparency}
                                        />
                                    </div>
                                </Popover>
                            </Fragment>
                        )}
                    </Fragment>
                )}
                {!isPageLocked && (
                    <Fragment>
                        <div css={{ height: 24, width: `1px`, background: 'rgba(57,76,96,.15)' }} />
                        <SettingButton ref={resizeButtonRef} onClick={() => setOpenResizeSetting(true)}>
                            <span css={{ padding: '0 4px' }}>Resize</span>
                        </SettingButton>
                    </Fragment>
                )}
                <Popover
                    open={openResizeSetting}
                    anchorEl={resizeButtonRef.current}
                    placement={'bottom-end'}
                    onClose={() => setOpenResizeSetting(false)}
                    offsets={{
                        'bottom-end': { x: 0, y: 8 },
                    }}
                >
                    <div css={{ padding: 16, width: 240 }}>
                        <div css={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                            <div>
                                <div css={{ fontSize: 12, fontWeight: 600 }}>Width</div>
                                <div
                                    css={{
                                        border: '1px solid rgba(43,59,74,.3)',
                                        height: 40,
                                        padding: '0 12px',
                                        width: 80,
                                        borderRadius: 4,
                                    }}
                                >
                                    <input
                                        ref={widthRef}
                                        css={{ width: '100%', minWidth: 8, height: '100%' }}
                                        onChange={(e) => handleChangeSize(e.target.value, 'width')}
                                        defaultValue={size.width}
                                    />
                                </div>
                            </div>
                            <div>
                                <div css={{ fontSize: 12, fontWeight: 600 }}>Height</div>
                                <div
                                    css={{
                                        border: '1px solid rgba(43,59,74,.3)',
                                        height: 40,
                                        padding: '0 12px',
                                        width: 80,
                                        borderRadius: 4,
                                    }}
                                >
                                    <input
                                        ref={heightRef}
                                        css={{ width: '100%', minWidth: 8, height: '100%' }}
                                        onChange={(e) => handleChangeSize(e.target.value, 'height')}
                                        defaultValue={size.height}
                                    />
                                </div>
                            </div>
                            <div
                                css={{ fontSize: 20, cursor: 'pointer', margin: '10px 0' }}
                                onClick={() => setLockSizeAspect(!lockSiteAspect)}
                            >
                                {lockSiteAspect ? <LockKeyIcon /> : <LockKeyOpenIcon />}
                            </div>
                        </div>
                        {isDisabledResize && (
                            <div css={{ color: '#db1436' }}>
                                Dimensions must be at least 100px and no more than 8000px.
                            </div>
                        )}
                        <div css={{ marginTop: 12 }}>
                            <div
                                css={{
                                    background: !isDisabledResize ? '#3a3a4c' : '#8383A2',
                                    padding: '8px 14px',
                                    lineHeight: 1,
                                    color: '#FFF',
                                    borderRadius: 4,
                                    cursor: !isDisabledResize ? 'pointer' : 'not-allowed',
                                    fontSize: 16,
                                    textAlign: 'center',
                                    fontWeight: 700,
                                }}
                                onClick={handleResize}
                            >
                                Resize
                            </div>
                        </div>
                    </div>
                </Popover>
                {selectedLayerIds.length > 0 && (
                    <SettingButton css={{ fontSize: 20 }} isActive={isLocked} onClick={toggleLock}>
                        {isLocked && <LockKeyIcon />}
                        {!isLocked && <LockKeyOpenIcon />}
                    </SettingButton>
                )}
            </div>
            {sidebar === 'LAYER_MANAGEMENT' && <LayerSidebar open={true} />}
        </Fragment>
    );
};

export default CommonSettings;
