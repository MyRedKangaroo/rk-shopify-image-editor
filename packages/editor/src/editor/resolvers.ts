import ShapeLayer from '../layers/ShapeLayer';
import TextLayer from '../layers/TextLayer';
import ImageLayer from '../layers/ImageLayer';
import GroupLayer from '../layers/GroupLayer';
import { ElementType } from 'react';
import RootLayer from '../layers/RootLayer';

export const resolvers: Record<string, ElementType> = {
    RootLayer,
    ShapeLayer,
    TextLayer,
    ImageLayer,
    GroupLayer,
};
