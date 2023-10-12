import React, { useEffect, useMemo } from 'react';
import { useSelectedLayers, useEditor } from '../hooks';
import { TextLayerProps } from '../layers/TextLayer';
import TextSettings from './TextSettings';
import { Layer } from '../types';
import CommonSettings from './CommonSettings';
import { isRootLayer, isShapeLayer, isTextLayer } from '../ultils/layer/layers';
import { ShapeLayerProps } from '../layers/ShapeLayer';
import ShapeSettings from './ShapeSettings';
import RootSettings from './RootSettings';
import { RootLayerProps } from '../layers/RootLayer';

const LayerSettings = () => {
    const { selectedLayers, selectedLayerIds } = useSelectedLayers();
    const { actions, sidebar, isPageLocked } = useEditor((state) => ({
        sidebar: state.sidebar,
        isPageLocked: state.pages[state.activePage] && state.pages[state.activePage].layers.ROOT.data.locked,
    }));

    const { rootLayer, textLayers, shapeLayers } = useMemo(() => {
        return selectedLayers.reduce(
            (acc, layer) => {
                if (layer.data.locked) {
                    return acc;
                }
                if (isRootLayer(layer)) {
                    acc.rootLayer = layer;
                } else if (isTextLayer(layer)) {
                    acc.textLayers.push(layer);
                } else if (isShapeLayer(layer)) {
                    acc.shapeLayers.push(layer);
                }
                return acc;
            },
            {
                textLayers: [],
                shapeLayers: [],
                rootLayer: null,
            } as {
                textLayers: Layer<TextLayerProps>[];
                shapeLayers: Layer<ShapeLayerProps>[];
                rootLayer: Layer<RootLayerProps> | null;
            },
        );
    }, [selectedLayers]);
    useEffect(() => {
        const layerType: string[] = [];
        if (sidebar && sidebar !== 'LAYER_MANAGEMENT') {
            selectedLayers.forEach((layer) => {
                layerType.push(layer.data.type);
            });
            if (
                sidebar &&
                layerType.includes('Text') &&
                !['FONT_FAMILY', 'TEXT_EFFECT', 'CHOOSING_COLOR'].includes(sidebar)
            ) {
                actions.setSidebar();
            } else if (
                sidebar &&
                (layerType.includes('Shape') || layerType.includes('Root')) &&
                !['CHOOSING_COLOR'].includes(sidebar)
            ) {
                actions.setSidebar();
            }
        }
    }, [sidebar, selectedLayerIds]);
    return (
        <div
            css={{
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 14,
                fontWeight: 600,
                padding: '0 8px',
            }}
        >
            <div css={{ display: 'grid', alignItems: 'center', gridAutoFlow: 'column', gridGap: 8, paddingRight: 20 }}>
                {rootLayer && !isPageLocked && <RootSettings layer={rootLayer} />}
                {shapeLayers.length > 0 && !isPageLocked && <ShapeSettings layers={shapeLayers} />}
                {textLayers.length > 0 && !isPageLocked && <TextSettings layers={textLayers} />}
                <CommonSettings />
            </div>
        </div>
    );
};

export default LayerSettings;
