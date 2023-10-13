import { serializeLayers } from '../layer/layers';
import { cloneDeep } from 'lodash';
import { EditorActions, EditorState } from '@lidojs/editor';
import { LayerComponentProps, LayerId, SerializedLayerTree } from '@lidojs/core';

export const duplicate = (
    state: EditorState,
    {
        pageIndex,
        layerIds,
        actions,
    }: {
        pageIndex: number;
        layerIds: LayerId[];
        actions: EditorActions;
    },
) => {
    const data: SerializedLayerTree[] = [];
    layerIds.map((layerId) => {
        data.push({
            rootId: layerId,
            layers: cloneDeep(serializeLayers(state.pages[pageIndex].layers, layerId)),
        });
    });
    actions.addLayerTrees(
        data.map((serializedLayers) => {
            Object.entries(serializedLayers.layers).forEach(([layerId]) => {
                (serializedLayers.layers[layerId].props as LayerComponentProps).position.x += 10;
                (serializedLayers.layers[layerId].props as LayerComponentProps).position.y += 10;
            });
            return serializedLayers;
        }),
    );
};
