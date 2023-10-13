import { css, Global } from '@emotion/react';
import React, { FC, useMemo } from 'react';
import { FontData } from '@lidojs/core';

export interface FontStyleProps {
    font: FontData;
}

const FontStyle: FC<FontStyleProps> = ({ font }) => {
    const fontFaceString = useMemo(() => {
        const fontFaceCss: string[] = [];
        font.fonts.forEach((cur) => {
            fontFaceCss.push(`
                @font-face {
                  font-family: '${font.name}';
                  font-weight: ${cur.style?.replace('_Italic', '') || 'normal'};
                  ${cur.style?.includes('_Italic') ? 'font-style: italic;\n' : ''}
                  src: url(${cur.urls.join(',')}) format('woff2');
                  font-display: block;
                }
            `);
        });
        return fontFaceCss.join('\n');
    }, [font]);

    return (
        <Global
            styles={css`
                ${fontFaceString}
            `}
        />
    );
};

export default React.memo(FontStyle);
