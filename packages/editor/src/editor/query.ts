import { EditorState } from '../types/editor';
import { serialize } from '../ultils/layer/page';
import { LayerComponentProps, LayerId } from '@lidojs/core';
import { Layer } from '@lidojs/editor';

export const QueryMethods = (state: EditorState) => {
    return {
        serialize() {
            return serialize(state.pages);
        },
        getLayers(pageIndex: number) {
            return state.pages[pageIndex] && state.pages[pageIndex].layers;
        },
        getLayer<P extends LayerComponentProps>(pageIndex: number, layerId: LayerId) {
            const layers = state.pages[pageIndex] && state.pages[pageIndex].layers;
            if (layers) {
                return layers[layerId] as unknown as Layer<P>;
            }
        },
    };
};
