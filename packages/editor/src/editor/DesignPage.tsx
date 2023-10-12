import PageElement from '../layers/core/PageElement';
import React, { forwardRef, ForwardRefRenderFunction, Fragment, useEffect, useRef } from 'react';
import { useEditor, useSelectedLayers } from '../hooks';
import PageProvider from '../layers/core/PageContext';
import ImageEditor from '../common/image-editor/ImageEditor';
import { ResizeCallbackData, useResizeLayer } from '../layers/hooks/useResizeLayer';
import { isImageLayer, isVideoLayer } from '../ultils/layer/layers';
import { RotateCallbackData, useRotateLayer } from '../layers/hooks/useRotateLayer';
import { useLinkedRef } from '../hooks/useLinkedRef';
import { useDisabledFeatures } from '../layers/hooks/useDisabledFeatures';
import ControlBox from '../control-layer/ControlBox';
import Toolbar from '../control-layer/Toolbar';
import LayerBorderBox from '../layers/core/LayerBorderBox';
import CaretUpIcon from '@duyank/icons/regular/CaretUp';
import CaretDownIcon from '@duyank/icons/regular/CaretDown';
import TrashIcon from '@duyank/icons/regular/Trash';
import FilePlusIcon from '@duyank/icons/regular/FilePlus';
import DuplicateIcon from '@duyank/icons/external/Duplicate';
import LockKeyOpenIcon from '@duyank/icons/regular/LockKeyOpen';
import LockKeyIcon from '@duyank/icons/regular/LockKey';
import TextEditor from '../common/text-editor/TextEditor';
import { toPng } from 'html-to-image';
import DownloadIcon from '@duyank/icons/regular/Download';
import Guideline from '../control-layer/Guideline';
import { visualCorners } from '../ultils/2d/visualCorners';
import { isPointInsideBox } from '../ultils/2d/isPointInsideBox';
import { getImageSize } from '../layers/hooks/useResize';
import { getControlBoxSizeFromLayers } from '../ultils/layer/getControlBoxSizeFromLayers';
import { BoxData, getTransformStyle, LayerComponentProps, LayerId } from '@lidojs/core';
import { getPosition } from '@lidojs/utils';
import { LayerDataRef } from '../types';
import { VideoLayerProps } from '../layers/VideoLayer';
import { ImageLayerProps } from '../layers/ImageLayer';

