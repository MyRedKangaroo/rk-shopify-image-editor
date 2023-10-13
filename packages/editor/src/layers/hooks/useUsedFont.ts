import { useEditor } from '../../hooks';
import { isTextLayer } from '../../ultils/layer/layers';
import { uniqBy } from 'lodash';
import { FontData } from '@lidojs/core';

export const useUsedFont = () => {
    const { fontFamilyList } = useEditor((state) => {
        const fontFamilyList: FontData[] = [];
        state.pages.forEach((page) => {
            Object.entries(page.layers).forEach(([, layer]) => {
                if (isTextLayer(layer)) {
                    fontFamilyList.push(...layer.data.props.fonts);
                }
            });
        });
        return {
            fontFamilyList: uniqBy(fontFamilyList, 'name'),
        };
    });

    return { usedFonts: fontFamilyList };
};
