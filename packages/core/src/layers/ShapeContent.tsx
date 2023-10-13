import React, { FC } from 'react';
import { LayerComponentProps, ShapeBorderStyle } from '../types';
import { getGradientBackground, getShapePath, GradientStyle, ShapeType } from '@lidojs/core';

export interface ShapeContentProps extends LayerComponentProps {
    shape: ShapeType;
    roundedCorners: number;
    color: string | null;
    gradientBackground: {
        colors: string[];
        style: GradientStyle;
    } | null;
    border: {
        style: ShapeBorderStyle;
        weight: number;
        color: string;
    } | null;
    scale: number;
}
export const ShapeContent: FC<ShapeContentProps> = ({
    boxSize,
    shape,
    color,
    gradientBackground,
    roundedCorners = 0,
    scale = 1,
    border,
}) => {
    const getDashArray = () => {
        switch (border?.style) {
            case 'longDashes':
                return `${border.weight * 6}, ${border.weight}`;
            case 'shortDashes':
                return `${border.weight * 3}, ${border.weight}`;
            case `dots`:
                return `${border.weight}, ${border.weight}`;
            default:
                return undefined;
        }
    };
    return (
        <div css={{ position: 'relative', width: boxSize.width / scale, height: boxSize.height / scale }}>
            <div
                css={{
                    clipPath: `path("${getShapePath(shape, {
                        width: boxSize.width / scale,
                        height: boxSize.height / scale,
                        roundedCorners,
                    })}")`,
                    width: '100%',
                    height: '100%',
                    background: gradientBackground
                        ? getGradientBackground(gradientBackground.colors, gradientBackground.style)
                        : color || '#fff',
                }}
            />
            {border && (
                <svg
                    viewBox={`0 0 ${boxSize.width / scale} ${boxSize.height / scale}`}
                    css={{ position: 'absolute', inset: 0 }}
                >
                    {roundedCorners && (
                        <defs>
                            <clipPath id="roundedCorners">
                                <path
                                    d={getShapePath(shape, {
                                        width: boxSize.width / scale,
                                        height: boxSize.height / scale,
                                        roundedCorners,
                                    })}
                                />
                            </clipPath>
                        </defs>
                    )}
                    <path
                        d={getShapePath(shape, {
                            width: boxSize.width / scale,
                            height: boxSize.height / scale,
                            roundedCorners,
                        })}
                        strokeLinecap={'butt'}
                        fill={'none'}
                        stroke={border.color}
                        strokeWidth={border.weight}
                        strokeDasharray={getDashArray()}
                        clipPath={`path("${getShapePath(shape, {
                            width: boxSize.width / scale,
                            height: boxSize.height / scale,
                            roundedCorners,
                        })}")`}
                    />
                </svg>
            )}
        </div>
    );
};
