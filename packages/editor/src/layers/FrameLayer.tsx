import React, { useContext, useEffect, useState } from 'react';
import { useEditor, useLayer, useSelectedLayers } from '../hooks';
import { EditorContext } from '../editor/EditorContext';
import { BoxSize, Delta, FrameContent, FrameContentProps } from '@lidojs/core';
import { LayerComponent } from '@lidojs/editor';

export interface FrameLayerProps extends FrameContentProps {
    image: {
        url: string;
        thumb: string;
        position: Delta;
        rotate: number;
        boxSize: BoxSize;
    } | null;
}
const FrameLayer: LayerComponent<FrameLayerProps> = ({
    clipPath,
    image,
    color,
    gradientBackground,
    boxSize,
    position,
    rotate,
    scale,
}) => {
    const { config } = useContext(EditorContext);
    const { actions, pageIndex, id } = useLayer();
    const { selectedLayerIds } = useSelectedLayers();
    const { imageEditor } = useEditor((state) => ({ imageEditor: state.imageEditor }));
    const [imageData, setImageData] = useState<FrameLayerProps['image']>(null);
    useEffect(() => {
        if (image) {
            const img = new Image();
            img.onload = () => {
                setImageData((prevState) => {
                    if (prevState) {
                        return { ...prevState, url: img.src };
                    }
                    return prevState;
                });
            };
            img.src = image.url;
        }
    }, [image]);

    useEffect(() => {
        const getImageSetting = () => {
            const imgRatio = config.frame.defaultImage.width / config.frame.defaultImage.height;
            const boxRatio = boxSize.width / boxSize.height;
            const w = imgRatio > boxRatio ? (boxSize.height / scale) * imgRatio : boxSize.width / scale;
            const h = imgRatio > boxRatio ? boxSize.height / scale : (boxSize.width / scale) * imgRatio;
            const res: FrameLayerProps['image'] = {
                boxSize: {
                    width: w,
                    height: h,
                },
                position: {
                    x: -(w - boxSize.width / scale) / 2,
                    y: -(h - boxSize.height / scale) / 2,
                },
                rotate: 0,
                url: config.frame.defaultImage.url,
                thumb: config.frame.defaultImage.url,
            };
            return res;
        };
        if (!image && !color && !gradientBackground) {
            setImageData(getImageSetting());
        } else {
            setImageData(image);
        }
    }, [image, color, gradientBackground]);

    const openEditor = () => {
        if (image && selectedLayerIds.includes(id)) {
            actions.openImageEditor({
                boxSize,
                position,
                rotate,
                image: {
                    boxSize: {
                        width: image.boxSize.width * scale,
                        height: image.boxSize.height * scale,
                    },
                    position: {
                        x: image.position.x * scale,
                        y: image.position.y * scale,
                    },
                    rotate: image.rotate || 0,
                    url: image.url,
                },
            });
        }
    };
    return (
        <div
            css={{
                transformOrigin: '0 0',
            }}
            style={{
                width: boxSize.width / scale,
                height: boxSize.height / scale,
                transform: `scale(${scale})`,
                visibility:
                    imageEditor && imageEditor.pageIndex === pageIndex && imageEditor.layerId === id
                        ? 'hidden'
                        : undefined,
            }}
            onDoubleClick={openEditor}
        >
            <FrameContent
                clipPath={clipPath}
                scale={scale}
                color={color}
                gradientBackground={gradientBackground}
                image={imageData}
                boxSize={boxSize}
                rotate={rotate}
                position={position}
            />
        </div>
    );
};

FrameLayer.info = {
    name: 'Frame',
    type: 'Frame',
};
export default FrameLayer;
