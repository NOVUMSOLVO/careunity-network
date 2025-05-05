import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BatteryCharging,
  Brain,
  Calendar,
  Heart,
  Pill,
  TrendingDown,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';

// Health metrics data - this would come from your backend in a real implementation
const healthMetricsData = [
  { date: '2025-01', bloodPressureSystolic: 125, bloodPressureDiastolic: 82, heartRate: 72, weight: 78, bloodGlucose: 5.4, mobility: 7, pain: 2, cognition: 8, mood: 7, nutrition: 7 },
  { date: '2025-02', bloodPressureSystolic: 128, bloodPressureDiastolic: 83, heartRate: 74, weight: 79, bloodGlucose: 5.5, mobility: 7, pain: 3, cognition: 8, mood: 6, nutrition: 7 },
  { date: '2025-03', bloodPressureSystolic: 130, bloodPressureDiastolic: 85, heartRate: 75, weight: 79.5, bloodGlucose: 5.6, mobility: 6, pain: 3, cognition: 7, mood: 6, nutrition: 6 },
  { date: '2025-04', bloodPressureSystolic: 133, bloodPressureDiastolic: 87, heartRate: 76, weight: 80, bloodGlucose: 5.8, mobility: 6, pain: 4, cognition: 7, mood: 5, nutrition: 6 },
  { date: '2025-05', bloodPressureSystolic: 126, bloodPressureDiastolic: 83, heartRate: 73, weight: 79, bloodGlucose: 5.6, mobility: 7, pain: 2, cognition: 7, mood: 7, nutrition: 7 },
];

// Risk score data
const riskScoresData = [
  { name: 'Falls', previous: 35, current: 42 },
  { name: 'Hospitalization', previous: 28, current: 32 },
  { name: 'Medication Issue', previous: 18, current: 15 },
  { name: 'Nutrition', previous: 22, current: 25 },
  { name: 'Mental Health', previous: 32, current: 35 },
];

// Health alerts data
const healthAlertsData = [
  { id: 1, type: 'high', description: 'Blood pressure has been trending upward for 3 weeks', serviceUser: 'John Doe', status: 'new', date: '2025-05-03' },
  { id: 2, type: 'medium', description: 'Weight has decreased by 5% in 2 weeks', serviceUser: 'Mary Smith', status: 'new', date: '2025-05-02' },
  { id: 3, type: 'high', description: 'Self-reported pain has increased significantly', serviceUser: 'Robert Brown', status: 'acknowledged', date: '2025-05-01' },
  { id: 4, type: 'low', description: 'Missed medication for 2 consecutive days', serviceUser: 'Emma Wilson', status: 'resolved', date: '2025-04-28' },
  { id: 5, type: 'medium', description: 'Decline in cognitive assessment scores', serviceUser: 'James Taylor', status: 'acknowledged', date: '2025-04-27' },
];

// Outcome metrics data
const outcomeMetricsData = [
  { name: 'Falls Reduction', value: 32 },
  { name: 'Medication Adherence', value: 68 },
  { name: 'Independence Improvement', value: 45 },
  { name: 'Hospital Avoidance', value: 78 },
  { name: 'Care Goal Achievement', value: 53 },
];

// COLORS
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a569bd'];
const RISK_COLORS = {
  improved: '#4CAF50',
  worsened: '#F44336',
  unchanged: '#9E9E9E'
};

