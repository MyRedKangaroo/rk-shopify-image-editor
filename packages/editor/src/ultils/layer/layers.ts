import { createElement, ReactElement } from 'react';
import { v4 } from 'uuid';
import { resolveComponent } from './resolveComponent';
import { TextLayerProps } from '../../layers/TextLayer';
import { ShapeLayerProps } from '../../layers/ShapeLayer';
import { ImageLayerProps } from '../../layers/ImageLayer';
import { GroupLayerProps } from '../../layers/GroupLayer';
import { resolvers } from '../../editor/resolvers';
import { LayerComponentProps, LayerId, SerializedLayer, SerializedLayers } from '@lidojs/core';
import { Layer, LayerComponent, LayerData, Layers } from '@lidojs/editor';
import { RootLayerProps } from '../../layers/RootLayer';
import { VideoLayerProps } from '../../layers/VideoLayer';

export const getRandomId = (): LayerId => v4();
export const deserializeLayer = <P extends LayerComponentProps>(data: SerializedLayer): LayerData<P> => {
    const { type, props } = deserializeComponent(data);

    return {
        ...(type as LayerComponent<P>).info,
        comp: type as LayerComponent<P>,
        props,
        locked: data.locked,
        child: data.child,
        parent: data.parent,
    };
};

const deserializeComponent = (data: SerializedLayer): ReactElement => {
    const {
        type: { resolvedName },
        props,
    } = data;
    console.log(resolvedName);
    const component = resolvers[resolvedName];
    return createElement(component, props) as ReactElement;
};

export const serializeLayers = (layers: Layers, rootTreeId: LayerId): SerializedLayers => {
    let res: SerializedLayers = {};
    res[rootTreeId] = {
        type: {
            resolvedName: resolveComponent(layers[rootTreeId].data.comp),
        },
        props: layers[rootTreeId].data.props,
        locked: layers[rootTreeId].data.locked,
        child: layers[rootTreeId].data.child,
        parent: layers[rootTreeId].data.parent,
    };
    layers[rootTreeId].data.child.forEach((childId) => {
        res = { ...res, ...serializeLayers(layers, childId) };
    });
    return res;
};

export const isRootLayer = <P extends LayerComponentProps>(
    layer: Layer<RootLayerProps> | Layer<P>,
): layer is Layer<RootLayerProps> => layer.data.type === 'Root';

export const isMainLayer = <P extends LayerComponentProps>(layer: Layer<P>) => layer.data.parent === 'ROOT';

export const isGroupLayer = <P extends LayerComponentProps>(
    layer: Layer<GroupLayerProps> | Layer<P>,
): layer is Layer<GroupLayerProps> => layer.data.type === 'Group';

export const isTextLayer = <P extends LayerComponentProps>(
    layer: Layer<TextLayerProps> | Layer<P>,
): layer is Layer<TextLayerProps> => layer.data.type === 'Text';
export const isImageLayer = <P extends LayerComponentProps>(
    layer: Layer<ImageLayerProps> | Layer<P>,
): layer is Layer<ImageLayerProps> => layer.data.type === 'Image';
export const isShapeLayer = <P extends LayerComponentProps>(
    layer: Layer<ShapeLayerProps> | Layer<P>,
): layer is Layer<ShapeLayerProps> => layer.data.type === 'Shape';
export const isVideoLayer = <P extends LayerComponentProps>(
    layer: Layer<VideoLayerProps> | Layer<P>,
): layer is Layer<VideoLayerProps> => layer.data.type === 'Video';