export interface PageProps {
    pageIndex: number;
    width: number;
    height: number;
    transform: {
        x: number;
        y: number;
        scale: number;
    };
}
const DesignPage: ForwardRefRenderFunction<HTMLDivElement, PageProps> = (
    { pageIndex, width, height, transform },
    ref,
) => {
    const pageRef = useRef<HTMLDivElement>(null);
    const displayRef = useRef<HTMLDivElement>(null);
    const [controlBoxRef] = useLinkedRef<HTMLDivElement>(null);
    const layerBorderRef = useRef<Record<LayerId, HTMLDivElement>>({});
    const [controlBoxData, getControlBoxData, setControlBoxData] = useLinkedRef<BoxData>();
    const [layerData, getLayerData, setLayerData] = useLinkedRef<LayerDataRef>({});
    const { selectedLayerIds, selectedLayers } = useSelectedLayers();
    const disabled = useDisabledFeatures();
    const { actions, hoveredLayer, scale, activePage, controlBox, imageEditor, textEditor, totalPages, isLocked } =
        useEditor((state) => {
            const hoverLayerId = state.hoveredLayer[pageIndex];
            return {
                activePage: state.activePage,
                controlBox: state.controlBox,
                scale: state.scale,
                isLocked: state.pages[pageIndex] && state.pages[pageIndex].layers.ROOT.data.locked,
                hoveredLayer: hoverLayerId ? state.pages[pageIndex].layers[hoverLayerId] : null,
                selectStatus: state.selectData.status,
                imageEditor: state.imageEditor,
                textEditor: state.textEditor,
                totalPages: state.pages.length,
            };
        });
    const openContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (hoveredLayer && hoveredLayer.data.locked) {
            return;
        }
        if (controlBox && pageRef.current && hoveredLayer) {
            const matrix = new WebKitCSSMatrix(
                getTransformStyle({
                    rotate: controlBox.rotate,
                }),
            );
            const rect = pageRef.current.getBoundingClientRect();
            const controlBoxCorner = visualCorners(
                {
                    width: controlBox.boxSize.width * scale,
                    height: controlBox.boxSize.height * scale,
                },
                matrix,
                {
                    x: rect.x + controlBox.position.x * scale,
                    y: rect.y + controlBox.position.y * scale,
                },
            );
            if (!isPointInsideBox({ x: e.clientX, y: e.clientY }, controlBoxCorner)) {
                actions.selectLayers(pageIndex, hoveredLayer.id);
            }
        } else if (hoveredLayer) {
            actions.selectLayers(pageIndex, hoveredLayer.id);
        }
        actions.showContextMenu(getPosition(e.nativeEvent));
    };

    useEffect(() => {
        if (controlBoxData.current) {
            setControlBoxData({
                boxSize: {
                    width: controlBoxData.current.boxSize.width * scale,
                    height: controlBoxData.current.boxSize.height * scale,
                },
                position: {
                    x: controlBoxData.current.position.x * scale,
                    y: controlBoxData.current.position.y * scale,
                },
                rotate: controlBoxData.current.rotate,
                scale: controlBoxData.current.scale,
            });
        }
        if (layerData.current) {
            Object.entries(layerData.current).forEach(([layerId, layer]) => {
                if (layer.centerX) {
                    layerData.current[layerId].centerX = layer.centerX * scale;
                }
                if (layer.centerY) {
                    layerData.current[layerId].centerY = layer.centerY * scale;
                }
                layerData.current[layerId].position.x = layer.position.x * scale;
                layerData.current[layerId].position.y = layer.position.y * scale;
                layerData.current[layerId].boxSize.width = layer.boxSize.width * scale;
                layerData.current[layerId].boxSize.height = layer.boxSize.height * scale;
            });
        }
    }, [scale]);

    const handleResize = ({ controlBox, layers, direction, lockAspect }: ResizeCallbackData) => {
        actions.setControlBox(controlBox);
        Object.entries(layers).forEach(([layerId, newSize]) => {
            const l = selectedLayers.find((l) => l.id === layerId);
            if (l) {
                if (isImageLayer(l)) {
                    const changeX = newSize.boxSize.width - l.data.props.boxSize.width;
                    const changeY = newSize.boxSize.height - l.data.props.boxSize.height;
                    const props = l.data.props;
                    if (!lockAspect) {
                        const imageSize = getImageSize(props, props.image, direction, {
                            width: changeX,
                            height: changeY,
                        });
                        actions.history.merge().setProp(pageIndex, layerId, {
                            ...imageSize,
                            position: {
                                x: newSize.position.x,
                                y: newSize.position.y,
                            },
                        });
                    } else {
                        const ratio = newSize.boxSize.width / l.data.props.boxSize.width;
                        actions.history.merge().setProp<ImageLayerProps>(pageIndex, layerId, {
                            ...newSize,
                            image: {
                                boxSize: {
                                    width: l.data.props.image.boxSize.width * ratio,
                                    height: l.data.props.image.boxSize.height * ratio,
                                },
                                position: {
                                    x: l.data.props.image.position.x * ratio,
                                    y: l.data.props.image.position.y * ratio,
                                },
                                rotate: 0,
                            },
                        });
                    }
                } else if (isVideoLayer(l)) {
                    const changeX = newSize.boxSize.width - l.data.props.boxSize.width;
                    const changeY = newSize.boxSize.height - l.data.props.boxSize.height;
                    const props = l.data.props;
                    if (!lockAspect) {
                        const videoSize = getImageSize(props, props.video, direction, {
                            width: changeX,
                            height: changeY,
                        });
                        actions.history.merge().setProp(pageIndex, layerId, {
                            ...videoSize,
                            position: {
                                x: newSize.position.x,
                                y: newSize.position.y,
                            },
                        });
                    } else {
                        const ratio = newSize.boxSize.width / l.data.props.boxSize.width;
                        actions.history.merge().setProp<VideoLayerProps>(pageIndex, layerId, {
                            ...newSize,
                            video: {
                                boxSize: {
                                    width: l.data.props.video.boxSize.width * ratio,
                                    height: l.data.props.video.boxSize.height * ratio,
                                },
                                position: {
                                    x: l.data.props.video.position.x * ratio,
                                    y: l.data.props.video.position.y * ratio,
                                },
                                rotate: 0,
                            },
                        });
                    }
                } else {
                    actions.history.merge().setProp(pageIndex, layerId, newSize);
                }
            }
        });
    };

    const { startResizing } = useResizeLayer({
        options: {
            scalable: !disabled.scalable,
        },
        getLayerData,
        setLayerData,
        controlBox,
        getControlBoxData,
        setControlBoxData,
        onResize: handleResize,
        onResizeStop: handleResize,
    });
    useEffect(() => {
        const layerRecords = selectedLayers
            .filter((layer) => layer.id !== 'ROOT')
            .reduce((acc, layer) => {
                acc[layer.id] = layer.data.props;
                return acc;
            }, {} as Record<LayerId, LayerComponentProps>);
        actions.setControlBox(getControlBoxSizeFromLayers(layerRecords));
    }, [JSON.stringify(selectedLayerIds), scale]);

    const handleRotate = ({ controlBox, layers }: RotateCallbackData) => {
        actions.setControlBox(controlBox);
        Object.entries(layers).forEach(([layerId, data]) => {
            actions.history.merge().setProp(pageIndex, layerId, data);
        });
    };
    const { startRotate } = useRotateLayer({
        pageIndex,
        getLayerData,
        setLayerData,
        pageOffset: {
            x: pageRef.current?.getBoundingClientRect().x || 0,
            y: pageRef.current?.getBoundingClientRect().y || 0,
        },
        getControlBoxData,
        setControlBoxData,
        onRotate: handleRotate,
        onRotateEnd: handleRotate,
    });

    const handleDownload = async (pageIndex: number) => {
        if (displayRef.current) {
            try {
                const dataUrl = await toPng(displayRef.current);
                const link = document.createElement('a');
                link.download = `design-id-page-${pageIndex + 1}.png`;
                link.href = dataUrl;
                link.click();
            } catch (e) {
                window.alert('Cannot download: ' + (e as Error).message);
            }
        }
    };

    return (
        <PageProvider pageIndex={pageIndex}>
            <div
                css={{
                    fontWeight: 'bold',
                    marginTop: 24,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 4,
                    width: width * scale,
                    whiteSpace: 'nowrap',
                    '@media (max-width: 900px)': {
                        display: 'none',
                    },
                }}
            >
                {/* <div css={{ flexGrow: 1 }}>Page {pageIndex + 1}</div> */}
                {/* <div
                    css={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 20,
                        color: '#0d1216',
                        height: 28,
                        opacity: 0.7,
                    }}
                >
                    <div
                        css={{
                            marginLeft: 8,
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            cursor: pageIndex === 0 ? 'not-allowed' : 'pointer',
                            color: pageIndex === 0 ? 'rgba(36,49,61,.4)' : '#0d1216',
                            ':hover': {
                                background: pageIndex === 0 ? undefined : 'rgba(64, 87, 109, 0.07)',
                            },
                        }}
                        onClick={() => actions.movePageUp(pageIndex)}
                    >
                        <CaretUpIcon />
                    </div>
                    <div
                        css={{
                            marginLeft: 8,
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            cursor: pageIndex === totalPages - 1 ? 'not-allowed' : 'pointer',
                            color: pageIndex === totalPages - 1 ? 'rgba(36,49,61,.4)' : '#0d1216',
                            ':hover': {
                                background: pageIndex === totalPages - 1 ? undefined : 'rgba(64, 87, 109, 0.07)',
                            },
                        }}
                        onClick={() => actions.movePageDown(pageIndex)}
                    >
                        <CaretDownIcon />
                    </div>
                    <div
                        css={{
                            marginLeft: 8,
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            cursor: 'pointer',
                            ':hover': {
                                background: 'rgba(64, 87, 109, 0.07)',
                            },
                        }}
                        onClick={() => {
                            isLocked ? actions.unlockPage(pageIndex) : actions.lockPage(pageIndex);
                        }}
                    >
                        {!isLocked && <LockKeyOpenIcon />}
                        {isLocked && <LockKeyIcon />}
                    </div>
                    <div
                        css={{
                            marginLeft: 8,
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            cursor: 'pointer',
                            ':hover': {
                                background: 'rgba(64, 87, 109, 0.07)',
                            },
                        }}
                        onClick={() => actions.duplicatePage(pageIndex)}
                    >
                        <DuplicateIcon />
                    </div>
                    <div
                        css={{
                            marginLeft: 8,
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            cursor: 'pointer',
                            ':hover': {
                                background: 'rgba(64, 87, 109, 0.07)',
                            },
                        }}
                        onClick={() => handleDownload(pageIndex)}
                    >
                        <DownloadIcon />
                    </div>
                    <div
                        css={{
                            marginLeft: 8,
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            cursor: isLocked || totalPages <= 1 ? 'not-allowed' : 'pointer',
                            color: isLocked || totalPages <= 1 ? 'rgba(36,49,61,.4)' : '#0d1216',
                            ':hover': {
                                background: isLocked || totalPages <= 1 ? undefined : 'rgba(64, 87, 109, 0.07)',
                            },
                        }}
                        onClick={() => !isLocked && totalPages > 1 && actions.deletePage(pageIndex)}
                    >
                        <TrashIcon />
                    </div>
                    <div
                        css={{
                            marginLeft: 8,
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            cursor: 'pointer',
                            ':hover': {
                                background: 'rgba(64, 87, 109, 0.07)',
                            },
                        }}
                        onClick={() => actions.addPage(pageIndex)}
                    >
                        <FilePlusIcon />
                    </div>
                </div> */}
            </div>
            <div
                ref={ref}
                css={{
                    position: 'relative',
                    margin: 0,
                    boxShadow: '0 2px 8px rgba(14,19,24,.07)',
                    '@media (max-width: 900px)': {
                        boxShadow: 'none',
                    },
                }}
                style={{
                    width: width * scale * transform.scale,
                    height: height * scale * transform.scale,
                    transform: getTransformStyle({
                        position: transform,
                        scale: transform.scale,
                    }),
                }}
            >
                <div
                    ref={pageRef}
                    css={{
                        userSelect: 'none',
                        background: 'white',
                        overflow: 'hidden',
                        transformOrigin: '0 0',
                    }}
                    style={{
                        width: width,
                        height: height,
                        transform: `scale(${scale * transform.scale})`,
                    }}
                    onContextMenu={openContextMenu}
                >
                    <div
                        ref={displayRef}
                        css={{
                            width,
                            height,
                            position: 'relative',
                            left: 0,
                            top: 0,
                            zIndex: 1,
                            '@media (max-width: 900px)': {
                                width: width * scale,
                                height: height * scale,
                            },
                        }}
                    >
                        <PageElement />
                    </div>
                </div>

                <div css={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
                    {!imageEditor && pageIndex === activePage && controlBox && selectedLayers.length > 1 && (
                        <LayerBorderBox
                            boxSize={controlBox.boxSize}
                            position={controlBox.position}
                            rotate={controlBox.rotate}
                            type={'dashed'}
                        />
                    )}
                    {!imageEditor &&
                        pageIndex === activePage &&
                        selectedLayers.map((layer) => (
                            <LayerBorderBox
                                key={layer.id}
                                ref={(el) => el && (layerBorderRef.current[layer.id] = el)}
                                boxSize={layer.data.props.boxSize}
                                position={layer.data.props.position}
                                rotate={layer.data.props.rotate}
                                layerType={layer.data.type}
                            />
                        ))}
                    {!imageEditor && hoveredLayer && !selectedLayerIds.includes(hoveredLayer.id) && (
                        <LayerBorderBox
                            ref={(el) => el && (layerBorderRef.current[hoveredLayer.id] = el)}
                            boxSize={hoveredLayer.data.props.boxSize}
                            position={hoveredLayer.data.props.position}
                            rotate={hoveredLayer.data.props.rotate}
                        />
                    )}
                    {!imageEditor && pageIndex === activePage && selectedLayerIds.length > 0 && (
                        <Fragment>
                            {controlBox && (
                                <ControlBox
                                    ref={controlBoxRef}
                                    boxSize={controlBox.boxSize}
                                    position={controlBox.position}
                                    rotate={controlBox.rotate}
                                    scale={controlBox.scale}
                                    locked={disabled.locked}
                                    disabled={disabled}
                                    onRouteStart={startRotate}
                                    onResizeStart={startResizing}
                                />
                            )}
                            <Toolbar />
                        </Fragment>
                    )}
                    {pageIndex === activePage && <Guideline />}
                </div>
                {imageEditor && imageEditor.pageIndex === pageIndex && <ImageEditor />}
                {textEditor && textEditor.pageIndex === pageIndex && <TextEditor />}
            </div>
        </PageProvider>
    );
};

export default forwardRef<HTMLDivElement, PageProps>(DesignPage);
