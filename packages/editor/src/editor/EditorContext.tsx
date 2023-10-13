import { createContext } from 'react';
import { EditorActions, EditorQuery, EditorState, GetFontQuery } from '@lidojs/editor';
import { FontData } from '@lidojs/core';
export type EditorConfig = {
    assetPath: string;
    frame: {
        defaultImage: {
            width: number;
            height: number;
            url: string;
        };
    };
};
export type EditorContext = {
    getState: () => EditorState;
    query: EditorQuery;
    actions: EditorActions;
    getFonts: (query: GetFontQuery) => Promise<FontData[]>;
    config: EditorConfig;
    // displayRef: React.RefObject<HTMLDivElement>;
};

export const EditorContext = createContext<EditorContext>({} as EditorContext);
