import React, { FC } from 'react';
import { EffectSettings, FontData, LayerComponentProps } from '../types';
import { getTextEffectStyle } from '@lidojs/core';

export interface TextContentProps extends LayerComponentProps {
    text: string;
    scale: number;
    fonts: FontData[];
    colors: string[];
    fontSizes: number[];
    effect: {
        name: string;
        settings: EffectSettings;
    } | null;
}
export const TextContent: FC<TextContentProps> = ({ text, colors, fontSizes, effect }) => {
    return (
        <div
            className={`lidojs-text`}
            css={{
                p: {
                    '&:before': {
                        ...getTextEffectStyle(
                            effect?.name || 'none',
                            effect?.settings as EffectSettings,
                            colors[0],
                            fontSizes[0],
                        ),
                    },
                },
                ...getTextEffectStyle(
                    effect?.name || 'none',
                    effect?.settings as EffectSettings,
                    colors[0],
                    fontSizes[0],
                ),
            }}
            dangerouslySetInnerHTML={{ __html: text }}
        />
    );
};
