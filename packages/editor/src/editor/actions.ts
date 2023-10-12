import {
    CoreEditorQuery,
    DeepPartial,
    Direction,
    EdgeDirection,
    EditorState,
    HorizontalGuideline,
    Layer,
    Layers,
    Page,
    SidebarType,
    VerticalGuideline,
} from '../types';
import { cloneDeep, isArray, uniq } from 'lodash';
import {
    deserializeLayer,
    getRandomId,
    isGroupLayer,
    isMainLayer,
    isRootLayer,
    isTextLayer,
    serializeLayers,
} from '../ultils/layer/layers';
import { GroupLayerProps } from '../layers/GroupLayer';
import { positionOfObjectInsideAnother } from '../ultils/2d/positionOfObjectInsideAnother';
import { boundingRect } from '../ultils/2d/boundingRect';
import { getControlBoxSizeFromLayers } from '../ultils/layer/getControlBoxSizeFromLayers';
import { getPositionWhenLayerCenter } from '../ultils/layer/getPositionWhenLayerCenter';
import {
    BoxData,
    BoxSize,
    CursorPosition,
    Delta,
    FontData,
    LayerComponentProps,
    LayerId,
    PageSize,
    SerializedLayer,
    SerializedLayerTree,
    SerializedPage,
} from '@lidojs/core';
import { mergeWithoutArray } from '@lidojs/utils';
import { RootLayerProps } from '../layers/RootLayer';
import { TextEditor } from '../common/text-editor/interfaces';

