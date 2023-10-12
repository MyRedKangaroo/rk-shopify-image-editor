import { normalizeNumber } from './normalize';

export const getCrossPath = ({ width, height }: { width: number; height: number }) => {
    const oneThirdWidth = normalizeNumber(width / 3);
    const twoThirdsWidth = oneThirdWidth * 2;
    const oneThirdHeight = normalizeNumber(height / 3);
    const twoThirdsHeight = oneThirdHeight * 2;
    const path = [`M ${oneThirdWidth} 0`];
    path.push(`L ${twoThirdsWidth} 0`);
    path.push(`L ${twoThirdsWidth} ${oneThirdHeight}`);
    path.push(`L ${normalizeNumber(width)} ${oneThirdHeight}`);
    path.push(`L ${normalizeNumber(width)} ${twoThirdsHeight}`);
    path.push(`L ${twoThirdsWidth} ${twoThirdsHeight}`);
    path.push(`L ${twoThirdsWidth} ${normalizeNumber(height)}`);
    path.push(`L ${oneThirdWidth} ${normalizeNumber(height)}`);
    path.push(`L ${oneThirdWidth} ${twoThirdsHeight}`);
    path.push(`L 0 ${twoThirdsHeight}`);
    path.push(`L 0 ${oneThirdHeight}`);
    path.push(`L ${oneThirdWidth} ${oneThirdHeight}`);
    path.push(`L ${oneThirdWidth} 0`);
    return path.join(' ');
};
