import React from 'react';
import clsx from 'clsx';

type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

export const Container: React.FC<ContainerProps> = ({ className, ...props }) => (
  <div
    className={clsx('mx-auto w-full max-w-screen-xl px-4 sm:px-6', className)}
    {...props}
  />
);

export default Container;
