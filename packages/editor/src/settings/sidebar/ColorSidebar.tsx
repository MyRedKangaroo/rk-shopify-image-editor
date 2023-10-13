import React, { forwardRef, ForwardRefRenderFunction, useMemo, useState } from 'react';
import Sidebar, { SidebarProps } from './Sidebar';
import { isRootLayer, isShapeLayer, isSvgLayer, isTextLayer } from '../../ultils/layer/layers';
import PlusIcon from '@duyank/icons/regular/Plus';
import { isEqual, uniq, uniqWith } from 'lodash';
import { useEditor } from '../../hooks';
import XIcon from '@duyank/icons/regular/X';
import GradientPicker from './GradientPicker';
import ColorPickerPopover from './ColorPickerPopover';
import { defaultColors } from '../default-colors';
import { Color, hex2rgbString } from '@lidojs/utils';
import { ColorIcon } from '@lidojs/color-picker';
import { getGradientBackground, GradientStyle } from '@lidojs/core';

interface ColorSidebarProps extends SidebarProps {
    selected: string | null;
    gradient?: { colors: string[]; style: GradientStyle } | null;
    useGradient?: boolean;
    onSelect: (color: string) => void;
    onChangeGradient?: (gradient: { colors: string[]; style: GradientStyle }) => void;
}

