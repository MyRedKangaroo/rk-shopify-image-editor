import { normalizeNumber } from './normalize';

export const getPentagonPath = ({ width, height }: { width: number; height: number }) => {
    const paddingRatio = 0.191;
    const path = [`M ${normalizeNumber(width / 2)} 0`];
    path.push(`L ${normalizeNumber(width)} ${normalizeNumber(paddingRatio * 2 * height)}`);
    path.push(`L ${normalizeNumber(width - paddingRatio * width)} ${normalizeNumber(height)}`);
    path.push(`L ${normalizeNumber(paddingRatio * width)} ${normalizeNumber(height)}`);
    path.push(`L 0 ${normalizeNumber(paddingRatio * 2 * height)}`);
    path.push(`L ${normalizeNumber(width / 2)} 0`);
    return path.join(' ');
};