export const ActionMethods = (state: EditorState, query: CoreEditorQuery) => {
    const addLayerTreeToParent = (
        pageIndex: number,
        { rootId, layers }: SerializedLayerTree,
        parentId: LayerId = 'ROOT',
    ) => {
        const decodeLayer = (serializedLayer: SerializedLayer, parentId: LayerId) => {
            const newId = getRandomId();
            return {
                id: newId,
                data: deserializeLayer({ ...serializedLayer, parent: parentId, child: [] }),
            };
        };
        const layer = decodeLayer(layers[rootId], parentId);
        const deserializeChild = (layerId: LayerId, newParentId: LayerId) => {
            const res: [LayerId, Layer<LayerComponentProps>][] = [];
            layers[layerId].child.forEach((childId) => {
                const childLayer = decodeLayer(layers[childId], newParentId);
                res.push([childLayer.id, childLayer]);
                layer.data.child.push(childLayer.id);
            });
            return res;
        };
        const child = deserializeChild(rootId, layer.id);
        const layerList: Layers = Object.fromEntries([[layer.id, layer], ...child]);
        Object.entries(layerList).forEach(([layerId, layer]) => {
            state.pages[state.activePage].layers[layerId] = layer;
        });
        state.pages[pageIndex].layers[parentId].data.child.push(layer.id);
        return layer;
    };
    return {
        setProp<T extends LayerComponentProps>(
            pageIndex: number,
            layerId: LayerId | LayerId[],
            props: DeepPartial<T>,
            customizer?: (objVal: unknown, srcVal: unknown) => unknown,
        ) {
            const ids: LayerId[] = [];
            if (isArray(layerId)) {
                ids.push(...layerId);
            } else {
                ids.push(layerId);
            }
            ids.forEach((id) => {
                state.pages[pageIndex].layers[id].data.props = mergeWithoutArray(
                    state.pages[pageIndex].layers[id].data.props,
                    props,
                    customizer,
                );
            });
        },
        moveSelectedLayers: (direction: EdgeDirection, value: number) => {
            state.controlBox = undefined;
            state.selectedLayers[state.activePage].forEach((layerId) => {
                if (direction === 'right') {
                    state.pages[state.activePage].layers[layerId].data.props.position.x += value;
                } else if (direction === 'left') {
                    state.pages[state.activePage].layers[layerId].data.props.position.x -= value;
                } else if (direction === 'top') {
                    state.pages[state.activePage].layers[layerId].data.props.position.y -= value;
                } else if (direction === 'bottom') {
                    state.pages[state.activePage].layers[layerId].data.props.position.y += value;
                }
            });
        },
        changePageSize: (size: PageSize) => {
            const changeW = size.width - state.pageSize.width;
            const changeH = size.height - state.pageSize.height;
            state.pageSize = size;
            const pageRatio = size.width / size.height;
            state.pages.forEach((page) => {
                Object.entries(page.layers).forEach(([, layer]) => {
                    if (!isRootLayer(layer) && isMainLayer(layer)) {
                        layer.data.props.position.x += changeW / 2;
                        layer.data.props.position.y += changeH / 2;
                    }
                    if (isRootLayer(layer)) {
                        layer.data.props.boxSize = size;
                        if (layer.data.props.image) {
                            const imageRatio =
                                layer.data.props.image.boxSize.width / layer.data.props.image.boxSize.height;
                            if (imageRatio > pageRatio) {
                                //use image height
                                layer.data.props.image.boxSize.height = size.height;
                                layer.data.props.image.boxSize.width = size.height * imageRatio;
                            } else {
                                layer.data.props.image.boxSize.width = size.width;
                                layer.data.props.image.boxSize.height = size.width / imageRatio;
                            }
                            layer.data.props.image.position.y =
                                (size.height - layer.data.props.image.boxSize.height) / 2;
                            layer.data.props.image.position.x = (size.width - layer.data.props.image.boxSize.width) / 2;
                        }
                    }
                });
            });
        },
        setScale: (scale: number) => {
            state.scale = scale;
        },
        setGuideline: ({
            vertical,
            horizontal,
        }: {
            vertical: VerticalGuideline[];
            horizontal: HorizontalGuideline[];
        }) => {
            state.guideline.vertical = vertical;
            state.guideline.horizontal = horizontal;
        },
        selectLayers(pageIndex: number, layerIds: LayerId | LayerId[], type: 'replace' | 'add' = 'replace') {
            const ids = typeof layerIds === 'object' ? layerIds : [layerIds];

            state.textEditor = undefined;
            state.imageEditor = undefined;
            if (pageIndex !== state.activePage) {
                state.selectedLayers = {};
            }
            if (
                type === 'replace' ||
                (state.selectedLayers[pageIndex] && state.selectedLayers[pageIndex].includes('ROOT')) ||
                ids.includes('ROOT')
            ) {
                state.selectedLayers = {
                    [pageIndex]: ids,
                };
                const hoverLayer = state.hoveredLayer[pageIndex];
                if (hoverLayer && ids.includes(hoverLayer)) {
                    state.hoveredLayer = {
                        [pageIndex]: null,
                    };
                }
            } else {
                state.selectedLayers[pageIndex] = uniq([...(state.selectedLayers[pageIndex] || []), ...ids]);
            }
            state.activePage = pageIndex;
        },
        selectAllLayers: () => {
            state.imageEditor = undefined;
            state.textEditor = undefined;
            state.selectedLayers = {
                [state.activePage]: Object.entries(state.pages[state.activePage].layers).reduce((acc, [id, layer]) => {
                    if (layer.data.parent === 'ROOT') {
                        acc.push(id);
                    }
                    return acc;
                }, [] as LayerId[]),
            };
        },
        resetSelectLayer: () => {
            state.selectedLayers = {};
            state.hoveredLayer = {};
            state.textEditor = undefined;
            state.imageEditor = undefined;
        },
        hoverLayer: (pageIndex: number, layerId: LayerId | null) => {
            state.hoveredLayer = {
                [pageIndex]: layerId,
            };
        },
        setAlign(alignment: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') {
            const getChangeX = (box: BoxData, layer: Layer<LayerComponentProps>) => {
                const rect = boundingRect(layer.data.props.boxSize, layer.data.props.position, layer.data.props.rotate);
                if (alignment === 'left') {
                    return box.position.x - (layer.data.props.boxSize.width - rect.width) / 2;
                } else if (alignment === 'right') {
                    return (
                        box.position.x +
                        box.boxSize.width -
                        rect.width -
                        (layer.data.props.boxSize.width - rect.width) / 2
                    );
                } else {
                    return box.position.x + (box.boxSize.width - layer.data.props.boxSize.width) / 2;
                }
            };
            const getChangeY = (box: BoxData, layer: Layer<LayerComponentProps>) => {
                const rect = boundingRect(layer.data.props.boxSize, layer.data.props.position, layer.data.props.rotate);
                if (alignment === 'top') {
                    return box.position.y - (layer.data.props.boxSize.height - rect.height) / 2;
                } else if (alignment === 'bottom') {
                    return (
                        box.position.y +
                        box.boxSize.height -
                        rect.height -
                        (layer.data.props.boxSize.height - rect.height) / 2
                    );
                } else {
                    return box.position.y + (box.boxSize.height - layer.data.props.boxSize.height) / 2;
                }
            };
            const layers = state.selectedLayers[state.activePage].map((layerId) => {
                return state.pages[state.activePage].layers[layerId];
            });
            if (layers.length === 1) {
                if (['left', 'right', 'center'].includes(alignment)) {
                    const newX = getChangeX(state.pages[state.activePage].layers.ROOT.data.props, layers[0]);
                    state.pages[state.activePage].layers[layers[0].id].data.props.position.x = newX;
                    if (state.controlBox) {
                        state.controlBox.position.x = newX;
                    }
                } else {
                    const newY = getChangeY(state.pages[state.activePage].layers.ROOT.data.props, layers[0]);
                    state.pages[state.activePage].layers[layers[0].id].data.props.position.y = newY;
                    if (state.controlBox) {
                        state.controlBox.position.y = newY;
                    }
                }
            } else if (layers.length > 1) {
                const layerData = layers.reduce((acc, layer) => {
                    acc[layer.id] = layer.data.props;
                    return acc;
                }, {} as Record<LayerId, LayerComponentProps>);
                const currentRect = getControlBoxSizeFromLayers(layerData) as BoxData;
                const newLayerData: Record<LayerId, LayerComponentProps> = {};
                layers.forEach((layer) => {
                    if (['left', 'right', 'center'].includes(alignment)) {
                        state.pages[state.activePage].layers[layer.id].data.props.position.x = getChangeX(
                            currentRect,
                            layer,
                        );
                    } else {
                        state.pages[state.activePage].layers[layer.id].data.props.position.y = getChangeY(
                            currentRect,
                            layer,
                        );
                    }
                    newLayerData[layer.id] = state.pages[state.activePage].layers[layer.id].data.props;
                });
                state.controlBox = getControlBoxSizeFromLayers(newLayerData);
            }
        },
        setTextEditor: (pageIndex: number, layerId: LayerId, editor: TextEditor) => {
            state.pages[pageIndex].layers[layerId].data.editor = editor;
        },
        setData: (serializedPages: SerializedPage[]) => {
            state.activePage = 0;
            state.selectedLayers = {};
            state.hoveredLayer = {};
            const pages: Page[] = [];
            const decodeLayer = (serializedLayer: SerializedLayer, parentId: LayerId | null) => {
                const newId = serializedLayer.parent === null ? 'ROOT' : getRandomId();
                return {
                    id: newId,
                    data: deserializeLayer({ ...serializedLayer, parent: parentId, child: [] }),
                };
            };
            serializedPages.forEach((serializedPage, idx) => {
                if (idx === 0) {
                    state.pageSize = (serializedPage.layers.ROOT.props as unknown as RootLayerProps).boxSize;
                }
                const page: Page = {
                    layers: {},
                };

                page.layers.ROOT = decodeLayer(serializedPage.layers.ROOT, null);
                const deserializeChild = (layerId: LayerId, newLayerId: LayerId) => {
                    const res: [LayerId, Layer<LayerComponentProps>][] = [];
                    serializedPage.layers[layerId].child.forEach((childId) => {
                        const childLayer = decodeLayer(serializedPage.layers[childId], newLayerId);
                        res.push([childLayer.id, childLayer]);
                        page.layers[childLayer.id] = childLayer;
                        page.layers[newLayerId].data.child.push(childLayer.id);
                        if (serializedPage.layers[childId].child.length > 0) {
                            res.push(...deserializeChild(childId, childLayer.id));
                        }
                    });
                    return res;
                };
                const child = deserializeChild('ROOT', 'ROOT');
                const layerList: Layers = Object.fromEntries(child);
                Object.entries(layerList).forEach(([layerId, layer]) => {
                    page.layers[layerId] = layer;
                });
                pages.push(page);
            });
            state.pages = pages;
        },
        setPage: (pageIndex: number, serializedPage: SerializedPage) => {
            const page: Page = {
                layers: {},
            };
            const decodeLayer = (serializedLayer: SerializedLayer, parentId: LayerId | null) => {
                const newId = serializedLayer.parent === null ? 'ROOT' : getRandomId();
                return {
                    id: newId,
                    data: deserializeLayer({ ...serializedLayer, parent: parentId, child: [] }),
                };
            };

            page.layers.ROOT = decodeLayer(serializedPage.layers.ROOT, null);
            const deserializeChild = (layerId: LayerId, newLayerId: LayerId) => {
                const res: [LayerId, Layer<LayerComponentProps>][] = [];
                serializedPage.layers[layerId].child.forEach((childId) => {
                    const childLayer = decodeLayer(serializedPage.layers[childId], newLayerId);
                    res.push([childLayer.id, childLayer]);
                    page.layers[childLayer.id] = childLayer;
                    page.layers[newLayerId].data.child.push(childLayer.id);
                    if (serializedPage.layers[childId].child.length > 0) {
                        res.push(...deserializeChild(childId, childLayer.id));
                    }
                });
                return res;
            };
            const child = deserializeChild('ROOT', 'ROOT');
            const layerList: Layers = Object.fromEntries(child);
            Object.entries(layerList).forEach(([layerId, layer]) => {
                page.layers[layerId] = layer;
            });
            state.selectedLayers = {};
            state.pages[pageIndex] = page;
        },
        setActivePage(pageIndex: number) {
            state.selectedLayers = {};
            state.hoveredLayer = {};
            state.textEditor = undefined;
            state.activePage = pageIndex;
        },
        deleteLayer: (pageIndex: number, layerId: LayerId | LayerId[]) => {
            const ids: LayerId[] = [];
            if (typeof layerId === 'object') {
                ids.push(...layerId);
            } else {
                ids.push(layerId);
            }
            state.selectedLayers[pageIndex] = state.selectedLayers[pageIndex].filter((id) => !ids.includes(id));
            ids.forEach((id) => {
                const parentId = state.pages[pageIndex].layers[id].data.parent;
                delete state.pages[pageIndex].layers[id];
                if (parentId && state.pages[pageIndex].layers[parentId]) {
                    state.pages[pageIndex].layers[parentId].data.child = state.pages[pageIndex].layers[
                        parentId
                    ].data.child.filter((i) => i !== id);
                }
            });
        },
        openTextEditor(pageIndex: number, layerId: LayerId) {
            state.textEditor = {
                pageIndex,
                layerId,
                editor: null,
            };
        },
        setOpeningEditor(editor: TextEditor) {
            if (state.textEditor) {
                state.textEditor.editor = editor;
            }
        },
        closeTextEditor() {
            state.textEditor = undefined;
        },
        lockPage: (pageIndex: number) => {
            state.pages[pageIndex].layers.ROOT.data.locked = true;
        },
        unlockPage: (pageIndex: number) => {
            state.pages[pageIndex].layers.ROOT.data.locked = false;
        },
        deletePage: (pageIndex: number) => {
            state.selectedLayers = {};
            state.hoveredLayer = {};
            state.pages.splice(pageIndex, 1);
        },
        duplicatePage(pageIndex: number) {
            state.textEditor = undefined;
            state.imageEditor = undefined;
            const newPage: Page = {
                layers: {},
            };
            Object.entries(cloneDeep(serializeLayers(state.pages[pageIndex].layers, 'ROOT'))).map(
                ([layerId, layer]) => {
                    newPage.layers[layerId] = { id: layerId, data: deserializeLayer(layer) };
                },
            );
            state.pages.splice(pageIndex, 0, newPage);
            state.activePage = pageIndex + 1;
            state.selectedLayers = {
                [pageIndex + 1]: ['ROOT'],
            };
        },
        addPage: (pageIndex?: number) => {
            const page: Page = {
                layers: {},
            };
            page.layers.ROOT = {
                id: 'ROOT',
                data: deserializeLayer({
                    type: {
                        resolvedName: 'RootLayer',
                    },
                    props: {
                        boxSize: {
                            width: state.pageSize.width,
                            height: state.pageSize.height,
                        },
                        position: {
                            x: 0,
                            y: 0,
                        },
                        rotate: 0,
                        color: '#fff',
                        image: null,
                    },
                    locked: false,
                    parent: null,
                    child: [],
                }),
            };

            if (typeof pageIndex !== 'undefined') {
                state.pages.splice(pageIndex + 1, 0, page);
                state.activePage = pageIndex + 1;
            } else {
                state.pages.push(page);
                state.activePage = state.activePage + 1;
            }
        },
        movePageUp: (pageIndex: number) => {
            const newPage = cloneDeep(state.pages[pageIndex]);
            state.pages.splice(pageIndex, 1);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            state.pages.splice(pageIndex - 1, 0, newPage);
            state.activePage = pageIndex - 1;
        },
        movePageDown: (pageIndex: number) => {
            const newPage = cloneDeep(state.pages[pageIndex]);
            state.pages.splice(pageIndex, 1);
            state.pages.splice(pageIndex + 1, 0, newPage);
            state.activePage = pageIndex + 1;
        },
        lock: (pageIndex: number, layerId: LayerId | LayerId[]) => {
            const ids: LayerId[] = [];
            if (typeof layerId === 'object') {
                ids.push(...layerId);
            } else {
                ids.push(layerId);
            }
            ids.forEach((id) => {
                state.pages[pageIndex].layers[id].data.locked = true;
            });
        },
        unlock: (pageIndex: number, layerId: LayerId | LayerId[]) => {
            const ids: LayerId[] = [];
            if (typeof layerId === 'object') {
                ids.push(...layerId);
            } else {
                ids.push(layerId);
            }
            ids.forEach((id) => {
                state.pages[pageIndex].layers[id].data.locked = false;
            });
        },
        ungroup(layerId: LayerId) {
            const activePage = state.activePage;
            const layers = state.pages[state.activePage].layers;
            const group = layers[layerId] as Layer<GroupLayerProps>;
            const child = layers[layerId].data.child;
            const parentId = layers[layerId].data.parent as LayerId;
            const parent = layers[parentId];

            const childLayer = child.reduce((acc, id) => {
                acc[id] = positionOfObjectInsideAnother(group.data.props, layers[id].data.props);
                return acc;
            }, {} as Record<LayerId, Delta & { rotate: number }>);

            const groupIdx = parent.data.child.indexOf(layerId);
            child.forEach((id) => {
                const layer = state.pages[activePage].layers[id];
                layer.data.parent = 'ROOT';
                layer.data.props.position.x = childLayer[id].x;
                layer.data.props.position.y = childLayer[id].y;
                layer.data.props.rotate = childLayer[id].rotate;
                layer.data.props.boxSize.width = layer.data.props.boxSize.width * group.data.props.scale;
                layer.data.props.boxSize.height = layer.data.props.boxSize.height * group.data.props.scale;
                if (isTextLayer(layer)) {
                    layer.data.props.scale = layer.data.props.scale * group.data.props.scale;
                }
            });
            state.pages[activePage].layers[parentId].data.child.splice(groupIdx, 1);
            state.pages[activePage].layers[parentId].data.child.splice(groupIdx, 0, ...child);
            delete state.pages[activePage].layers[layerId];
            state.selectedLayers = {
                [activePage]: child,
            };
            return child;
        },
        group(layerIds: LayerId[]) {
            const ids: LayerId[] = [];
            const activePage = state.activePage;
            const layers = state.pages[state.activePage].layers;
            layerIds.forEach((layerId) => {
                if (isGroupLayer(layers[layerId])) {
                    ids.push(...this.ungroup(layerId));
                } else {
                    ids.push(layerId);
                }
            });
            const { left, right, top, bottom } = ids.reduce(
                (acc, id) => {
                    const props = layers[id].data.props;
                    const rect = boundingRect(props.boxSize, props.position, props.rotate);
                    if (acc.left === null || acc.left > rect.x) {
                        acc.left = rect.x;
                    }
                    if (acc.right === null || acc.right < rect.x + rect.width) {
                        acc.right = rect.x + rect.width;
                    }
                    if (acc.top === null || acc.top > rect.y) {
                        acc.top = rect.y;
                    }
                    if (acc.bottom === null || acc.bottom < rect.y + rect.height) {
                        acc.bottom = rect.y + rect.height;
                    }
                    return acc;
                },
                {
                    left: null,
                    right: null,
                    top: null,
                    bottom: null,
                } as { left: number | null; right: number | null; top: number | null; bottom: number | null },
            );
            const newGroupNode = {
                type: {
                    resolvedName: 'GroupLayer',
                },
                props: {
                    position: {
                        x: left,
                        y: top,
                    },
                    boxSize: {
                        width: (right as number) - (left as number),
                        height: (bottom as number) - (top as number),
                    },
                    scale: 1,
                    rotate: 0,
                },
                locked: false,
                hidden: false,
                parent: 'ROOT',
                child: ids,
            };
            const parentId = getRandomId();
            const dl = deserializeLayer(newGroupNode);
            const rootChild = layers.ROOT.data.child;
            state.pages[activePage].layers[parentId] = { id: parentId, data: dl };
            ids.sort((a, b) => rootChild.indexOf(a) - rootChild.indexOf(b));
            const lastIdx = state.pages[activePage].layers.ROOT.data.child.findLastIndex((i) => ids.includes(i));
            ids.forEach((id) => {
                const idx = state.pages[activePage].layers.ROOT.data.child.findIndex((lId) => lId === id);
                state.pages[activePage].layers.ROOT.data.child.splice(idx, 1);

                state.pages[activePage].layers[id].data.parent = parentId;
                const props = state.pages[activePage].layers[id].data.props;
                state.pages[activePage].layers[id].data.props.position.x = props.position.x - (left as number);
                state.pages[activePage].layers[id].data.props.position.y = props.position.y - (top as number);
            });
            state.pages[activePage].layers.ROOT.data.child.splice(lastIdx - layerIds.length + 1, 0, parentId);
            state.selectedLayers = {
                [activePage]: [parentId],
            };
            return parentId;
        },
        bringToFront: (pageIndex: number, layerId: LayerId | LayerId[]) => {
            const ids: LayerId[] = [];
            if (typeof layerId === 'object') {
                ids.push(...layerId);
            } else {
                ids.push(layerId);
            }
            const child = state.pages[pageIndex].layers.ROOT.data.child;
            ids.sort((a, b) => child.indexOf(a) - child.indexOf(b));
            ids.forEach((id) => {
                const fromIndex = child.findIndex((lId) => lId === id);
                child.splice(fromIndex, 1);
                child.splice(child.length, 0, id);
            });
        },
        bringForward: (pageIndex: number, layerId: LayerId | LayerId[]) => {
            const ids: LayerId[] = [];
            if (typeof layerId === 'object') {
                ids.push(...layerId);
            } else {
                ids.push(layerId);
            }
            const child = state.pages[pageIndex].layers.ROOT.data.child;
            const lastIndex = child.findLastIndex((lId) => ids.includes(lId));
            ids.sort((a, b) => child.indexOf(a) - child.indexOf(b));
            ids.forEach((id) => {
                const fromIndex = child.findIndex((lId) => lId === id);
                child.splice(fromIndex, 1);
                child.splice(lastIndex + 1, 0, id);
            });
        },
        sendToBack: (pageIndex: number, layerId: LayerId | LayerId[]) => {
            const ids: LayerId[] = [];
            if (typeof layerId === 'object') {
                ids.push(...layerId);
            } else {
                ids.push(layerId);
            }
            const child = state.pages[pageIndex].layers.ROOT.data.child;
            ids.sort((a, b) => child.indexOf(b) - child.indexOf(a));
            ids.forEach((id) => {
                const fromIndex = child.findIndex((lId) => lId === id);
                child.splice(fromIndex, 1);
                child.splice(0, 0, id);
            });
        },
        sendBackward: (pageIndex: number, layerId: LayerId | LayerId[]) => {
            const ids: LayerId[] = [];
            if (typeof layerId === 'object') {
                ids.push(...layerId);
            } else {
                ids.push(layerId);
            }
            const child = state.pages[pageIndex].layers.ROOT.data.child;
            const firstIndex = child.findIndex((lId) => ids.includes(lId));
            ids.sort((a, b) => child.indexOf(b) - child.indexOf(a));
            ids.forEach((id) => {
                const fromIndex = child.findIndex((lId) => lId === id);
                child.splice(fromIndex, 1);
                child.splice(firstIndex - 1, 0, id);
            });
        },
        setFontList(list: FontData[]) {
            state.fontList = list;
        },
        appendFontList(list: FontData[]) {
            state.fontList.push(...list);
        },
        addLayer(serializedLayer: Pick<SerializedLayer, 'type' | 'props'>, parentId: LayerId = 'ROOT') {
            const layerId = getRandomId();
            const dl = deserializeLayer({
                ...serializedLayer,
                locked: false,
                parent: parentId,
                child: [],
            });
            state.pages[state.activePage].layers[layerId] = {
                id: layerId,
                data: mergeWithoutArray(dl, {
                    props: {
                        position: getPositionWhenLayerCenter(state.pageSize, dl.props.boxSize),
                    },
                }),
            };
            state.pages[state.activePage].layers[parentId].data.child.push(layerId);
            this.selectLayers(state.activePage, layerId);
        },
        addShapeLayer(serializedLayer: Pick<SerializedLayer, 'type' | 'props'>, parentId: LayerId = 'ROOT') {
            const layerId = getRandomId();
            const dl = deserializeLayer({
                ...serializedLayer,
                locked: false,
                parent: parentId,
                child: [],
            });
            const ratio = state.pageSize.width / state.pageSize.height;
            const shapeRatio = dl.props.boxSize.width / dl.props.boxSize.height;
            let scale = 1,
                width = dl.props.boxSize.width,
                height = dl.props.boxSize.height;
            const shapeSize = 0.3;
            if (shapeRatio > ratio) {
                //scale by width
                width = state.pageSize.width * shapeSize;
                height = width / shapeRatio;
                scale = width / dl.props.boxSize.width;
            } else {
                height = state.pageSize.height * shapeSize;
                width = height * shapeRatio;
                scale = height / dl.props.boxSize.height;
            }
            state.pages[state.activePage].layers[layerId] = {
                id: layerId,
                data: mergeWithoutArray(cloneDeep(dl), {
                    props: {
                        boxSize: { width, height },
                        position: getPositionWhenLayerCenter(state.pageSize, dl.props.boxSize),
                        scale,
                    },
                }),
            };
            state.pages[state.activePage].layers[parentId].data.child.push(layerId);
            this.selectLayers(state.activePage, layerId);
        },
        addImageLayer({ thumb, url }: { url: string; thumb: string }, boxSize: BoxSize, parentId: LayerId = 'ROOT') {
            const layerId = getRandomId();
            const pageSize = state.pageSize;
            const ratio = pageSize.width / pageSize.height;
            const imgRatio = boxSize.width / boxSize.height;
            const w = ratio < imgRatio ? pageSize.width * 0.8 : pageSize.height * imgRatio * 0.8;
            const h = w / imgRatio;
            const dl = deserializeLayer({
                type: {
                    resolvedName: 'ImageLayer',
                },
                props: {
                    image: {
                        url,
                        thumb,
                        boxSize: {
                            width: w,
                            height: h,
                        },
                        position: {
                            x: 0,
                            y: 0,
                        },
                        rotate: 0,
                    },
                    position: {
                        x: 0,
                        y: 0,
                    },
                    boxSize: {
                        width: w,
                        height: h,
                    },
                    rotate: 0,
                },
                locked: false,
                parent: parentId,
                child: [],
            });
            state.pages[state.activePage].layers[layerId] = {
                id: layerId,
                data: mergeWithoutArray(dl, {
                    props: {
                        position: getPositionWhenLayerCenter(state.pageSize, dl.props.boxSize),
                    },
                }),
            };
            state.pages[state.activePage].layers[parentId].data.child.push(layerId);
            this.selectLayers(state.activePage, layerId);
        },
        addLayerTree({ layers, rootId }: SerializedLayerTree) {
            const layer = addLayerTreeToParent(state.activePage, { layers, rootId });
            this.selectLayers(state.activePage, layer.id);
        },
        addLayerTrees(data: SerializedLayerTree[]) {
            const ids: LayerId[] = [];
            const layers = data.map((serializeLayers) => {
                const layer = addLayerTreeToParent(state.activePage, serializeLayers);
                ids.push(layer.id);
                return layer;
            });
            this.selectLayers(state.activePage, ids);
            return layers;
        },
        showContextMenu: ({ clientX, clientY }: CursorPosition) => {
            state.openMenu = {
                clientX,
                clientY,
            };
        },
        hideContextMenu: () => {
            state.openMenu = null;
        },
        setSelectData: (status: boolean) => {
            state.selectData.status = status;
        },
        setResizeData: (
            status: boolean,
            layerIds?: LayerId[],
            direction?: Direction,
            rotate?: number,
            boxSize?: BoxSize,
            cursor?: CursorPosition,
        ) => {
            state.resizeData = {
                status,
                layerIds,
                direction,
                rotate,
                boxSize,
                cursor,
            };
        },
        setRotateData: (status: boolean, rotate?: number) => {
            state.rotateData = {
                status,
                rotate,
            };
        },
        setDragData: (status: boolean, layerIds?: LayerId[]) => {
            state.dragData = {
                status,
                layerIds,
            };
        },
        setControlBox: (data?: BoxData) => {
            state.controlBox = data;
        },
        setSidebar: (sidebar?: SidebarType) => {
            state.sidebar = sidebar || null;
        },
        openImageEditor(
            pageIndex: number,
            layerId: LayerId,
            {
                boxSize,
                position,
                rotate,
                image,
            }: {
                position: Delta;
                rotate: number;
                boxSize: BoxSize;
                image: {
                    url: string;
                    position: Delta;
                    rotate: number;
                    boxSize: BoxSize;
                };
            },
        ) {
            state.imageEditor = cloneDeep({
                pageIndex,
                layerId,
                boxSize,
                position,
                rotate,
                image,
            });
        },
        updateImageEditor(
            data: DeepPartial<{
                position: Delta;
                rotate: number;
                boxSize: BoxSize;
                image: {
                    url: string;
                    position: Delta;
                    rotate: number;
                    boxSize: BoxSize;
                };
            }>,
        ) {
            if (state.imageEditor) {
                state.imageEditor = mergeWithoutArray(state.imageEditor, data);
            }
        },
        closeImageEditor() {
            const imageEditor = state.imageEditor;
            if (imageEditor?.image) {
                const originalLayer = state.pages[imageEditor.pageIndex].layers[imageEditor.layerId];
                state.pages[imageEditor.pageIndex].layers[imageEditor.layerId].data.props = mergeWithoutArray(
                    state.pages[imageEditor.pageIndex].layers[imageEditor.layerId].data.props,
                    {
                        boxSize: imageEditor.boxSize,
                        position: imageEditor.position,
                        rotate: imageEditor.rotate,
                        image: {
                            boxSize: {
                                width: imageEditor.image.boxSize.width / (originalLayer.data.props.scale || 1),
                                height: imageEditor.image.boxSize.height / (originalLayer.data.props.scale || 1),
                            },
                            position: {
                                x: imageEditor.image.position.x / (originalLayer.data.props.scale || 1),
                                y: imageEditor.image.position.y / (originalLayer.data.props.scale || 1),
                            },
                            rotate: imageEditor.image.rotate,
                        },
                    },
                );
            }

            state.imageEditor = undefined;
        },
    };
};
