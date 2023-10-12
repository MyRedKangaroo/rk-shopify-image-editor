import { normalizeNumber } from './normalize';

const PADDING = 16;
export const getParallelogramPath = ({ width, height }: { width: number; height: number }) => {
    const path = [`M ${PADDING} 0`];
    path.push(`L ${normalizeNumber(width)} 0`);
    path.push(`L ${normalizeNumber(width) - PADDING} ${normalizeNumber(height)}`);
    path.push(`L 0 ${normalizeNumber(height)}`);
    path.push(`L ${PADDING} 0`);
    return path.join(' ');
};
export const getParallelogramUpsideDownPath = ({ width, height }: { width: number; height: number }) => {
    const path = [`M ${normalizeNumber(width - PADDING)} 0`];
    path.push(`L 0 0`);
    path.push(`L ${PADDING} ${normalizeNumber(height)}`);
    path.push(`L ${PADDING} ${normalizeNumber(height)}`);
    path.push(`L ${normalizeNumber(width)} ${normalizeNumber(height)}`);
    path.push(`L ${normalizeNumber(width) - PADDING} 0`);
    return path.join(' ');
};
