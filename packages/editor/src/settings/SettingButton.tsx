import React, { forwardRef, ForwardRefRenderFunction, HTMLProps, PropsWithChildren } from 'react';
interface SettingButtonProps extends HTMLProps<HTMLDivElement> {
    isActive?: boolean;
}
const SettingButton: ForwardRefRenderFunction<HTMLDivElement, PropsWithChildren<SettingButtonProps>> = (
    { children, isActive, disabled, onClick, ...props },
    ref,
) => {
    return (
        <div
            ref={ref}
            css={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                height: 32,
                padding: '0 4px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                backgroundColor: isActive ? 'rgba(57,76,96,.15)' : '#fff',
                color: disabled ? 'rgba(36,49,61,.4)' : undefined,
                whiteSpace: 'nowrap',
                ':hover': {
                    backgroundColor: disabled ? undefined : 'rgba(64,87,109,.07)',
                },
            }}
            onClick={(e) => !disabled && onClick && onClick(e)}
            {...props}
        >
            {children}
        </div>
    );
};
export default forwardRef<HTMLDivElement, PropsWithChildren<SettingButtonProps>>(SettingButton);
