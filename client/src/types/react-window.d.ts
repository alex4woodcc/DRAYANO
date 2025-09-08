/**
 * Minimal type declarations for `react-window` used to virtualize encounter
 * tables without pulling in the full `@types` package.
 */
declare module 'react-window' {
  import * as React from 'react';
  export type ListChildComponentProps = {
    index: number;
    style: React.CSSProperties;
  };
  export interface FixedSizeListProps {
    height: number;
    itemCount: number;
    itemSize: number;
    width: number | string;
    outerElementType?: React.ElementType;
    children: (props: ListChildComponentProps) => React.ReactNode;
  }
  export const FixedSizeList: React.ComponentType<FixedSizeListProps>;
}
