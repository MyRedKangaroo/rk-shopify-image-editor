import { Delta } from '@lidojs/core';

export type DragCallback = (e: MouseEvent | TouchEvent, position: Delta) => void;
