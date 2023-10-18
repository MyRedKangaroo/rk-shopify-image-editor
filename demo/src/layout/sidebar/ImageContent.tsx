import React, { FC, useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import axios from 'axios';
import { getThumbnail } from '../../utils/thumbnail';
import XIcon from '@duyank/icons/regular/X';
import { isMobile } from 'react-device-detect';
import * as Sentry from '@sentry/react';
import { useEditor } from '@lidojs/editor';
import { RotatingLines } from 'react-loader-spinner';
const ImageContent: FC<{ onClose: () => void }> = ({ onClose }) => {
    const [images, setImages] = useState<{ img: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useAsync(async () => {
        const response = await axios.get<{ img: string }[]>('/images');
        setImages(response.data);
        setIsLoading(false);
    }, []);
    const { actions } = useEditor();


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
                    Images
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
                        padding: '16px',
                        gridGap: 8,
                    }}
                >
                    {isLoading && <div>Loading...</div>}
                    {images.map((item, idx) => (
                        <ImageComponent item={item} onClose={onClose} actions={actions} key={`${idx}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImageContent;

const ImageComponent: FC<{ onClose: () => void; item: any; actions: any }> = ({ item, onClose, actions }) => {
    const [loading, setLoading] = useState(false);

    const addImage = useCallback(async () => {
        setLoading(true);
        const thumb = getThumbnail(item.img);
        const url = item.img;
        const img = new Image();
        img.onerror = (err) => {
            Sentry.captureException(err);
            window.alert(err);
        };
        img.src = url;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            actions.addImageLayer({ thumb, url }, { width: img.naturalWidth, height: img.naturalHeight });
            onClose();
            setLoading(false);
        };
    }, []);

    return (
        <>
            {loading ? (
                <div style={{
                    width: "100%",
                    height: "98px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <RotatingLines
                        strokeColor="grey"
                        strokeWidth="5"
                        animationDuration="0.75"
                        width="32px"
                        visible={true}
                    />
                </div>
            ) : (
                <div
                    css={{ cursor: 'pointer', position: 'relative', paddingBottom: '100%', width: '100%' }}
                    onClick={() => addImage()}
                >
                    <img
                        src={getThumbnail(item.img)}
                        loading="lazy"
                        css={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </div>
            )}
        </>
    );
}
