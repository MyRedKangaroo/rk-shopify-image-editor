import React from 'react';
import { data } from '../../data';
import { DesignFrame } from '@lidojs/editor';

const EditorContent = ({
    displayRef
}) => {
    return <DesignFrame data={data} displayRef={displayRef} />;
};

export default EditorContent;
