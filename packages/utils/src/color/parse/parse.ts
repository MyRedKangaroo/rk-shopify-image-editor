import { HSVAColor } from '../types';
import { parseRgba, rgbColorRegex } from './parse-rgba';
import { rgb2hsv } from '@lidojs/utils';
import { hexColorRegex, parseHex } from './parse-hex';

export const parseColor = (color: string): HSVAColor => {
    let rgbColor;
    if (rgbColorRegex.test(color)) {
        rgbColor = parseRgba(color);
    } else if (hexColorRegex.test(color)) {
        rgbColor = parseHex(color);
    }

    if (rgbColor) {
        return rgb2hsv(rgbColor);
    }
    throw new Error(`Cannot parse ${color}`);
};
