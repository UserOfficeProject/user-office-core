import LinearProgress from '@mui/material/LinearProgress';
import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
}) => {
  const getContainerStyle = (): React.CSSProperties => {
    return isLoading
      ? {
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.5,
          minHeight: '380px',
        }
      : {};
  };

  return (
    <div style={getContainerStyle()}>
      {isLoading && <LinearProgress />}
      {children}
    </div>
  );
};

export default LoadingOverlay;
