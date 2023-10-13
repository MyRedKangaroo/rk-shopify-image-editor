import { normalizeNumber } from './normalize';

export const getRhombusPath = ({ width, height }: { width: number; height: number }) => {
    const halfW = normalizeNumber(width / 2);
    const halfH = normalizeNumber(height / 2);
    const path = [`M ${halfW} 0`];
    path.push(`L ${normalizeNumber(width)} ${halfH}`);
    path.push(`L ${halfW} ${normalizeNumber(height)}`);
    path.push(`L 0 ${halfH}`);
    path.push(`L ${halfW} 0`);
    return path.join(' ');
};
