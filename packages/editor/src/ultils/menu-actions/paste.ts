import { EditorActions } from '@lidojs/editor';
import { LayerComponentProps, SerializedLayerTree } from '@lidojs/core';

export const paste = async ({ actions }: { actions: EditorActions }) => {
    const data = await navigator.clipboard.readText();
    try {
        const serializedData: SerializedLayerTree[] = JSON.parse(data);
        //TODO VALIDATE data
        serializedData.forEach((serializedLayers) => {
            Object.entries(serializedLayers.layers).forEach(([layerId]) => {
                (serializedLayers.layers[layerId].props as LayerComponentProps).position.x += 10;
                (serializedLayers.layers[layerId].props as LayerComponentProps).position.y += 10;
            });
            actions.addLayerTree(serializedLayers);
        });
    } catch (e) {}
};
