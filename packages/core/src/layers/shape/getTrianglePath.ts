import { normalizeNumber } from './normalize';

export const getTrianglePath = ({ width, height }: { width: number; height: number }) => {
    const halfWidth = normalizeNumber(width / 2);
    const path = [`M ${halfWidth} 0`];
    path.push(`L ${normalizeNumber(width)} ${normalizeNumber(height)}`);
    path.push(`L 0 ${normalizeNumber(height)}`);
    path.push(`L ${halfWidth} 0`);
    return path.join(' ');
};
export const getTriangleUpsideDownPath = ({ width, height }: { width: number; height: number }) => {
    const halfWidth = normalizeNumber(width / 2);
    const path = [`M 0 0`];
    path.push(`L ${normalizeNumber(width)} 0`);
    path.push(`L ${halfWidth} ${normalizeNumber(height)}`);
    path.push(`L 0 0`);
    return path.join(' ');
};
