import React, { useCallback, useEffect, useState } from 'react';
import Page from './Page';
import { useEditor } from '../hooks';
import CaretLeftIcon from '@duyank/icons/regular/CaretLeft';
import CaretRightIcon from '@duyank/icons/regular/CaretRight';
import { GlobalStyle } from '@lidojs/core';
import { useUsedFont } from '../layers/hooks/useUsedFont';

type Interval = ReturnType<typeof setTimeout>;
let timeout: Interval;
const Preview = () => {
    const { pages, pageSize } = useEditor((state) => ({ pages: state.pages, pageSize: state.pageSize }));
    const [activeSlide, setActiveSlide] = useState(0);
    const [size, setSize] = useState({ width: 0, height: 0, scale: 1 });
    const { usedFonts } = useUsedFont();
    const moveSlide = useCallback(
        (number: number) => {
            setActiveSlide((prevState) => {
                const value = (prevState + number) % pages.length;
                if (value >= 0) {
                    return value;
                } else {
                    return pages.length + value;
                }
            });
        },
        [setActiveSlide, pages.length],
    );
    useEffect(() => {
        timeout = setTimeout(() => {
            moveSlide(1);
        }, 5000);
        return () => {
            clearTimeout(timeout);
        };
    }, [moveSlide, activeSlide]);

    useEffect(() => {
        const updateSize = () => {
            const { clientWidth, clientHeight } = window.document.body;
            const ratio = clientWidth / clientHeight;
            const pageRatio = pageSize.width / pageSize.height;
            if (ratio > pageRatio) {
                const w = clientHeight * pageRatio;
                setSize({
                    width: w,
                    height: clientHeight,
                    scale: w / pageSize.width,
                });
            } else {
                const w = clientWidth;
                const h = w / pageRatio;
                setSize({
                    width: w,
                    height: h,
                    scale: w / pageSize.width,
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, [pageSize]);

    if (size.width === 0) {
        return null;
    }

    return (
        <div
            css={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <GlobalStyle fonts={usedFonts} />
            <div
                css={{ position: 'absolute', top: '50%', transform: 'translate(0, -50%)', left: '16px', zIndex: 1050 }}
            >
                <div
                    css={{
                        border: '1px solid #fff',
                        background: 'rgba(255,255,255,0.3)',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        color: '#fff',
                        borderRadius: '50%',
                        cursor: 'pointer',
                    }}
                    onClick={() => moveSlide(-1)}
                >
                    <CaretLeftIcon />
                </div>
            </div>
            <div
                css={{ position: 'absolute', top: '50%', transform: 'translate(0, -50%)', right: '16px', zIndex: 1050 }}
            >
                <div
                    css={{
                        border: '1px solid #fff',
                        background: 'rgba(255,255,255,0.3)',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        color: '#fff',
                        borderRadius: '50%',
                        cursor: 'pointer',
                    }}
                    onClick={() => moveSlide(1)}
                >
                    <CaretRightIcon />
                </div>
            </div>
            <div css={{ width: size.width, height: size.height }}>
                <div css={{ position: 'relative' }}>
                    {pages.map((page, index) => (
                        <div key={index}>
                            <Page
                                pageIndex={index}
                                width={pageSize.width}
                                height={pageSize.height}
                                scale={size.scale}
                                isActive={activeSlide === index}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Preview;
