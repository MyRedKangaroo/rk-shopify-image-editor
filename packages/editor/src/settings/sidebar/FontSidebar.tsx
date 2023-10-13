import React, {
    FormEvent,
    forwardRef,
    ForwardRefRenderFunction,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { EditorContext } from '../../editor/EditorContext';
import Sidebar, { SidebarProps } from './Sidebar';
import FontStyle from './FontStyle';
import CheckIcon from '@duyank/icons/regular/Check';
import { useEditor } from '../../hooks';
import { useAsync } from 'react-use';
import { useUsedFont } from '../../layers/hooks/useUsedFont';
import MagnifyingGlassIcon from '@duyank/icons/regular/MagnifyingGlass';
import XIcon from '@duyank/icons/regular/X';
import { FontData } from '@lidojs/core';

interface FontSidebarProps extends SidebarProps {
    selected: FontData[];
    onChangeFontFamily: (font: FontData) => void;
}
const FontSidebar: ForwardRefRenderFunction<HTMLDivElement, FontSidebarProps> = (
    { selected, onChangeFontFamily, ...props },
    ref,
) => {
    const dataRef = useRef(false);
    const qRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { getFonts } = useContext(EditorContext);
    const { usedFonts } = useUsedFont();
    const { actions, fontList } = useEditor((state) => ({ fontList: state.fontList }));
    const [isLoading, setIsLoading] = useState(false);
    const [keyword, setKeyword] = useState('');

    const loadFontList = useCallback(
        async (offset = 0) => {
            dataRef.current = true;
            setIsLoading(true);
            const res = await getFonts({ limit: 30 + '', offset: offset + '', q: keyword });
            if (offset) {
                actions.appendFontList(res);
            } else {
                actions.setFontList(res);
            }
            setIsLoading(false);
            if (res.length > 0) {
                dataRef.current = false;
            }
        },
        [getFonts, actions, setIsLoading, keyword],
    );

    useAsync(async () => {
        await loadFontList();
    }, [loadFontList]);

    useEffect(() => {
        const handleLoadMore = async (e: Event) => {
            const node = e.target as HTMLDivElement;
            if (node.scrollHeight - node.scrollTop - 80 <= node.clientHeight && !dataRef.current) {
                await loadFontList(fontList.length);
            }
        };
        scrollRef.current?.addEventListener('scroll', handleLoadMore);
        return () => {
            scrollRef.current?.removeEventListener('scroll', handleLoadMore);
        };
    }, [loadFontList, fontList]);

    const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
        setKeyword(qRef.current?.value || '');
        await loadFontList(0);
    };

    return (
        <Sidebar ref={ref} {...props}>
            <FontStyle />
            <div css={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
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
                        Font
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
                <div css={{ borderRadius: 4, boxShadow: '0 0 0 1px rgba(43,59,74,.3)', margin: 16 }}>
                    <div
                        css={{ height: 40, borderRadius: 4, padding: '0 12px', display: 'flex', alignItems: 'center' }}
                    >
                        <div css={{ fontSize: 24, marginRight: 8, flexShrink: 0 }}>
                            <MagnifyingGlassIcon />
                        </div>
                        <form onSubmit={handleSearch}>
                            <input ref={qRef} type={'text'} css={{ width: '100%', height: '100%' }} />
                        </form>
                    </div>
                </div>
                <div ref={scrollRef} css={{ flexGrow: 1, overflowY: 'auto' }}>
                    <div css={{ padding: '16px 20px', fontWeight: 700 }}>Document fonts</div>
                    {usedFonts.map((font) => (
                        <div
                            key={font.name}
                            css={{
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                padding: '0 24px',
                                ':hover': {
                                    background: '#F9F9F9',
                                },
                            }}
                            onClick={() => onChangeFontFamily(font)}
                        >
                            <span css={{ fontFamily: font.name }}>{font.name}</span>
                            {selected.map((s) => s.name).includes(font.name) && (
                                <span>
                                    <CheckIcon />
                                </span>
                            )}
                        </div>
                    ))}
                    <div css={{ borderTop: '1px solid rgba(217, 219, 228, 0.6)' }}>
                        <div css={{ padding: '16px 20px', fontWeight: 700 }}>Fonts</div>
                        {fontList.map((font) => (
                            <div
                                key={font.name}
                                css={{
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    padding: '0 24px',
                                    ':hover': {
                                        background: '#F9F9F9',
                                    },
                                }}
                                onClick={() => onChangeFontFamily(font)}
                            >
                                <span css={{ fontFamily: font.name }}>{font.name}</span>
                                {selected.map((s) => s.name).includes(font.name) && (
                                    <span>
                                        <CheckIcon />
                                    </span>
                                )}
                            </div>
                        ))}
                        {isLoading && <div>Loading...</div>}
                    </div>
                </div>
            </div>
        </Sidebar>
    );
};

export default forwardRef<HTMLDivElement, FontSidebarProps>(FontSidebar);
