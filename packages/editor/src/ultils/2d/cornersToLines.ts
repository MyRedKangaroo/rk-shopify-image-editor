import { Delta } from '@lidojs/core';

export const cornersToLines = ({
    nw,
    ne,
    se,
    sw,
}: {
    nw: Delta;
    ne: Delta;
    se: Delta;
    sw: Delta;
}): [Delta, Delta][] => {
    return [
        [nw, ne],
        [ne, se],
        [se, sw],
        [sw, nw],
    ];
};
