import React, { forwardRef, ForwardRefRenderFunction, useEffect, useMemo, useRef } from 'react';
import reverse from 'lodash/reverse';
import { useEditor, useSelectedLayers } from '../../hooks';
import Sidebar, { SidebarProps } from './Sidebar';
import DotsSixVerticalBoldIcon from '@duyank/icons/bold/DotsSixVerticalBold';
import DotsThreeBoldIcon from '@duyank/icons/bold/DotsThreeBold';
import XIcon from '@duyank/icons/regular/X';
import { PageContext } from '../../layers/core/PageContext';
import { isGroupLayer } from '../../ultils/layer/layers';
import BoundingBoxIcon from '@duyank/icons/regular/BoundingBox';
import SelectionBackgroundIcon from '@duyank/icons/regular/SelectionBackground';
import ReverseTransformLayer from './layer/ReverseTransformLayer';
import { getPosition } from '@lidojs/utils';

type LayerSidebarProps = SidebarProps;
const LayerSidebar: ForwardRefRenderFunction<HTMLDivElement, LayerSidebarProps> = ({ ...props }, ref) => {
    const dataRef = useRef({ isMultipleSelect: false });
    const { selectedLayerIds } = useSelectedLayers();
    const { layers, actions, activePage } = useEditor((state) => ({
        layers: state.pages[state.activePage] && state.pages[state.activePage].layers,
        activePage: state.activePage,
    }));
    const layerList = useMemo(() => {
        if (!layers) {
            return;
        }
        return reverse(layers['ROOT'].data.child.map((layerId) => layers[layerId]));
    }, [layers]);
    const rootLayer = useMemo(() => {
        if (!layers) {
            return;
        }
        return layers.ROOT;
    }, [layers]);

    const handleClickOption = (e: React.MouseEvent) => {
        actions.showContextMenu(getPosition(e.nativeEvent));
    };
    useEffect(() => {
        const enableMultipleSelect = (e: KeyboardEvent) => {
            dataRef.current.isMultipleSelect = e.shiftKey;
        };
        window.addEventListener('keydown', enableMultipleSelect);
        window.addEventListener('keyup', enableMultipleSelect);
        return () => {
            window.removeEventListener('keydown', enableMultipleSelect);
            window.removeEventListener('keyup', enableMultipleSelect);
        };
    }, []);
    return (
        <Sidebar {...props}>
            <PageContext.Provider value={{ pageIndex: activePage }}>
                <div
                    css={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
                >
                    <div
                        css={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            height: 48,
                            borderBottom: '1px solid rgba(57,76,96,.15)',
                            padding: '0 20px',
                        }}
                    >
                        <p
                            css={{
                                lineHeight: '48px',
                                fontWeight: 600,
                                color: '#181C32',
                                flexGrow: 1,
                            }}
                        >
                            Layers
                        </p>
                        <div
                            css={{
                                fontSize: 20,
                                flexShrink: 0,
                                width: 32,
                                height: 32,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onClick={() => {
                                actions.setSidebar();
                            }}
                        >
                            <XIcon />
                        </div>
                    </div>

                    <div
                        ref={ref}
                        css={{
                            flexGrow: 1,
                            overflowY: 'auto',
                        }}
                    >
                        <div
                            css={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(0,1fr)',
                                gridRowGap: 8,
                                padding: 16,
                            }}
                        >
                            {(layerList || []).map((layer) => (
                                <div
                                    key={layer.id}
                                    css={{
                                        background: '#F6F6F6',
                                        borderRadius: 8,
                                        padding: 8,
                                        cursor: 'pointer',
                                        position: 'relative',
                                        borderWidth: 2,
                                        borderStyle: 'solid',
                                        borderColor: selectedLayerIds.includes(layer.id) ? '#3d8eff' : 'transparent',
                                    }}
                                    onMouseDown={() => {
                                        actions.selectLayers(
                                            activePage,
                                            layer.id,
                                            dataRef.current.isMultipleSelect ? 'add' : 'replace',
                                        );
                                    }}
                                >
                                    <div
                                        css={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div
                                            css={{
                                                fontSize: 24,
                                                width: 40,
                                                height: 40,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <DotsSixVerticalBoldIcon />
                                        </div>
                                        <div css={{ minWidth: 0, flexGrow: 1 }}>
                                            <ReverseTransformLayer layer={layer} />
                                        </div>
                                        {isGroupLayer(layer) && (
                                            <div css={{ flexShrink: 0, fontSize: 24 }}>
                                                <BoundingBoxIcon />
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        css={{
                                            position: 'absolute',
                                            right: 4,
                                            top: 4,
                                            background: '#5E6278',
                                            borderRadius: 8,
                                            color: '#fff',
                                            padding: '0 6px',
                                        }}
                                        onClick={handleClickOption}
                                    >
                                        <DotsThreeBoldIcon />
                                    </div>
                                </div>
                            ))}
                            {rootLayer && (
                                <div
                                    css={{
                                        background: '#F6F6F6',
                                        borderRadius: 8,
                                        padding: 8,
                                        cursor: 'pointer',
                                        position: 'relative',
                                        borderWidth: 2,
                                        borderStyle: 'solid',
                                        borderColor: selectedLayerIds.includes(rootLayer.id)
                                            ? '#3d8eff'
                                            : 'transparent',
                                    }}
                                    onMouseDown={() => {
                                        actions.selectLayers(
                                            activePage,
                                            rootLayer.id,
                                            dataRef.current.isMultipleSelect ? 'add' : 'replace',
                                        );
                                    }}
                                >
                                    <div
                                        css={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div
                                            css={{
                                                width: 40,
                                                height: 40,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexShrink: 0,
                                            }}
                                        ></div>
                                        <div css={{ minWidth: 0, flexGrow: 1 }}>
                                            <ReverseTransformLayer layer={rootLayer} hiddenChild={true} />
                                        </div>

                                        <div css={{ flexShrink: 0, fontSize: 24 }}>
                                            <SelectionBackgroundIcon />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PageContext.Provider>
        </Sidebar>
    );
};

export default forwardRef<HTMLDivElement, LayerSidebarProps>(LayerSidebar);
