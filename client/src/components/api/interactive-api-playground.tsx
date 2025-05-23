import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Play, Code, FileJson, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// API endpoint interface
interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  parameters: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: ApiResponse[];
  tags: string[];
}

// API parameter interface
interface ApiParameter {
  name: string;
  description: string;
  required: boolean;
  type: string;
  location: 'path' | 'query' | 'header';
  example?: string;
}

// API request body interface
interface ApiRequestBody {
  description: string;
  required: boolean;
  contentType: string;
  schema: any;
  example: string;
}

// API response interface
interface ApiResponse {
  statusCode: number;
  description: string;
  contentType: string;
  schema?: any;
  example: string;
}

// Code sample interface
interface CodeSample {
  language: string;
  code: string;
}

// API request result interface
interface ApiRequestResult {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  duration: number;
}

/**
 * Interactive API Playground Component
 */
export function InteractiveApiPlayground() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [selectedTab, setSelectedTab] = useState('playground');
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState('');
  const [requestResult, setRequestResult] = useState<ApiRequestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codeSamples, setCodeSamples] = useState<CodeSample[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [copied, setCopied] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch API endpoints on mount
  useEffect(() => {
    fetchApiEndpoints();
  }, []);
  
  // Generate code samples when endpoint changes
  useEffect(() => {
    if (selectedEndpoint) {
      generateCodeSamples(selectedEndpoint);
    }
  }, [selectedEndpoint, paramValues, requestBody]);
  
  // Fetch API endpoints from OpenAPI spec
  const fetchApiEndpoints = async () => {
    try {
      const response = await fetch('/api-docs/openapi.json');
      const openApiSpec = await response.json();
      
      // Parse OpenAPI spec to extract endpoints
      const parsedEndpoints: ApiEndpoint[] = [];
      
      for (const path in openApiSpec.paths) {
        for (const method in openApiSpec.paths[path]) {
          const endpoint = openApiSpec.paths[path][method];
          
          // Extract parameters
          const parameters: ApiParameter[] = [];
          if (endpoint.parameters) {
            for (const param of endpoint.parameters) {
              parameters.push({
                name: param.name,
                description: param.description || '',
                required: param.required || false,
                type: param.schema?.type || 'string',
                location: param.in,
                example: param.example || ''
              });
            }
          }
          
          // Extract request body
          let requestBody: ApiRequestBody | undefined;
          if (endpoint.requestBody) {
            const content = endpoint.requestBody.content['application/json'];
            requestBody = {
              description: endpoint.requestBody.description || '',
              required: endpoint.requestBody.required || false,
              contentType: 'application/json',
              schema: content.schema,
              example: JSON.stringify(content.example || {}, null, 2)
            };
          }
          
          // Extract responses
          const responses: ApiResponse[] = [];
          for (const statusCode in endpoint.responses) {
            const response = endpoint.responses[statusCode];
            const content = response.content?.['application/json'];
            
            responses.push({
              statusCode: parseInt(statusCode),
              description: response.description || '',
              contentType: content ? 'application/json' : 'text/plain',
              schema: content?.schema,
              example: content?.example ? JSON.stringify(content.example, null, 2) : ''
            });
          }
          
          parsedEndpoints.push({
            id: `${method}-${path}`,
            name: endpoint.summary || `${method.toUpperCase()} ${path}`,
            description: endpoint.description || '',
            method: method.toUpperCase() as any,
            path,
            parameters,
            requestBody,
            responses,
            tags: endpoint.tags || []
          });
        }
      }
      
      setEndpoints(parsedEndpoints);
      
      // Select first endpoint by default
      if (parsedEndpoints.length > 0) {
        setSelectedEndpoint(parsedEndpoints[0]);
        
        // Initialize parameter values with examples
        const initialParamValues: Record<string, string> = {};
        for (const param of parsedEndpoints[0].parameters) {
          initialParamValues[param.name] = param.example || '';
        }
        setParamValues(initialParamValues);
        
        // Initialize request body with example
        if (parsedEndpoints[0].requestBody) {
          setRequestBody(parsedEndpoints[0].requestBody.example);
        }
      }
    } catch (error) {
      console.error('Error fetching API endpoints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API documentation',
        variant: 'destructive'
      });
    }
  };
  
  // Handle endpoint selection
  const handleEndpointSelect = (endpointId: string) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (endpoint) {
      setSelectedEndpoint(endpoint);
      
      // Reset parameter values
      const newParamValues: Record<string, string> = {};
      for (const param of endpoint.parameters) {
        newParamValues[param.name] = param.example || '';
      }
      setParamValues(newParamValues);
      
      // Reset request body
      if (endpoint.requestBody) {
        setRequestBody(endpoint.requestBody.example);
      } else {
        setRequestBody('');
      }
      
      // Reset request result
      setRequestResult(null);
    }
  };
  
  // Handle parameter value change
  const handleParamChange = (name: string, value: string) => {
    setParamValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle request body change
  const handleRequestBodyChange = (value: string) => {
    setRequestBody(value);
  };
  
  // Send API request
  const sendRequest = async () => {
    if (!selectedEndpoint) return;
    
    setIsLoading(true);
    setRequestResult(null);
    
    try {
      // Build URL with path parameters
      let url = selectedEndpoint.path;
      
      // Replace path parameters
      for (const param of selectedEndpoint.parameters) {
        if (param.location === 'path') {
          url = url.replace(`{${param.name}}`, encodeURIComponent(paramValues[param.name] || ''));
        }
      }
      
      // Add query parameters
      const queryParams = new URLSearchParams();
      for (const param of selectedEndpoint.parameters) {
        if (param.location === 'query' && paramValues[param.name]) {
          queryParams.append(param.name, paramValues[param.name]);
        }
      }
      
      if (queryParams.toString()) {
        url = `${url}?${queryParams.toString()}`;
      }
      
      // Ensure URL starts with /api
      if (!url.startsWith('/api')) {
        url = `/api${url}`;
      }
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      // Add header parameters
      for (const param of selectedEndpoint.parameters) {
        if (param.location === 'header' && paramValues[param.name]) {
          headers[param.name] = paramValues[param.name];
        }
      }
      
      // Add content type for request body
      if (selectedEndpoint.requestBody) {
        headers['Content-Type'] = selectedEndpoint.requestBody.contentType;
      }
      
      // Prepare request options
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers
      };
      
      // Add request body for non-GET requests
      if (selectedEndpoint.method !== 'GET' && selectedEndpoint.requestBody) {
        options.body = requestBody;
      }
      
      // Measure request duration
      const startTime = performance.now();
      
      // Send request
      const response = await fetch(url, options);
      
      // Calculate request duration
      const duration = performance.now() - startTime;
      
      // Parse response
      let responseBody;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }
      
      // Extract response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      // Set request result
      setRequestResult({
        statusCode: response.status,
        headers: responseHeaders,
        body: responseBody,
        duration
      });
    } catch (error) {
      console.error('Error sending API request:', error);
      
      setRequestResult({
        statusCode: 0,
        headers: {},
        body: { error: 'Failed to send request. Check the console for details.' },
        duration: 0
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate code samples for the selected endpoint
  const generateCodeSamples = (endpoint: ApiEndpoint) => {
    // Build URL with path parameters
    let url = endpoint.path;
    
    // Replace path parameters
    for (const param of endpoint.parameters) {
      if (param.location === 'path') {
        url = url.replace(`{${param.name}}`, `\${${param.name}}`);
      }
    }
    
    // Add query parameters
    const queryParams = endpoint.parameters.filter(p => p.location === 'query');
    if (queryParams.length > 0) {
      url += '?';
      url += queryParams.map(p => `${p.name}=\${${p.name}}`).join('&');
    }
    
    // Ensure URL starts with /api
    if (!url.startsWith('/api')) {
      url = `/api${url}`;
    }
    
    // Generate JavaScript/Fetch sample
    const fetchSample = `// Using Fetch API
const ${endpoint.method.toLowerCase()}${endpoint.path.split('/').pop() || 'Request'} = async () => {
  ${endpoint.parameters.map(p => `const ${p.name} = ${JSON.stringify(paramValues[p.name] || '')};`).join('\n  ')}
  
  const response = await fetch(\`\${API_BASE_URL}${url}\`, {
    method: '${endpoint.method}',
    headers: {
      ${endpoint.requestBody ? "'Content-Type': 'application/json'," : ''}
      'Accept': 'application/json'${endpoint.parameters.filter(p => p.location === 'header').length > 0 ? ',' : ''}
      ${endpoint.parameters.filter(p => p.location === 'header').map(p => `'${p.name}': ${p.name}`).join(',\n      ')}
    }${endpoint.requestBody ? ',\n    body: JSON.stringify(' + (requestBody || '{}') + ')' : ''}
  });
  
  const data = await response.json();
  return data;
};`;

    // Generate Python/Requests sample
    const pythonSample = `# Using Requests library
import requests

def ${endpoint.method.toLowerCase()}_${endpoint.path.split('/').pop() || 'request'}():
    ${endpoint.parameters.map(p => `${p.name} = ${JSON.stringify(paramValues[p.name] || '')}`).join('\n    ')}
    
    url = f"{API_BASE_URL}${url.replace(/\${/g, '{')}"
    
    headers = {
        ${endpoint.requestBody ? "'Content-Type': 'application/json'," : ''}
        'Accept': 'application/json'${endpoint.parameters.filter(p => p.location === 'header').length > 0 ? ',' : ''}
        ${endpoint.parameters.filter(p => p.location === 'header').map(p => `'${p.name}': ${p.name}`).join(',\n        ')}
    }
    
    ${endpoint.requestBody ? 'payload = ' + (requestBody || '{}') : ''}
    
    response = requests.${endpoint.method.toLowerCase()}(
        url,
        headers=headers${endpoint.requestBody ? ',\n        json=payload' : ''}
    )
    
    return response.json()`;

    // Generate cURL sample
    const curlSample = `# Using cURL
curl -X ${endpoint.method} \\
  "${url.replace(/\${([^}]+)}/g, (_, name) => paramValues[name] || '')}" \\
  ${endpoint.parameters.filter(p => p.location === 'header').map(p => `-H "${p.name}: ${paramValues[p.name] || ''}"`).join(' \\\n  ')} \\
  ${endpoint.requestBody ? `-H "Content-Type: application/json" \\
  -d '${requestBody || '{}'}'` : ''}`;

    setCodeSamples([
      { language: 'javascript', code: fetchSample },
      { language: 'python', code: pythonSample },
      { language: 'curl', code: curlSample }
    ]);
  };
  
  // Copy code sample to clipboard
  const copyCodeSample = () => {
    const sample = codeSamples.find(s => s.language === selectedLanguage);
    if (sample) {
      navigator.clipboard.writeText(sample.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: 'Copied!',
        description: 'Code sample copied to clipboard',
      });
    }
  };
  
  // Render method badge with appropriate color
  const renderMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-500',
      POST: 'bg-green-500',
      PUT: 'bg-amber-500',
      PATCH: 'bg-purple-500',
      DELETE: 'bg-red-500'
    };
    
    return (
      <Badge className={`${colors[method]} text-white`}>
        {method}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Playground</h2>
          <p className="text-muted-foreground">Test and explore API endpoints interactively</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Endpoints</CardTitle>
            <CardDescription>Select an API endpoint to test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {endpoints.map(endpoint => (
                <Button
                  key={endpoint.id}
                  variant={selectedEndpoint?.id === endpoint.id ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleEndpointSelect(endpoint.id)}
                >
                  <div className="flex items-center">
                    {renderMethodBadge(endpoint.method)}
                    <span className="ml-2 truncate">{endpoint.path}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          {selectedEndpoint ? (
            <>
              <CardHeader>
                <div className="flex items-center">
                  {renderMethodBadge(selectedEndpoint.method)}
                  <CardTitle className="ml-2">{selectedEndpoint.path}</CardTitle>
                </div>
                <CardDescription>{selectedEndpoint.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="playground">Playground</TabsTrigger>
                    <TabsTrigger value="code">Code Samples</TabsTrigger>
                    <TabsTrigger value="responses">Responses</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="playground" className="space-y-4">
                    {/* Parameters */}
                    {selectedEndpoint.parameters.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Parameters</h3>
                        
                        {selectedEndpoint.parameters.map(param => (
                          <div key={param.name} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                            <div>
                              <Label htmlFor={param.name}>
                                {param.name}
                                {param.required && <span className="text-red-500 ml-1">*</span>}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {param.location} | {param.type}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <Input
                                id={param.name}
                                value={paramValues[param.name] || ''}
                                onChange={e => handleParamChange(param.name, e.target.value)}
                                placeholder={param.description}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Request Body */}
                    {selectedEndpoint.requestBody && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Request Body</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedEndpoint.requestBody.description}
                          {selectedEndpoint.requestBody.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <Textarea
                          value={requestBody}
                          onChange={e => handleRequestBodyChange(e.target.value)}
                          className="font-mono h-40"
                        />
                      </div>
                    )}
                    
                    <Button 
                      onClick={sendRequest} 
                      disabled={isLoading}
                      className="mt-4"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Send Request
                    </Button>
                    
                    {/* Request Result */}
                    {requestResult && (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Response</h3>
                          <Badge 
                            variant={requestResult.statusCode >= 200 && requestResult.statusCode < 300 ? 'success' : 'destructive'}
                          >
                            {requestResult.statusCode} {requestResult.statusCode >= 200 && requestResult.statusCode < 300 ? 'OK' : 'Error'}
                          </Badge>
                        </div>
                        
                        <div className="text-sm">
                          Request completed in {requestResult.duration.toFixed(2)}ms
                        </div>
                        
                        <Accordion type="single" collapsible defaultValue="body">
                          <AccordionItem value="headers">
                            <AccordionTrigger>Response Headers</AccordionTrigger>
                            <AccordionContent>
                              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                                {Object.entries(requestResult.headers).map(([key, value]) => (
                                  <div key={key}>{key}: {value}</div>
                                ))}
                              </pre>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="body">
                            <AccordionTrigger>Response Body</AccordionTrigger>
                            <AccordionContent>
                              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                                {typeof requestResult.body === 'object'
                                  ? JSON.stringify(requestResult.body, null, 2)
                                  : requestResult.body}
                              </pre>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="code" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="curl">cURL</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" size="sm" onClick={copyCodeSample}>
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                    
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                      {codeSamples.find(s => s.language === selectedLanguage)?.code || ''}
                    </pre>
                  </TabsContent>
                  
                  <TabsContent value="responses" className="space-y-4">
                    {selectedEndpoint.responses.map(response => (
                      <div key={response.statusCode} className="space-y-2">
                        <div className="flex items-center">
                          <Badge 
                            variant={response.statusCode >= 200 && response.statusCode < 300 ? 'success' : 'destructive'}
                            className="mr-2"
                          >
                            {response.statusCode}
                          </Badge>
                          <span className="font-medium">{response.description}</span>
                        </div>
                        
                        {response.example && (
                          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                            {response.example}
                          </pre>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2">Select an endpoint from the list to get started</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
