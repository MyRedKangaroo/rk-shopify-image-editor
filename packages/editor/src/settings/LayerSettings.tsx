import React, { useEffect, useMemo, useCallback } from 'react';
import { useSelectedLayers, useEditor } from '../hooks';
import { TextLayerProps } from '../layers/TextLayer';
import TextSettings from './TextSettings';
import { Layer } from '../types';
import CommonSettings from './CommonSettings';
import { isFrameLayer, isRootLayer, isShapeLayer, isSvgLayer, isTextLayer } from '../ultils/layer/layers';
import { ShapeLayerProps } from '../layers/ShapeLayer';
import ShapeSettings from './ShapeSettings';
import RootSettings from './RootSettings';
import { SvgLayerProps } from '../layers/SvgLayer';
import SvgSettings from './SvgSetting';
import { FrameLayerProps } from '../layers/FrameLayer';
import FrameSettings from './FrameSettings';
import { RootLayerProps } from '../layers/RootLayer';
import { toPng } from 'html-to-image';

const LayerSettings = () => {
    const { selectedLayers, selectedLayerIds } = useSelectedLayers();
    const { actions, sidebar, isPageLocked, displayRef } = useEditor((state) => ({
        sidebar: state.sidebar,
        isPageLocked: state.pages[state.activePage] && state.pages[state.activePage].layers.ROOT.data.locked,
        displayRef: state.displayRef,
    }));

    const { rootLayer, textLayers, shapeLayers, svgLayers, frameLayers } = useMemo(() => {
        return selectedLayers.reduce(
            (acc, layer) => {
                if (layer.data.locked) {
                    return acc;
                }
                if (isRootLayer(layer)) {
                    acc.rootLayer = layer;
                } else if (isSvgLayer(layer)) {
                    acc.svgLayers.push(layer);
                } else if (isTextLayer(layer)) {
                    acc.textLayers.push(layer);
                } else if (isShapeLayer(layer)) {
                    acc.shapeLayers.push(layer);
                } else if (isFrameLayer(layer)) {
                    acc.frameLayers.push(layer);
                }
                return acc;
            },
            {
                textLayers: [],
                shapeLayers: [],
                rootLayer: null,
                svgLayers: [],
                frameLayers: [],
            } as {
                textLayers: Layer<TextLayerProps>[];
                shapeLayers: Layer<ShapeLayerProps>[];
                rootLayer: Layer<RootLayerProps> | null;
                svgLayers: Layer<SvgLayerProps>[];
                frameLayers: Layer<FrameLayerProps>[];
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
                {frameLayers.length > 0 && !isPageLocked && <FrameSettings layers={frameLayers} />}
                {svgLayers.length === 1 && !isPageLocked && <SvgSettings layer={svgLayers[0]} />}
                {shapeLayers.length > 0 && !isPageLocked && <ShapeSettings layers={shapeLayers} />}
                {textLayers.length > 0 && !isPageLocked && <TextSettings layers={textLayers} />}
                <CommonSettings />
            </div>

            <button>Next</button>
        </div>
    );
};

export default LayerSettings;
