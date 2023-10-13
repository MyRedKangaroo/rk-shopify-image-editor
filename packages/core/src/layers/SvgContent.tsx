import React, { FC, useState } from 'react';
import { LayerComponentProps } from '../types';
import { useAsync } from 'react-use';
import { Color, fetchSvgContent } from '@lidojs/utils';

export interface SvgContentProps extends LayerComponentProps {
    image: string;
    colors: string[];
}
export const SvgContent: FC<SvgContentProps> = ({ image, boxSize, colors }) => {
    const [url, setUrl] = useState<string>();
    useAsync(async () => {
        const ele = await fetchSvgContent(image);
        ele.style.fill = '';
        ele.style.stroke = '';
        const list = ele.getElementsByTagName('g');
        if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                const id = list[i].getAttribute('id');
                if (id) {
                    const verifyId = id.match(/^[a-z]+(\d+)(_)*(\d*)$/i);
                    if (verifyId && verifyId.length >= 2) {
                        //correct id format
                        const colorIndex = parseInt(verifyId[1], 10) - 1;
                        const paths = list[i].querySelectorAll(
                            'path, circle, ellipse,line, rect, polygon,polyline, text',
                        ) as unknown as NodeListOf<HTMLElement>;
                        for (let j = 0; j < paths.length; j++) {
                            const stroke = paths[j].getAttribute('stroke') || 'none';
                            paths[j].style.fill = '';
                            paths[j].style.stroke = '';
                            if (stroke !== 'none') {
                                paths[j].setAttribute('stroke', colors[colorIndex] || '#000000');
                            } else {
                                paths[j].setAttribute('fill', colors[colorIndex] || '#000000');
                            }
                        }
                    }
                }
            }
        } else {
            const originalColorList: string[] = [];
            const paths = ele.querySelectorAll(
                'path, circle, ellipse,line, rect, polygon,polyline, text',
            ) as unknown as NodeListOf<HTMLElement>;
            for (let j = 0; j < paths.length; j++) {
                const style = paths[j].getAttribute('style');
                let stroke = paths[j].getAttribute('stroke') || 'none';
                let fill = paths[j].getAttribute('fill') || '#000000';
                const styleObj: Record<string, string> = {};
                if (style) {
                    const styleList = style.split(';');
                    styleList.forEach((attr) => {
                        const [key, value] = attr.split(':');
                        styleObj[key.trim()] = value.trim();
                    });
                }
                if (styleObj.stroke) {
                    stroke = styleObj.stroke;
                }
                if (styleObj.fill) {
                    fill = styleObj.fill;
                }
                if (stroke && stroke !== 'none') {
                    if (!originalColorList.includes(new Color(stroke).toRgbString())) {
                        originalColorList.push(new Color(stroke).toRgbString());
                    }
                    paths[j].style.fill = '';
                    paths[j].style.stroke = '';
                    paths[j].setAttribute(
                        'stroke',
                        colors[originalColorList.indexOf(new Color(stroke).toRgbString())] || '#000000',
                    );
                } else if (fill && fill !== 'none') {
                    if (!originalColorList.includes(new Color(fill).toRgbString())) {
                        originalColorList.push(new Color(fill).toRgbString());
                    }
                    paths[j].style.fill = '';
                    paths[j].style.stroke = '';
                    paths[j].setAttribute(
                        'fill',
                        colors[originalColorList.indexOf(new Color(fill).toRgbString())] || '#000000',
                    );
                }
            }
        }
        const svgBlob = new Blob([ele.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        setUrl(svgUrl);
    }, [image, colors]);

    return (
        <div css={{ width: '100%', height: '100%' }}>
            {image && (
                <div
                    css={{
                        width: boxSize.width,
                        height: boxSize.height,
                        position: 'relative',
                        userSelect: 'none',
                    }}
                >
                    <img
                        src={url}
                        crossOrigin={'anonymous'}
                        css={{
                            objectFit: 'fill',
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            pointerEvents: 'none',
                        }}
                    />
                </div>
            )}
        </div>
    );
};
