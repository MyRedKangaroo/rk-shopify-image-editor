import React, { FC, useState } from 'react';
import { useAsync } from 'react-use';
import axios from 'axios';
import XIcon from '@duyank/icons/regular/X';
import { isMobile } from 'react-device-detect';
import { useEditor } from '@lidojs/editor';
interface Frame {
    img: string;
    clipPath: string;
    width: number;
    height: number;
}
const FrameContent: FC<{ onClose: () => void }> = ({ onClose }) => {
    const [frames, setFrames] = useState<Frame[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { actions } = useEditor();
    useAsync(async () => {
        const response = await axios.get<Frame[]>('/frames');
        setFrames(response.data);
        setIsLoading(false);
    }, []);
    const addFrame = async (data: Frame) => {
        actions.addFrameLayer(data, data.clipPath);
        if (isMobile) {
            onClose();
        }
    };
    return (
        <div
            css={{
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                overflowY: 'auto',
                display: 'flex',
            }}
        >
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
                    Frames
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
                    onClick={onClose}
                >
                    <XIcon />
                </div>
            </div>
            <div css={{ flexDirection: 'column', overflowY: 'auto', display: 'flex' }}>
                <div
                    css={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                        gridGap: 8,
                        padding: '16px',
                    }}
                >
                    {isLoading && <div>Loading...</div>}
                    {frames.map((item, index) => (
                        <div
                            key={index}
                            css={{ cursor: 'pointer', position: 'relative' }}
                            onClick={() => addFrame(item)}
                        >
                            <div css={{ paddingBottom: '100%' }} />
                            <div
                                css={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <img
                                    src={item.img}
                                    css={{
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FrameContent;
