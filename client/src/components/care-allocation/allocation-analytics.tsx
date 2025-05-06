import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Calendar, 
  Download, 
  RefreshCw,
  ArrowUpDown,
  MapPin, 
  Briefcase, 
  Heart, 
  Clock,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

export interface AllocationAnalyticsProps {
  className?: string;
}

// Sample analytics data - in a real app, this would come from the API
const allocationEfficiencyData = [
  { method: 'Geographic', score: 85, travelEfficiency: 92, clientSatisfaction: 78, staffSatisfaction: 84 },
  { method: 'Skills', score: 90, travelEfficiency: 75, clientSatisfaction: 95, staffSatisfaction: 88 },
  { method: 'Preference', score: 78, travelEfficiency: 70, clientSatisfaction: 96, staffSatisfaction: 92 },
  { method: 'Availability', score: 94, travelEfficiency: 88, clientSatisfaction: 82, staffSatisfaction: 79 },
];

const weeklyTrendData = [
  { name: 'Week 1', geographic: 78, skills: 82, preference: 70, availability: 88 },
  { name: 'Week 2', geographic: 80, skills: 84, preference: 72, availability: 90 },
  { name: 'Week 3', geographic: 82, skills: 89, preference: 75, availability: 91 },
  { name: 'Week 4', geographic: 85, skills: 90, preference: 78, availability: 94 },
];