const ColorSidebar: ForwardRefRenderFunction<HTMLDivElement, ColorSidebarProps> = (
    { selected, gradient, useGradient, onSelect, onChangeGradient, ...props },
    ref,
) => {
    const [customColor, setCustomColor] = useState<string | null>(null);
    const [customGradientColor, setCustomGradientColor] = useState<{ colors: string[]; style: GradientStyle } | null>(
        null,
    );
    const [selectedColor] = useState(selected);
    const { actions, state } = useEditor();

    const documentColors = useMemo(() => {
        return state.pages.reduce((acc, page) => {
            Object.entries(page.layers).forEach(([, layer]) => {
                if (isRootLayer(layer) && layer.data.props.color) {
                    acc.push(layer.data.props.color);
                } else if (isShapeLayer(layer) && layer.data.props.color) {
                    acc.push(layer.data.props.color);
                } else if (isTextLayer(layer)) {
                    acc.push(...layer.data.props.colors);
                } else if (isSvgLayer(layer)) {
                    acc.push(...layer.data.props.colors);
                }
            });
            return uniq(acc);
        }, [] as string[]);
    }, []);
    const documentGradientColors = useMemo(() => {
        const list = state.pages.reduce((acc, page) => {
            Object.entries(page.layers).forEach(([, layer]) => {
                if (isRootLayer(layer) && layer.data.props.gradientBackground) {
                    acc.push(layer.data.props.gradientBackground);
                } else if (isShapeLayer(layer) && layer.data.props.gradientBackground) {
                    acc.push(layer.data.props.gradientBackground);
                }
            });
            return acc;
        }, [] as { colors: string[]; style: GradientStyle }[]);
        return uniqWith(list, isEqual);
    }, []);

    const docColorList = useMemo(() => {
        if (!customColor) {
            return documentColors;
        } else {
            const idx = documentColors.findIndex((c) => selectedColor && c === new Color(selectedColor).toRgbString());
            return uniq([
                ...documentColors.slice(0, idx),
                customColor,
                ...documentColors.slice(idx, documentColors.length),
            ]);
        }
    }, [documentColors, customColor, selectedColor]);

    const docGradientList = useMemo(() => {
        if (!customGradientColor) {
            return documentGradientColors;
        } else {
            const idx = documentGradientColors.findIndex((c) => isEqual(c, gradient));
            return uniqWith(
                [
                    ...documentGradientColors.slice(0, idx),
                    customGradientColor,
                    ...documentGradientColors.slice(idx, documentGradientColors.length),
                ],
                isEqual,
            );
        }
    }, [documentGradientColors, customGradientColor, gradient]);

    const handleSelectColor = (c: string) => {
        if (!isEqual(c, customColor)) {
            setCustomColor(null);
            setCustomGradientColor(null);
        }
        onSelect(new Color(c).toRgbString());
    };

    const handleSelectGradient = (g: { colors: string[]; style: GradientStyle }) => {
        if (!isEqual(g, customGradientColor)) {
            setCustomColor(null);
            setCustomGradientColor(null);
        }
        onChangeGradient && onChangeGradient(g);
    };

    const handleSelectCustomColor = (color: string) => {
        setCustomColor(color);
        setCustomGradientColor(null);
        onSelect(color);
    };
    const handleSelectCustomGradient = (data: { colors: string[]; style: GradientStyle }) => {
        setCustomColor(null);
        setCustomGradientColor(data);
        onChangeGradient && onChangeGradient(data);
    };

    return (
        <Sidebar ref={ref} {...props}>
            <div
                css={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    height: 48,
                    borderBottom: '1px solid rgba(57,76,96,.15)',
                    padding: '0 20px',
                }}
            >
                <p
                    css={{
                        lineHeight: '48px',
                        fontWeight: 600,
                        color: '#181C32',
                        flexGrow: 1,
                    }}
                >
                    Colors
                </p>
                <div
                    css={{
                        fontSize: 20,
                        flexShrink: 0,
                        width: 32,
                        height: 32,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onClick={() => {
                        actions.setSidebar();
                    }}
                >
                    <XIcon />
                </div>
            </div>
            <div css={{ padding: '0 20px', display: 'grid', rowGap: 24 }}>
                <div>
                    <div css={{ padding: '8px 0', fontWeight: 700 }}>Document colors</div>
                    <div
                        css={{
                            display: 'grid',
                            gridGap: 12,
                            gridTemplateColumns: `repeat(${defaultColors[0].length},minmax(0,1fr))`,
                        }}
                    >
                        {useGradient && onChangeGradient && (
                            <GradientPicker
                                selectedColor={new Color(customColor || selected || '#f25022').toHex()}
                                event={'click'}
                                gradient={customGradientColor || gradient}
                                onChangeColor={(color) => {
                                    handleSelectCustomColor(new Color(color).toRgbString());
                                }}
                                onChangeGradient={handleSelectCustomGradient}
                            >
                                <div css={{ paddingBottom: '100%', position: 'relative', width: '100%' }}>
                                    <div
                                        css={{
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                                            width: '100%',
                                            height: '100%',
                                            position: 'absolute',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <div
                                            css={{
                                                fontSize: 16,
                                                width: 24,
                                                height: 24,
                                                background: '#fff',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <PlusIcon />
                                        </div>
                                    </div>
                                </div>
                            </GradientPicker>
                        )}
                        {!useGradient && (
                            <ColorPickerPopover
                                color={selectedColor || '#f25022'}
                                event={'click'}
                                onChange={handleSelectColor}
                            >
                                <div css={{ paddingBottom: '100%', position: 'relative', width: '100%' }}>
                                    <div
                                        css={{
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                                            width: '100%',
                                            height: '100%',
                                            position: 'absolute',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <div
                                            css={{
                                                fontSize: 16,
                                                width: 24,
                                                height: 24,
                                                background: '#fff',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <PlusIcon />
                                        </div>
                                    </div>
                                </div>
                            </ColorPickerPopover>
                        )}
                        {docColorList.map((color, i) => {
                            const child = (
                                <ColorIcon
                                    color={color}
                                    selected={selected}
                                    onClick={() => selected !== color && handleSelectColor(color)}
                                />
                            );
                            if (useGradient && onChangeGradient) {
                                return (
                                    <GradientPicker
                                        key={i}
                                        selectedColor={new Color(customColor || selected || '#f25022').toHex()}
                                        event={'doubleClick'}
                                        gradient={customGradientColor || gradient}
                                        onChangeColor={(color) => {
                                            const c = hex2rgbString(color);
                                            handleSelectCustomColor(c);
                                        }}
                                        onChangeGradient={handleSelectCustomGradient}
                                    >
                                        {child}
                                    </GradientPicker>
                                );
                            } else {
                                return (
                                    <ColorPickerPopover
                                        key={i}
                                        color={selectedColor || '#f25022'}
                                        event={'doubleClick'}
                                        onChange={handleSelectColor}
                                    >
                                        {child}
                                    </ColorPickerPopover>
                                );
                            }
                        })}
                        {useGradient &&
                            onChangeGradient &&
                            docGradientList.map((c, i) => (
                                <GradientPicker
                                    key={i}
                                    selectedColor={new Color(customColor || selected || '#f25022').toHex()}
                                    event={'doubleClick'}
                                    gradient={customGradientColor || gradient}
                                    onChangeColor={(color) => {
                                        const c = hex2rgbString(color);
                                        handleSelectCustomColor(c);
                                    }}
                                    onChangeGradient={handleSelectCustomGradient}
                                >
                                    <ColorIcon
                                        color={getGradientBackground(c.colors, c.style)}
                                        selected={
                                            (gradient && getGradientBackground(gradient.colors, gradient.style)) || null
                                        }
                                        onClick={() => handleSelectGradient(c)}
                                    />
                                </GradientPicker>
                            ))}
                    </div>
                </div>
                <div css={{ borderTop: '1px solid rgba(217, 219, 228, 0.6)' }}>
                    <div css={{ padding: '8px 0', fontWeight: 700 }}>Default Colors</div>

                    <div
                        css={{
                            display: 'grid',
                            gridGap: 12,
                            gridTemplateColumns: `repeat(${defaultColors[0].length},minmax(0,1fr))`,
                        }}
                    >
                        {defaultColors.map((colorList) =>
                            colorList.map((c, ci) => (
                                <ColorIcon
                                    key={ci}
                                    color={c}
                                    selected={selected}
                                    onClick={() => handleSelectColor(c)}
                                />
                            )),
                        )}
                    </div>
                </div>
            </div>
        </Sidebar>
    );
};

export default forwardRef<HTMLDivElement, ColorSidebarProps>(ColorSidebar);
