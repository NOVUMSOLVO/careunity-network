import React from 'react';

interface FeatureComponentProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Feature Component Template
 * Use this template when creating new feature components
 *
 * @param props.title - The title of the feature component
 * @param props.description - Optional description of the feature
 * @param props.children - Child components to render
 */
export const FeatureComponent: React.FC<FeatureComponentProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {description && <p className="text-muted-foreground mb-4">{description}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
};

export default FeatureComponent;
