import { normalizeNumber } from './normalize';

const ARROW_SIZE = 32;
export const getArrowPath = ({ width, height }: { width: number; height: number }) => {
    const oneFourthHeight = normalizeNumber(height / 4);
    const path = [`M ${normalizeNumber(width) - ARROW_SIZE} 0`];
    path.push(`L ${normalizeNumber(width)} ${normalizeNumber(height / 2)}`);
    path.push(`L ${normalizeNumber(width) - ARROW_SIZE} ${normalizeNumber(height)}`);
    path.push(`L ${normalizeNumber(width) - ARROW_SIZE} ${normalizeNumber(height - oneFourthHeight)}`);
    path.push(`L 0 ${normalizeNumber(height - oneFourthHeight)}`);
    path.push(`L 0 ${normalizeNumber(oneFourthHeight)}`);
    path.push(`L ${normalizeNumber(width) - ARROW_SIZE} ${normalizeNumber(oneFourthHeight)}`);
    path.push(`L  ${normalizeNumber(width) - ARROW_SIZE} 0`);
    return path.join(' ');
};
export const getArrowBottomPath = ({ width, height }: { width: number; height: number }) => {
    const oneFourthWidth = normalizeNumber(width / 4);
    const path = [`M ${normalizeNumber(oneFourthWidth)} 0`];
    path.push(`L ${normalizeNumber(width - oneFourthWidth)} 0`);
    path.push(`L ${normalizeNumber(width - oneFourthWidth)} ${normalizeNumber(height) - ARROW_SIZE}`);
    path.push(`L ${normalizeNumber(width)} ${normalizeNumber(height) - ARROW_SIZE}`);
    path.push(`L ${normalizeNumber(width / 2)} ${height}`);
    path.push(`L 0 ${normalizeNumber(height) - ARROW_SIZE}`);
    path.push(`L ${oneFourthWidth} ${normalizeNumber(height) - ARROW_SIZE}`);
    path.push(`L ${oneFourthWidth} 0`);
    return path.join(' ');
};
export const getArrowTopPath = ({ width, height }: { width: number; height: number }) => {
    const oneFourthWidth = width / 4;
    const path = [`M ${normalizeNumber(width / 2)} 0`];
    path.push(`L ${normalizeNumber(width)} ${ARROW_SIZE}`);
    path.push(`L ${normalizeNumber(width - oneFourthWidth)} ${ARROW_SIZE}`);
    path.push(`L ${normalizeNumber(width - oneFourthWidth)} ${normalizeNumber(height)}`);
    path.push(`L ${oneFourthWidth} ${normalizeNumber(height)}`);
    path.push(`L ${oneFourthWidth} ${ARROW_SIZE}`);
    path.push(`L 0 ${ARROW_SIZE}`);
    path.push(`L ${normalizeNumber(width / 2)} 0`);
    return path.join(' ');
};
export const getArrowLeftPath = ({ width, height }: { width: number; height: number }) => {
    const oneFourthHeight = normalizeNumber(height / 4);
    const path = [`M ${ARROW_SIZE} 0`];
    path.push(`L ${ARROW_SIZE} ${oneFourthHeight}`);
    path.push(`L ${normalizeNumber(width)} ${oneFourthHeight}`);
    path.push(`L ${normalizeNumber(width)} ${normalizeNumber(height) - oneFourthHeight}`);
    path.push(`L ${ARROW_SIZE} ${normalizeNumber(height) - oneFourthHeight}`);
    path.push(`L ${ARROW_SIZE} ${normalizeNumber(height)}`);
    path.push(`L 0 ${normalizeNumber(height / 2)}`);
    path.push(`L ${ARROW_SIZE} 0`);
    return path.join(' ');
};
export const getChevronPath = ({ width, height }: { width: number; height: number }) => {
    const arrowSize = ARROW_SIZE / 2;
    const halfHeight = normalizeNumber(height / 2);
    const path = [`M 0 0`];
    path.push(`L ${normalizeNumber(width) - arrowSize} 0`);
    path.push(`L ${normalizeNumber(width)} ${halfHeight}`);
    path.push(`L ${normalizeNumber(width) - arrowSize} ${height}`);
    path.push(`L 0 ${normalizeNumber(height)}`);
    path.push(`L ${arrowSize} ${halfHeight}`);
    path.push(`L 0 0`);
    return path.join(' ');
};

export const getArrowPentagonPath = ({ width, height }: { width: number; height: number }) => {
    const arrowSize = ARROW_SIZE / 2;
    const halfHeight = height / 2;
    const path = [`M 0 0`];
    path.push(`L ${width - arrowSize} 0`);
    path.push(`L ${width} ${halfHeight}`);
    path.push(`L ${width - arrowSize} ${height}`);
    path.push(`L 0 ${height}`);
    path.push(`L 0 0`);
    return path.join(' ');
};