export default function PredictiveHealth() {
  const [selectedServiceUser, setSelectedServiceUser] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('6months');
  const [selectedMetric, setSelectedMetric] = useState<string>('blood-pressure');
  const [alertFilter, setAlertFilter] = useState<string>('all');

  // Get risk trend indicator
  const getRiskTrend = (previous: number, current: number) => {
    if (current < previous) return { direction: 'down', color: RISK_COLORS.improved };
    if (current > previous) return { direction: 'up', color: RISK_COLORS.worsened };
    return { direction: 'unchanged', color: RISK_COLORS.unchanged };
  };

  // Filter alerts based on selected filter
  const filteredAlerts = alertFilter === 'all' 
    ? healthAlertsData 
    : healthAlertsData.filter(alert => alert.status === alertFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Predictive Health Monitoring</h1>
          <p className="text-muted-foreground">Analyze health trends and predict potential issues before they occur.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Select
            value={selectedServiceUser}
            onValueChange={setSelectedServiceUser}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Service User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Service Users</SelectItem>
              <SelectItem value="john-doe">John Doe</SelectItem>
              <SelectItem value="mary-smith">Mary Smith</SelectItem>
              <SelectItem value="robert-brown">Robert Brown</SelectItem>
              <SelectItem value="emma-wilson">Emma Wilson</SelectItem>
              <SelectItem value="james-taylor">James Taylor</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="risk-scores">Risk Prediction</TabsTrigger>
          <TabsTrigger value="alerts">Early Warning</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Service Users at Risk</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-rose-500 inline-flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    8%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">New Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 inline-flex items-center">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    12%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Health Improvement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 inline-flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    5%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Interventions</CardTitle>
                <BatteryCharging className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 inline-flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    18%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Health Metrics Chart */}
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Health Metrics Trends</CardTitle>
                  <CardDescription>
                    Track changes in key health indicators over time
                  </CardDescription>
                </div>
                <Select
                  value={selectedMetric}
                  onValueChange={setSelectedMetric}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood-pressure">Blood Pressure</SelectItem>
                    <SelectItem value="heart-rate">Heart Rate</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="blood-glucose">Blood Glucose</SelectItem>
                    <SelectItem value="well-being">Well-being Factors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {selectedMetric === 'blood-pressure' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={healthMetricsData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="bloodPressureSystolic" 
                        name="Systolic" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bloodPressureDiastolic" 
                        name="Diastolic" 
                        stroke="#82ca9d" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {selectedMetric === 'heart-rate' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={healthMetricsData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="heartRate" 
                        name="Heart Rate" 
                        stroke="#FF5722" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {selectedMetric === 'weight' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={healthMetricsData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        name="Weight (kg)" 
                        stroke="#673AB7" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {selectedMetric === 'blood-glucose' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={healthMetricsData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="bloodGlucose" 
                        name="Blood Glucose (mmol/L)" 
                        stroke="#2196F3" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {selectedMetric === 'well-being' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      cx="50%" 
                      cy="50%" 
                      outerRadius="80%" 
                      data={[
                        { subject: 'Mobility', A: healthMetricsData[4].mobility, fullMark: 10 },
                        { subject: 'Pain Control', A: 10 - healthMetricsData[4].pain, fullMark: 10 },
                        { subject: 'Cognition', A: healthMetricsData[4].cognition, fullMark: 10 },
                        { subject: 'Mood', A: healthMetricsData[4].mood, fullMark: 10 },
                        { subject: 'Nutrition', A: healthMetricsData[4].nutrition, fullMark: 10 },
                      ]}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 10]} />
                      <Radar 
                        name="Current Status" 
                        dataKey="A" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6} 
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RISK PREDICTION TAB */}
        <TabsContent value="risk-scores" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Risk Score Chart */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Risk Score Trends</CardTitle>
                <CardDescription>
                  Compare current risk levels with previous assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={riskScoresData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="previous" name="Previous Score" fill="#8884d8" />
                      <Bar dataKey="current" name="Current Score" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment Cards */}
            <div className="space-y-4">
              {riskScoresData.map((score, index) => {
                const trend = getRiskTrend(score.previous, score.current);
                return (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium">{score.name} Risk</CardTitle>
                        {trend.direction === 'up' ? (
                          <TrendingUp className="h-5 w-5" style={{ color: trend.color }} />
                        ) : trend.direction === 'down' ? (
                          <TrendingDown className="h-5 w-5" style={{ color: trend.color }} />
                        ) : (
                          <Activity className="h-5 w-5" style={{ color: trend.color }} />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{score.current}/100</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            score.current >= 66 
                              ? 'bg-red-600' 
                              : score.current >= 33 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`} 
                          style={{ width: `${score.current}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {trend.direction === 'up' ? (
                          <span style={{ color: trend.color }}>Increased by {score.current - score.previous} points</span>
                        ) : trend.direction === 'down' ? (
                          <span style={{ color: trend.color }}>Decreased by {score.previous - score.current} points</span>
                        ) : (
                          <span style={{ color: trend.color }}>No change</span>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Risk Predictions</CardTitle>
              <CardDescription>
                Predictive analytics helps identify potential health risks before they occur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-gradient-to-br from-rose-50 to-white">
                  <div className="mb-2 flex items-center">
                    <Heart className="h-5 w-5 text-rose-500 mr-2" />
                    <h3 className="font-medium">Cardiovascular Risks</h3>
                  </div>
                  <p className="text-sm text-gray-600">Based on blood pressure trends and heart rate variability, there's a 32% probability of deterioration in cardiovascular health in the next 3 months without intervention.</p>
                  <Badge variant="outline" className="mt-3 bg-rose-100 text-rose-800 hover:bg-rose-200">High Priority</Badge>
                </div>
                
                <div className="border rounded-lg p-4 bg-gradient-to-br from-amber-50 to-white">
                  <div className="mb-2 flex items-center">
                    <Pill className="h-5 w-5 text-amber-500 mr-2" />
                    <h3 className="font-medium">Medication Non-Adherence</h3>
                  </div>
                  <p className="text-sm text-gray-600">Pattern analysis shows a 45% probability of medication non-adherence for hypertension medication, which could lead to adverse health outcomes.</p>
                  <Badge variant="outline" className="mt-3 bg-amber-100 text-amber-800 hover:bg-amber-200">Medium Priority</Badge>
                </div>
                
                <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white">
                  <div className="mb-2 flex items-center">
                    <Brain className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-medium">Cognitive Health</h3>
                  </div>
                  <p className="text-sm text-gray-600">Recent cognitive assessment scores show early signs of potential cognitive decline. Recommended: Cognitive stimulation exercises.</p>
                  <Badge variant="outline" className="mt-3 bg-blue-100 text-blue-800 hover:bg-blue-200">Medium Priority</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EARLY WARNING TAB */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Health Alert System</CardTitle>
                  <CardDescription>
                    Proactive notifications for potential health issues
                  </CardDescription>
                </div>
                <Select
                  value={alertFilter}
                  onValueChange={setAlertFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter Alerts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 border rounded-lg flex items-start justify-between ${
                      alert.status === 'new' 
                        ? 'bg-white border-primary-200' 
                        : alert.status === 'acknowledged' 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-gray-100 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`rounded-full p-2 mr-3 flex-shrink-0 ${
                        alert.type === 'high' 
                          ? 'bg-red-100' 
                          : alert.type === 'medium' 
                            ? 'bg-yellow-100' 
                            : 'bg-blue-100'
                      }`}>
                        <AlertTriangle className={`h-5 w-5 ${
                          alert.type === 'high' 
                            ? 'text-red-500' 
                            : alert.type === 'medium' 
                              ? 'text-yellow-500' 
                              : 'text-blue-500'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium text-sm">{alert.serviceUser}</h4>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${
                              alert.type === 'high' 
                                ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                : alert.type === 'medium' 
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            {alert.type === 'high' ? 'High Risk' : alert.type === 'medium' ? 'Medium Risk' : 'Low Risk'}
                          </Badge>
                          <span className="text-xs text-gray-500 ml-2">{alert.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.status === 'new' && (
                        <>
                          <Button variant="outline" size="sm">Acknowledge</Button>
                          <Button size="sm">View Details</Button>
                        </>
                      )}
                      {alert.status === 'acknowledged' && (
                        <>
                          <Button variant="outline" size="sm">Resolve</Button>
                          <Button size="sm">View Details</Button>
                        </>
                      )}
                      {alert.status === 'resolved' && (
                        <Button variant="outline" size="sm">View Details</Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredAlerts.length === 0 && (
                  <div className="text-center p-8">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Activity className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No alerts found</h3>
                    <p className="text-gray-500 mt-1">There are no active alerts matching your filter criteria.</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <p className="text-sm text-gray-500">
                Showing {filteredAlerts.length} of {healthAlertsData.length} alerts
              </p>
              <Button variant="link" size="sm">View All Alerts</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Early Intervention Recommendations</CardTitle>
              <CardDescription>
                AI-generated recommendations to address potential health issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <Heart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Blood Pressure Management</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Several service users are showing upward trends in blood pressure. Recommended actions:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        <li>Schedule medication reviews for affected service users</li>
                        <li>Implement remote blood pressure monitoring for daily readings</li>
                        <li>Create dietary guidelines for sodium reduction</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-white">
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Mobility Enhancement Program</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Predictive analysis indicates 8 service users may benefit from proactive mobility interventions. Recommended actions:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        <li>Implement home-based exercise programs tailored to individual capabilities</li>
                        <li>Schedule physiotherapy assessments for those with declining mobility scores</li>
                        <li>Introduce small daily movement goals with remote monitoring</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-white">
                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Cognitive Health Initiative</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Early indicators of cognitive changes detected in 5 service users. Recommended actions:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        <li>Implement cognitive stimulation activities during care visits</li>
                        <li>Schedule comprehensive cognitive assessments</li>
                        <li>Provide family education on supporting cognitive health</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OUTCOMES TAB */}
        <TabsContent value="outcomes" className="space-y-4">
          {/* Key Outcome Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Care Outcome Analytics</CardTitle>
              <CardDescription>
                Measuring the effectiveness of predictive interventions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomeMetricsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {outcomeMetricsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[0] }}></div>
                        <span>Falls Reduction</span>
                      </div>
                      <span className="font-semibold">32%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[1] }}></div>
                        <span>Medication Adherence</span>
                      </div>
                      <span className="font-semibold">68%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[2] }}></div>
                        <span>Independence Improvement</span>
                      </div>
                      <span className="font-semibold">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[3] }}></div>
                        <span>Hospital Avoidance</span>
                      </div>
                      <span className="font-semibold">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[4] }}></div>
                        <span>Care Goal Achievement</span>
                      </div>
                      <span className="font-semibold">53%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '53%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Intervention Impact Assessment</CardTitle>
              <CardDescription>
                Measuring the effectiveness of predictive health interventions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-emerald-100 rounded-full p-2 mr-2">
                      <TrendingDown className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h4 className="font-medium">Hospital Admissions</h4>
                  </div>
                  <div className="text-3xl font-bold text-emerald-600 flex items-center">
                    -24%
                    <span className="text-sm font-normal text-gray-500 ml-2">vs. baseline</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Predictive monitoring has helped reduce emergency hospital admissions by intervening earlier in deteriorating conditions.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-amber-100 rounded-full p-2 mr-2">
                      <Calendar className="h-5 w-5 text-amber-600" />
                    </div>
                    <h4 className="font-medium">Length of Care</h4>
                  </div>
                  <div className="text-3xl font-bold text-amber-600 flex items-center">
                    +18%
                    <span className="text-sm font-normal text-gray-500 ml-2">longer independence</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Service users are maintaining independence for longer periods before requiring increased care levels.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 rounded-full p-2 mr-2">
                      <Heart className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="font-medium">Quality of Life</h4>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 flex items-center">
                    +32%
                    <span className="text-sm font-normal text-gray-500 ml-2">improvement</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Self-reported quality of life scores have improved significantly with proactive health monitoring and interventions.
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Return on Investment Analysis</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Cost Savings</p>
                      <p className="text-2xl font-bold text-gray-900">£125,800</p>
                      <p className="text-xs text-gray-500">Annualized</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ROI Ratio</p>
                      <p className="text-2xl font-bold text-gray-900">3.8:1</p>
                      <p className="text-xs text-gray-500">For every £1 invested</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Care Hour Efficiency</p>
                      <p className="text-2xl font-bold text-gray-900">+22%</p>
                      <p className="text-xs text-gray-500">More effective care delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}