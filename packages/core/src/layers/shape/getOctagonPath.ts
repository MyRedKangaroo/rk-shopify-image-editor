import { normalizeNumber } from './normalize';

export const getOctagonPath = ({ width, height }: { width: number; height: number }) => {
    const withRate = normalizeNumber(width * 0.29);
    const heightRate = normalizeNumber(height * 0.29);
    const path = [`M ${withRate} 0`];
    path.push(`L ${normalizeNumber(width) - withRate} 0`);
    path.push(`L ${normalizeNumber(width)} ${heightRate}`);
    path.push(`L ${normalizeNumber(width)} ${normalizeNumber(height) - heightRate}`);
    path.push(`L ${normalizeNumber(width) - withRate} ${normalizeNumber(height)}`);
    path.push(`L ${withRate} ${normalizeNumber(height)}`);
    path.push(`L 0 ${normalizeNumber(height) - heightRate}`);
    path.push(`L 0 ${heightRate}`);
    path.push(`L ${withRate} 0`);
    return path.join(' ');
};
