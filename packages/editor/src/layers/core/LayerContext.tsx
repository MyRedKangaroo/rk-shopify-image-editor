import React, { createContext, FC, PropsWithChildren } from 'react';
import { LayerId } from '@lidojs/core';

export const LayerContext = createContext<{ id: LayerId }>({} as { id: LayerId });

type LayerProviderProps = {
    id: LayerId;
};
const LayerProvider: FC<PropsWithChildren<LayerProviderProps>> = ({ id, children }) => {
    return <LayerContext.Provider value={{ id }}>{children}</LayerContext.Provider>;
};
export default LayerProvider;
