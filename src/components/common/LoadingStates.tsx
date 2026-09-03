import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-[var(--accent)] border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, children, message }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative min-h-screen">
      {children}
      <div className="fixed inset-0 bg-[var(--bg-main)]/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center p-6">
          <LoadingSpinner size="lg" />
          {message && <p className="mt-4 text-[var(--text-muted)]">{message}</p>}
        </div>
      </div>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  const baseStyles = 'animate-pulse bg-[var(--border-color)] rounded';
  const variantStyles = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <div className="group bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
    <Skeleton variant="rectangular" className="aspect-square w-full" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      <Skeleton variant="text" className="w-1/3" />
      <Skeleton variant="rectangular" className="w-full h-10 mt-2" />
    </div>
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="space-y-8 p-6">
    <div className="space-y-3">
      <Skeleton variant="text" className="w-1/4 h-8" />
      <Skeleton variant="text" className="w-1/2 h-6" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const StorefrontSkeleton: React.FC = () => (
  <div className="space-y-4 px-3 pb-12 pt-4 sm:space-y-5 sm:px-4">
    <div className="h-8 rounded-xl bg-[var(--border-color)]" />
    <div className="grid gap-5 rounded-2xl border border-[var(--border-color)] p-5 sm:p-8 md:grid-cols-[1fr_38%]">
      <div className="space-y-4">
        <Skeleton variant="text" className="h-3 w-2/5" />
        <Skeleton variant="text" className="h-12 w-11/12" />
        <Skeleton variant="text" className="h-10 w-4/5" />
        <Skeleton variant="rectangular" className="h-11 w-36" />
      </div>
      <Skeleton variant="rectangular" className="aspect-[4/3] w-full" />
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[...Array(4)].map((_, index) => <ProductCardSkeleton key={index} />)}
    </div>
  </div>
);