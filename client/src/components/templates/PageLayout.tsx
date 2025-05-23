import React from 'react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Page Layout Template
 * Use this template as a starting point for new pages
 *
 * @param props.title - The page title
 * @param props.subtitle - Optional page subtitle
 * @param props.children - Page content
 * @param props.actions - Optional action buttons/controls
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  children,
  actions,
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
      <div className="bg-background rounded-lg border shadow-sm p-6">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
