import { useCallback, useEffect } from 'react';
import { useEditor } from './useEditor';
import { paste } from '../ultils/menu-actions/paste';
import { keyName } from 'w3c-keyname';
import { copy } from '../ultils/menu-actions/copy';
import { useSelectedLayers } from './useSelectedLayers';
import { duplicate } from '../ultils/menu-actions/duplicate';
import { modifiers, normalizeKeyName } from '@lidojs/utils';

const useShortcut = (frameEle: HTMLElement | null) => {
    const { actions, state, activePage, rootLayer, scale } = useEditor((state) => ({
        rootLayer: state.pages[state.activePage] && state.pages[state.activePage].layers.ROOT,
        activePage: state.activePage,
        scale: state.scale,
    }));
    const { selectedLayerIds } = useSelectedLayers();
    const handlePaste = useCallback(async () => {
        await paste({ actions });
        actions.hideContextMenu();
    }, [actions]);
    const handleCopy = useCallback(async () => {
        await copy(state, { pageIndex: activePage, layerIds: selectedLayerIds });
        actions.hideContextMenu();
    }, [actions, state, activePage, copy, selectedLayerIds]);

    const handleDuplicate = useCallback(() => {
        duplicate(state, { pageIndex: activePage, layerIds: selectedLayerIds, actions });
        actions.hideContextMenu();
    }, [state, activePage, selectedLayerIds]);

    const handleDelete = useCallback(() => {
        if (!selectedLayerIds.includes('ROOT')) {
            actions.deleteLayer(state.activePage, selectedLayerIds);
        }
    }, [selectedLayerIds, state, actions]);

    const backwardDisabled = rootLayer?.data.child.findIndex((i) => selectedLayerIds.includes(i)) === 0;
    const forwardDisabled =
        rootLayer?.data.child.findLastIndex((i) => selectedLayerIds.includes(i)) ===
        (rootLayer?.data.child.length || 0) - 1;
    const handleForward = () => {
        if (!forwardDisabled) {
            actions.bringForward(activePage, selectedLayerIds);
        }
    };
    const handleToFront = () => {
        if (!forwardDisabled) {
            actions.bringToFront(activePage, selectedLayerIds);
        }
    };
    const handleBackward = () => {
        if (!backwardDisabled) {
            actions.sendBackward(activePage, selectedLayerIds);
        }
    };
    const handleToBack = () => {
        if (!backwardDisabled) {
            actions.sendToBack(activePage, selectedLayerIds);
        }
    };
    const handleZoomIn = () => {
        if (scale >= 4) {
            actions.setScale(5);
        } else if (scale >= 3) {
            actions.setScale(4);
        } else if (scale >= 2) {
            actions.setScale(3);
        } else if (scale >= 1.5) {
            actions.setScale(2);
        } else if (scale >= 1.25) {
            actions.setScale(1.5);
        } else if (scale >= 1) {
            actions.setScale(1.25);
        } else if (scale >= 0.75) {
            actions.setScale(1);
        } else if (scale >= 0.5) {
            actions.setScale(0.75);
        } else if (scale >= 0.25) {
            actions.setScale(0.5);
        } else {
            actions.setScale(0.25);
        }
    };
    const handleZoomOut = () => {
        if (scale <= 0.25) {
            actions.setScale(0.1);
        } else if (scale <= 0.5) {
            actions.setScale(0.25);
        } else if (scale <= 0.75) {
            actions.setScale(0.5);
        } else if (scale <= 1) {
            actions.setScale(0.75);
        } else if (scale <= 1.25) {
            actions.setScale(1);
        } else if (scale <= 1.5) {
            actions.setScale(1.25);
        } else if (scale <= 2) {
            actions.setScale(1.5);
        } else if (scale <= 3) {
            actions.setScale(2);
        } else if (scale <= 4) {
            actions.setScale(3);
        } else {
            actions.setScale(4);
        }
    };
    const handleZoomReset = () => {
        actions.setScale(1);
    };
    const handleKeydown = useCallback(
        async (e: KeyboardEvent) => {
            const name = keyName(e);
            const key = modifiers(name, e);
            const isSelectedLayer = selectedLayerIds.length > 0;
            //contain shortcut in blur mode
            switch (key) {
                case normalizeKeyName('Mod-a'):
                    actions.selectAllLayers();
                    e.preventDefault();
                    break;
                case normalizeKeyName('Mod-z'):
                    actions.history.undo();
                    e.preventDefault();
                    break;
                case normalizeKeyName('Mod-y'):
                    actions.history.redo();
                    e.preventDefault();
                    break;
                case normalizeKeyName('Mod-v'):
                    await handlePaste();
                    e.preventDefault();
                    break;
                case normalizeKeyName('Mod-c'):
                    isSelectedLayer && (await handleCopy());
                    e.preventDefault();
                    break;
                case normalizeKeyName('Mod-d'):
                    isSelectedLayer && (await handleDuplicate());
                    e.preventDefault();
                    break;

                case normalizeKeyName('Mod-]'):
                    isSelectedLayer && handleForward();
                    e.preventDefault();
                    break;
                case normalizeKeyName('Mod-Alt-]'):
                    isSelectedLayer && handleToFront();
                    e.preventDefault();
                    break;
                case normalizeKeyName('Mod-['):
                    isSelectedLayer && handleBackward();
                    e.preventDefault();
                    break;
                case normalizeKeyName('Mod-Alt-['):
                    isSelectedLayer && handleToBack();
                    e.preventDefault();
                    break;
                case normalizeKeyName('Delete'):
                case normalizeKeyName('Backspace'):
                    isSelectedLayer && handleDelete();
                    e.preventDefault();
                    break;
                case normalizeKeyName('ArrowLeft'):
                    actions.moveSelectedLayers('left', 1);
                    break;
                case normalizeKeyName('ArrowRight'):
                    actions.moveSelectedLayers('right', 1);
                    break;
                case normalizeKeyName('ArrowUp'):
                    actions.moveSelectedLayers('top', 1);
                    break;
                case normalizeKeyName('ArrowDown'):
                    actions.moveSelectedLayers('bottom', 1);
                    break;
                case normalizeKeyName('Mod-0'):
                    handleZoomReset();
                    e.preventDefault();
                    break;
                case normalizeKeyName('Mod--'):
                    handleZoomOut();
                    e.preventDefault();
                    break;
                case normalizeKeyName('Mod-='):
                    handleZoomIn();
                    e.preventDefault();
                    break;
            }
        },
        [actions, handleCopy, handlePaste, handleDuplicate, handleDelete],
    );

    useEffect(() => {
        const handleZoomDesktop = (e: WheelEvent) => {
            if (e.ctrlKey) {
                const s = Math.exp(-e.deltaY / 600);
                const newScale = Math.min(Math.max(scale * s, 0.1), 5);
                actions.setScale(newScale);
                e.preventDefault();
                e.stopPropagation();
            }
        };

        frameEle?.addEventListener('wheel', handleZoomDesktop, {
            passive: false,
        });
        return () => {
            frameEle?.removeEventListener('wheel', handleZoomDesktop);
        };
    }, [scale]);

    useEffect(() => {
        frameEle?.addEventListener('keydown', handleKeydown);
        return () => {
            frameEle?.removeEventListener('keydown', handleKeydown);
        };
    }, [frameEle, handleKeydown]);
};

export default useShortcut;
