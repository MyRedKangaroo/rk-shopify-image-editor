import { normalizeNumber } from './normalize';

export const getHexagonVerticalPath = ({ width, height }: { width: number; height: number }) => {
    const oneFourthHeight = normalizeNumber(height * 0.25);
    const path = [`M ${normalizeNumber(width / 2)} 0`];
    path.push(`L ${normalizeNumber(width)} ${oneFourthHeight}`);
    path.push(`L ${normalizeNumber(width)} ${normalizeNumber(height) - oneFourthHeight}`);
    path.push(`L ${normalizeNumber(width / 2)} ${normalizeNumber(height)}`);
    path.push(`L 0 ${normalizeNumber(height - oneFourthHeight)}`);
    path.push(`L 0 ${oneFourthHeight}`);
    path.push(`L ${normalizeNumber(width / 2)} 0`);
    return path.join(' ');
};
export const getHexagonHorizontalPath = ({ width, height }: { width: number; height: number }) => {
    const oneFourthWidth = normalizeNumber(width * 0.25);
    const path = [`M ${oneFourthWidth} 0`];
    path.push(`L ${normalizeNumber(width) - oneFourthWidth} 0`);
    path.push(`L ${normalizeNumber(width)} ${normalizeNumber(height / 2)}`);
    path.push(`L ${normalizeNumber(width - oneFourthWidth)} ${normalizeNumber(height)}`);
    path.push(`L ${oneFourthWidth} ${normalizeNumber(height)}`);
    path.push(`L 0 ${normalizeNumber(height / 2)}`);
    path.push(`L ${oneFourthWidth} 0`);
    return path.join(' ');
};
