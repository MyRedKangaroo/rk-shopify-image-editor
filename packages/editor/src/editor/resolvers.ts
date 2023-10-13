import ShapeLayer from '../layers/ShapeLayer';
import TextLayer from '../layers/TextLayer';
import ImageLayer from '../layers/ImageLayer';
import GroupLayer from '../layers/GroupLayer';
import { ElementType } from 'react';
import FrameLayer from '../layers/FrameLayer';
import SvgLayer from '../layers/SvgLayer';
import RootLayer from '../layers/RootLayer';
import VideoLayer from '../layers/VideoLayer';

export const resolvers: Record<string, ElementType> = {
    RootLayer,
    ShapeLayer,
    TextLayer,
    ImageLayer,
    GroupLayer,
    FrameLayer,
    SvgLayer,
    VideoLayer,
};
