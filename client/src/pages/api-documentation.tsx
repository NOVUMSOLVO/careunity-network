/**
 * API Documentation Page
 *
 * A mobile-responsive page that displays the API documentation using Swagger UI.
 */

import React, { useState, useEffect } from 'react';
import { useDevice } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Code, FileText, Search, Server } from 'lucide-react';
import { InteractiveApiPlayground } from '@/components/api/interactive-api-playground';

export default function ApiDocumentationPage() {
  const { isMobile } = useDevice();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);

  // Simulate loading the API documentation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Open Swagger UI in a new tab
  const openSwaggerUI = () => {
    window.open('/api-docs', '_blank');
  };

  // Open static API documentation in a new tab
  const openStaticDocs = () => {
    window.open('/api-reference.html', '_blank');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-gray-500 mt-1">
            Explore and test the CareUnity API endpoints
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={openSwaggerUI}
          >
            <Code size={16} />
            <span>Swagger UI</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={openStaticDocs}
          >
            <FileText size={16} />
            <span>Static Docs</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - API Categories */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Browse API categories</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search endpoints..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100vh-300px)] overflow-auto">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <CategoryItem
                    title="Authentication"
                    count={2}
                    active={activeEndpoint === 'auth'}
                    onClick={() => setActiveEndpoint('auth')}
                  />
                  <CategoryItem
                    title="Service Users"
                    count={6}
                    active={activeEndpoint === 'service-users'}
                    onClick={() => setActiveEndpoint('service-users')}
                  />
                  <CategoryItem
                    title="Care Plans"
                    count={5}
                    active={activeEndpoint === 'care-plans'}
                    onClick={() => setActiveEndpoint('care-plans')}
                  />
                  <CategoryItem
                    title="Goals"
                    count={3}
                    active={activeEndpoint === 'goals'}
                    onClick={() => setActiveEndpoint('goals')}
                  />
                  <CategoryItem
                    title="Tasks"
                    count={4}
                    active={activeEndpoint === 'tasks'}
                    onClick={() => setActiveEndpoint('tasks')}
                  />
                  <CategoryItem
                    title="ML Models"
                    count={8}
                    active={activeEndpoint === 'ml-models'}
                    onClick={() => setActiveEndpoint('ml-models')}
                  />
                  <CategoryItem
                    title="Visits"
                    count={6}
                    active={activeEndpoint === 'visits'}
                    onClick={() => setActiveEndpoint('visits')}
                  />
                  <CategoryItem
                    title="Documents"
                    count={5}
                    active={activeEndpoint === 'documents'}
                    onClick={() => setActiveEndpoint('documents')}
                  />
                  <CategoryItem
                    title="Family Portal"
                    count={4}
                    active={activeEndpoint === 'family-portal'}
                    onClick={() => setActiveEndpoint('family-portal')}
                  />
                  <CategoryItem
                    title="External Integration"
                    count={3}
                    active={activeEndpoint === 'external-integration'}
                    onClick={() => setActiveEndpoint('external-integration')}
                  />
                  <CategoryItem
                    title="Monitoring"
                    count={5}
                    active={activeEndpoint === 'monitoring'}
                    onClick={() => setActiveEndpoint('monitoring')}
                  />
                  <CategoryItem
                    title="Sync"
                    count={6}
                    active={activeEndpoint === 'sync'}
                    onClick={() => setActiveEndpoint('sync')}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - API Details */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="mt-6">
                  <Skeleton className="h-6 w-1/4 mb-2" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ) : activeEndpoint ? (
              <Tabs defaultValue="overview" className="h-full">
                <div className="px-6 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h2 className="text-2xl font-bold">{getEndpointTitle(activeEndpoint)}</h2>
                    <TabsList className="mt-2 sm:mt-0">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                      <TabsTrigger value="schemas">Schemas</TabsTrigger>
                      <TabsTrigger value="playground">API Playground</TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="overview" className="p-6 pt-2">
                  <p className="text-gray-500 mb-4">
                    {getEndpointDescription(activeEndpoint)}
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-2">Base URL</h3>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {`https://api.careunity.example.com/${activeEndpoint}`}
                    </code>
                  </div>

                  <h3 className="text-lg font-medium mb-2">Authentication</h3>
                  <p className="text-gray-500 mb-4">
                    All API requests require authentication using JWT tokens. Include the token in the Authorization header:
                  </p>
                  <div className="bg-gray-100 p-3 rounded-lg mb-6 overflow-x-auto">
                    <code className="text-sm">
                      Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    </code>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <Button className="flex items-center gap-2">
                      <Server size={16} />
                      <span>Try in API Console</span>
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <FileText size={16} />
                      <span>View Full Documentation</span>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="endpoints" className="p-6 pt-2 h-[calc(100%-80px)] overflow-auto">
                  <div className="space-y-6">
                    {getEndpoints(activeEndpoint).map((endpoint, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className={`flex items-center p-3 ${getMethodColor(endpoint.method)}`}>
                          <span className="font-mono font-bold text-white px-2 py-1 rounded mr-3">
                            {endpoint.method}
                          </span>
                          <span className="font-mono text-white">{endpoint.path}</span>
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium mb-1">{endpoint.summary}</h4>
                          <p className="text-gray-500 text-sm mb-3">{endpoint.description}</p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {endpoint.tags.map((tag, i) => (
                              <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <Button size="sm" variant="outline" className="text-xs">
                            Try it out
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="schemas" className="p-6 pt-2 h-[calc(100%-80px)] overflow-auto">
                  <div className="space-y-6">
                    {getSchemas(activeEndpoint).map((schema, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-3">
                          <h4 className="font-medium font-mono">{schema.name}</h4>
                        </div>
                        <div className="p-4">
                          <p className="text-gray-500 text-sm mb-3">{schema.description}</p>

                          <div className="bg-gray-50 p-3 rounded-lg overflow-x-auto">
                            <pre className="text-xs">
                              {JSON.stringify(schema.example, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="playground" className="p-6 pt-2 h-[calc(100%-80px)] overflow-auto">
                  <InteractiveApiPlayground />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <AlertCircle size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">Select an API Category</h3>
                <p className="text-gray-500 max-w-md">
                  Choose an API category from the sidebar to view its documentation, endpoints, and schemas.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Category Item Component
interface CategoryItemProps {
  title: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function CategoryItem({ title, count, active, onClick }: CategoryItemProps) {
  return (
    <button
      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm ${
        active
          ? 'bg-primary text-white'
          : 'hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <span>{title}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs ${
        active
          ? 'bg-white bg-opacity-20 text-white'
          : 'bg-gray-100 text-gray-600'
      }`}>
        {count}
      </span>
    </button>
  );
}

// Helper functions to get endpoint data
function getEndpointTitle(endpoint: string): string {
  const titles: Record<string, string> = {
    'auth': 'Authentication',
    'service-users': 'Service Users',
    'care-plans': 'Care Plans',
    'goals': 'Goals',
    'tasks': 'Tasks',
    'ml-models': 'ML Models',
    'visits': 'Visits',
    'documents': 'Documents',
    'family-portal': 'Family Portal',
    'external-integration': 'External Integration',
    'monitoring': 'Monitoring',
    'sync': 'Synchronization',
  };

  return titles[endpoint] || endpoint;
}

function getEndpointDescription(endpoint: string): string {
  const descriptions: Record<string, string> = {
    'auth': 'Authentication endpoints for user login, registration, and token management.',
    'service-users': 'Endpoints for managing service users, including CRUD operations and search functionality.',
    'care-plans': 'Endpoints for managing care plans, goals, and tasks for service users.',
    'goals': 'Endpoints for managing goals within care plans.',
    'tasks': 'Endpoints for managing tasks associated with goals.',
    'ml-models': 'Endpoints for interacting with machine learning models for care allocation and predictions.',
    'visits': 'Endpoints for scheduling, managing, and recording care visits.',
    'documents': 'Endpoints for managing documents and files associated with service users.',
    'family-portal': 'Endpoints for family members to access information about their relatives.',
    'external-integration': 'Endpoints for integrating with external systems and services.',
    'monitoring': 'Endpoints for monitoring system health, performance, and errors.',
    'sync': 'Endpoints for synchronizing data between the server and mobile devices.',
  };

  return descriptions[endpoint] || 'No description available.';
}

function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    'GET': 'bg-blue-600',
    'POST': 'bg-green-600',
    'PUT': 'bg-amber-600',
    'PATCH': 'bg-orange-600',
    'DELETE': 'bg-red-600',
  };

  return colors[method] || 'bg-gray-600';
}

// Mock data for endpoints
function getEndpoints(category: string) {
  // This would be replaced with actual data from your API documentation
  const mockEndpoints = {
    'auth': [
      {
        method: 'POST',
        path: '/auth/login',
        summary: 'User Login',
        description: 'Authenticate a user and get an access token',
        tags: ['Authentication'],
      },
      {
        method: 'POST',
        path: '/auth/refresh',
        summary: 'Refresh Token',
        description: 'Get a new access token using a refresh token',
        tags: ['Authentication'],
      },
    ],
    'service-users': [
      {
        method: 'GET',
        path: '/service-users',
        summary: 'List Service Users',
        description: 'Get a paginated list of service users',
        tags: ['Service Users'],
      },
      {
        method: 'GET',
        path: '/service-users/{id}',
        summary: 'Get Service User',
        description: 'Get details of a specific service user',
        tags: ['Service Users'],
      },
      {
        method: 'POST',
        path: '/service-users',
        summary: 'Create Service User',
        description: 'Create a new service user',
        tags: ['Service Users'],
      },
    ],
    // Add more categories as needed
  };

  return mockEndpoints[category as keyof typeof mockEndpoints] || [];
}

// Mock data for schemas
function getSchemas(category: string) {
  // This would be replaced with actual data from your API documentation
  const mockSchemas = {
    'auth': [
      {
        name: 'LoginRequest',
        description: 'Request body for user login',
        example: {
          username: 'user@example.com',
          password: 'password123',
        },
      },
      {
        name: 'LoginResponse',
        description: 'Response from successful login',
        example: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 1,
            username: 'user@example.com',
            name: 'John Doe',
            role: 'admin',
          },
        },
      },
    ],
    'service-users': [
      {
        name: 'ServiceUser',
        description: 'Service user data model',
        example: {
          id: 1,
          uniqueId: 'SU001',
          fullName: 'John Doe',
          dateOfBirth: '1980-01-01',
          gender: 'male',
          address: '123 Main St, Anytown',
          phone: '555-123-4567',
          email: 'john.doe@example.com',
          status: 'active',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      },
    ],
    // Add more categories as needed
  };

  return mockSchemas[category as keyof typeof mockSchemas] || [];
}