const methodDistributionData = [
  { name: 'Geographic', value: 32 },
  { name: 'Skills', value: 24 },
  { name: 'Preference', value: 18 },
  { name: 'Availability', value: 26 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Issues data
const issuesData = [
  { 
    id: 1, 
    method: 'Geographic', 
    issue: 'High travel times in rural areas', 
    impact: 'high',
    recommendation: 'Consider hybrid approach with preference-based for rural areas'
  },
  { 
    id: 2, 
    method: 'Skills', 
    issue: 'Specialized skills shortage in certain regions', 
    impact: 'medium', 
    recommendation: 'Initiate targeted training program for frequent skill gaps'
  },
  { 
    id: 3, 
    method: 'Preference', 
    issue: 'Limited carer availability creates bottlenecks', 
    impact: 'medium',
    recommendation: 'Implement preference weighting system to balance client and operational needs'
  },
  { 
    id: 4, 
    method: 'Availability', 
    issue: 'Last-minute cancellations disrupt schedules', 
    impact: 'high',
    recommendation: 'Develop backup staffing protocol with incentive structure'
  },
];

export function AllocationAnalytics({ className }: AllocationAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<string>('month');
  const [chartType, setChartType] = useState<string>('bar');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <CardTitle>Allocation Method Analytics</CardTitle>
            <CardDescription>
              Compare performance metrics across different allocation methods
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="efficiency" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="efficiency" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Efficiency</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4" />
              <span>Trends</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              <span>Distribution</span>
            </TabsTrigger>
            <TabsTrigger value="issues" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Issues</span>
            </TabsTrigger>
          </TabsList>

          {/* Efficiency Tab */}
          <TabsContent value="efficiency" className="space-y-4">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="h-10 flex items-center gap-2">
                <span className="text-sm font-medium">Chart Type:</span>
                <div className="flex border rounded-md overflow-hidden">
                  <Button 
                    variant={chartType === 'bar' ? 'default' : 'outline'} 
                    className="h-8 rounded-none px-3"
                    onClick={() => setChartType('bar')}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    <span>Bar</span>
                  </Button>
                  <Button 
                    variant={chartType === 'line' ? 'default' : 'outline'} 
                    className="h-8 rounded-none px-3"
                    onClick={() => setChartType('line')}
                  >
                    <LineChartIcon className="h-4 w-4 mr-1" />
                    <span>Line</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart
                    data={allocationEfficiencyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" name="Overall Score" fill="#8884d8" />
                    <Bar dataKey="travelEfficiency" name="Travel Efficiency" fill="#82ca9d" />
                    <Bar dataKey="clientSatisfaction" name="Client Satisfaction" fill="#ffc658" />
                    <Bar dataKey="staffSatisfaction" name="Staff Satisfaction" fill="#ff8042" />
                  </BarChart>
                ) : (
                  <LineChart
                    data={allocationEfficiencyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" name="Overall Score" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="travelEfficiency" name="Travel Efficiency" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="clientSatisfaction" name="Client Satisfaction" stroke="#ffc658" />
                    <Line type="monotone" dataKey="staffSatisfaction" name="Staff Satisfaction" stroke="#ff8042" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {allocationEfficiencyData.map((method) => (
                <Card key={method.method} className="border-t-4" style={{ borderTopColor: method.method === 'Geographic' ? '#0088FE' : method.method === 'Skills' ? '#00C49F' : method.method === 'Preference' ? '#FFBB28' : '#FF8042' }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      {method.method === 'Geographic' && <MapPin className="h-4 w-4 mr-2" />}
                      {method.method === 'Skills' && <Briefcase className="h-4 w-4 mr-2" />}
                      {method.method === 'Preference' && <Heart className="h-4 w-4 mr-2" />}
                      {method.method === 'Availability' && <Clock className="h-4 w-4 mr-2" />}
                      {method.method} Method
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Overall Performance Score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-3">{method.score}%</div>
                    <Progress 
                      value={method.score} 
                      className="h-2 mb-4" 
                      indicatorClassName={
                        method.method === 'Geographic' ? 'bg-blue-500' : 
                        method.method === 'Skills' ? 'bg-green-500' : 
                        method.method === 'Preference' ? 'bg-yellow-500' : 
                        'bg-orange-500'
                      }
                    />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-gray-500">Travel Efficiency</div>
                        <div className="font-medium">{method.travelEfficiency}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Client Satisfaction</div>
                        <div className="font-medium">{method.clientSatisfaction}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Staff Satisfaction</div>
                        <div className="font-medium">{method.staffSatisfaction}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyTrendData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="geographic" name="Geographic" stroke="#0088FE" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="skills" name="Skills" stroke="#00C49F" />
                  <Line type="monotone" dataKey="preference" name="Preference" stroke="#FFBB28" />
                  <Line type="monotone" dataKey="availability" name="Availability" stroke="#FF8042" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="p-4 border rounded-md bg-slate-50">
              <h4 className="text-sm font-medium mb-2">Trend Analysis</h4>
              <p className="text-sm text-gray-600">
                Over the past month, all allocation methods have shown improvement in efficiency scores. 
                The <span className="font-medium text-amber-600">Availability-based method</span> shows 
                the highest consistent growth (6.8% increase), while the 
                <span className="font-medium text-green-600"> Skills-based method</span> had the largest 
                improvement spike in Week 3 (5.9% increase).
              </p>
              <h4 className="text-sm font-medium mt-4 mb-2">Insights</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                <li>Geographic matching is showing steady improvement after route optimization updates</li>
                <li>Preference-based matching has the slowest growth rate but is gaining momentum</li>
                <li>Skills-based matching benefits most from recent training initiatives</li>
                <li>Availability-based matching remains the most consistently effective method</li>
              </ul>
            </div>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={methodDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {methodDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} visits`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="md:w-1/2 space-y-3">
                <h3 className="text-sm font-medium">Current Allocation Method Distribution</h3>
                <p className="text-sm text-gray-600">
                  This chart shows the distribution of visit allocations across different methods in the last {timeRange}.
                </p>
                
                <div className="space-y-2 mt-4">
                  {methodDistributionData.map((method, i) => (
                    <div key={method.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                      <div className="text-sm flex-1">{method.name}</div>
                      <div className="font-medium text-sm">{method.value} visits</div>
                      <div className="text-sm text-gray-500">
                        {Math.round((method.value / methodDistributionData.reduce((acc, m) => acc + m.value, 0)) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-3 border rounded-md bg-blue-50">
                  <h4 className="text-sm font-medium mb-1">Recommendation</h4>
                  <p className="text-sm text-gray-600">
                    Based on client outcomes and operational efficiency, increasing Skills-based allocation by 5-10% 
                    could improve overall service quality while maintaining balanced distribution.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-100 p-3 text-sm font-medium">
                <div className="col-span-3">Method</div>
                <div className="col-span-4">Issue</div>
                <div className="col-span-2">Impact</div>
                <div className="col-span-3">Recommendation</div>
              </div>
              <div className="divide-y">
                {issuesData.map((issue) => (
                  <div key={issue.id} className="grid grid-cols-12 p-3 text-sm">
                    <div className="col-span-3 flex items-center gap-2">
                      {issue.method === 'Geographic' && <MapPin className="h-4 w-4 text-blue-500" />}
                      {issue.method === 'Skills' && <Briefcase className="h-4 w-4 text-green-500" />}
                      {issue.method === 'Preference' && <Heart className="h-4 w-4 text-yellow-500" />}
                      {issue.method === 'Availability' && <Clock className="h-4 w-4 text-orange-500" />}
                      {issue.method}
                    </div>
                    <div className="col-span-4">{issue.issue}</div>
                    <div className="col-span-2">
                      <Badge className={
                        issue.impact === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                        issue.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }>
                        {issue.impact}
                      </Badge>
                    </div>
                    <div className="col-span-3 text-xs">{issue.recommendation}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Analysis
        </Button>
        <Button className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Compare Periods
        </Button>
      </CardFooter>
    </Card>
  );
}