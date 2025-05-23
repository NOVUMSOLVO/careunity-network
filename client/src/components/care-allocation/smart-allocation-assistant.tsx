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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  Clock,
  UserCheck,
  Briefcase,
  MapPin,
  CalendarClock,
  ThumbsUp,
  ChevronRight,
  RefreshCw,
  UserCog,
  Calendar,
  Brain,
  Sparkles,
  BarChart2,
  Route,
  AlertTriangle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useAllocationApi } from '@/api/allocation-api';
import { format, addDays } from 'date-fns';

export interface SmartAllocationAssistantProps {
  className?: string;
}

export function SmartAllocationAssistant({ className }: SmartAllocationAssistantProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [activeTab, setActiveTab] = useState('voice');
  const [predictionResults, setPredictionResults] = useState<any[]>([]);
  const [mlResults, setMlResults] = useState<any[]>([]);
  const [workloadPredictions, setWorkloadPredictions] = useState<any[]>([]);
  const [optimizationPreference, setOptimizationPreference] = useState('balanced');
  const [useHistoricalData, setUseHistoricalData] = useState(true);
  const [usePredictions, setUsePredictions] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [selectedServiceUser, setSelectedServiceUser] = useState<number | undefined>(undefined);
  const { toast } = useToast();

  // Get allocation API hooks
  const {
    usePredictVisits,
    usePredictWorkload,
    useRunMlAllocation,
    useUnallocatedVisits,
    useManualAllocate
  } = useAllocationApi();

  // API mutations
  const predictVisitsMutation = usePredictVisits();
  const predictWorkloadMutation = usePredictWorkload();
  const mlAllocationMutation = useRunMlAllocation();
  const manualAllocateMutation = useManualAllocate();

  // Get unallocated visits for the date range
  const { data: unallocatedVisits } = useUnallocatedVisits({
    start: startDate,
    end: endDate
  });

  const handleVoiceCommand = () => {
    setIsProcessing(true);
    setVoiceCommand('Find a qualified carer for Elizabeth Johnson tomorrow morning');

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuggestions(true);
    }, 1500);
  };

  const handleTextCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (voiceCommand) {
      setIsProcessing(true);

      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        setShowSuggestions(true);
      }, 1000);
    }
  };

  const handleRunPrediction = async () => {
    setIsProcessing(true);

    try {
      const result = await predictVisitsMutation.mutateAsync({
        serviceUserId: selectedServiceUser,
        startDate,
        endDate
      });

      setPredictionResults(result || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to predict visits. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to predict visits:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunMlAllocation = async () => {
    if (!unallocatedVisits || unallocatedVisits.length === 0) {
      toast({
        title: "No Visits",
        description: "There are no unallocated visits to process.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const visitIds = unallocatedVisits.map(visit => visit.id);

      const result = await mlAllocationMutation.mutateAsync({
        request: {
          visitIds,
          optimizationPreference: optimizationPreference as any,
          useHistoricalData,
          considerFuturePredictions: usePredictions
        }
      });

      setMlResults(result || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run ML allocation. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to run ML allocation:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePredictWorkload = async () => {
    setIsProcessing(true);

    try {
      const result = await predictWorkloadMutation.mutateAsync({
        startDate,
        endDate
      });

      setWorkloadPredictions(result || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to predict workload. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to predict workload:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptSuggestion = async (index: number) => {
    if (!mlResults || !mlResults[index]) return;

    try {
      const result = await manualAllocateMutation.mutateAsync({
        visitId: mlResults[index].visitId,
        caregiverId: mlResults[index].caregiverId
      });

      toast({
        title: "Allocation Accepted",
        description: `Visit has been allocated to ${mlResults[index].caregiverName}`,
      });

      // Remove the allocated visit from the results
      setMlResults(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to allocate visit. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to allocate visit:", error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary-600" />
          Smart Allocation Assistant
        </CardTitle>
        <CardDescription>
          AI-powered care allocation with predictive scheduling and intelligent matching
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Voice Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="predict" className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              <span>Predictive</span>
            </TabsTrigger>
            <TabsTrigger value="ml" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>ML Allocation</span>
            </TabsTrigger>
          </TabsList>

          {/* Voice Assistant Tab */}
          <TabsContent value="voice" className="space-y-4">
            <form onSubmit={handleTextCommand} className="flex gap-2">
              <Input
                placeholder="E.g., Find a carer for Mrs. Smith tomorrow"
                value={voiceCommand}
                onChange={(e) => setVoiceCommand(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleVoiceCommand}
                className="px-3"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button type="submit">Search</Button>
            </form>

          {isProcessing && (
            <div className="text-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
              <p className="text-sm text-gray-500">Processing your request...</p>
            </div>
          )}

          {showSuggestions && !isProcessing && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="font-medium text-sm">
                  Found 3 suitable carers for Elizabeth Johnson on Tue, May 7th (AM)
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowSuggestions(false)}
                >
                  Clear
                </Button>
              </div>

              {/* Suggestion 1 */}
              <div className="border rounded-lg p-4 bg-primary-50">
                <div className="flex items-center gap-4 mb-3">
                  <Badge className="bg-green-100 text-green-800 border-green-200">Best Match</Badge>
                  <div className="text-sm text-gray-500">98% compatibility score</div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary-200">
                    <AvatarImage src="" alt="Sarah Jones" />
                    <AvatarFallback className="bg-primary-100 text-primary-800">SJ</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-semibold">Sarah Jones</div>
                    <div className="text-sm text-gray-500">Senior Care Worker</div>
                  </div>

                  <Button size="sm">Allocate</Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-primary-500" />
                    <span>Available 8AM-4PM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <UserCheck className="h-3.5 w-3.5 text-primary-500" />
                    <span>Continuity (12 visits)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Briefcase className="h-3.5 w-3.5 text-primary-500" />
                    <span>Medication trained</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-primary-500" />
                    <span>3.2 miles away</span>
                  </div>
                </div>
              </div>

              {/* Suggestion 2 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good Match</Badge>
                  <div className="text-sm text-gray-500">85% compatibility score</div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt="Michael Brown" />
                    <AvatarFallback className="bg-gray-100">MB</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-semibold">Michael Brown</div>
                    <div className="text-sm text-gray-500">Care Worker</div>
                  </div>

                  <Button size="sm" variant="outline">Allocate</Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-primary-500" />
                    <span>Available 9AM-5PM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <UserCheck className="h-3.5 w-3.5 text-gray-400" />
                    <span>New to client</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Briefcase className="h-3.5 w-3.5 text-primary-500" />
                    <span>Medication trained</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-primary-500" />
                    <span>2.5 miles away</span>
                  </div>
                </div>
              </div>

              {/* Suggestion 3 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Alternative</Badge>
                  <div className="text-sm text-gray-500">73% compatibility score</div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt="Emma Wilson" />
                    <AvatarFallback className="bg-gray-100">EW</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-semibold">Emma Wilson</div>
                    <div className="text-sm text-gray-500">Care Worker</div>
                  </div>

                  <Button size="sm" variant="outline">Allocate</Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-primary-500" />
                    <span>Available 7AM-3PM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <UserCheck className="h-3.5 w-3.5 text-primary-500" />
                    <span>Previous visits (3)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                    <span>Medication training needed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-primary-500" />
                    <span>4.1 miles away</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showSuggestions && !isProcessing && (
            <div className="space-y-6 mt-4">
              <h3 className="text-sm font-medium text-gray-700">Quick Commands</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => {
                    setVoiceCommand("Find available carers for tomorrow with medication training");
                    handleTextCommand(new Event('submit') as any);
                  }}
                >
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-primary-500" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Skills-based search</div>
                      <div className="text-xs text-gray-500">Find carers with specific qualifications</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => {
                    setVoiceCommand("Find closest carers to Robert Wilson for emergency visit");
                    handleTextCommand(new Event('submit') as any);
                  }}
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Proximity search</div>
                      <div className="text-xs text-gray-500">Find nearest available carers</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => {
                    setVoiceCommand("Reallocate Michael Brown's visits for May 10th");
                    handleTextCommand(new Event('submit') as any);
                  }}
                >
                  <div className="flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2 text-primary-500" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Reallocation</div>
                      <div className="text-xs text-gray-500">Reassign visits when staff unavailable</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => {
                    setVoiceCommand("Who is the best match for Mrs. Johnson's morning medication visit?");
                    handleTextCommand(new Event('submit') as any);
                  }}
                >
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2 text-primary-500" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Best match finder</div>
                      <div className="text-xs text-gray-500">Optimal carer-client compatibility</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </div>
          )}
          </TabsContent>

          {/* Predictive Tab */}
          <TabsContent value="predict" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1"
                  />
                  <span className="flex items-center">to</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Service User</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedServiceUser || ""}
                  onChange={(e) => setSelectedServiceUser(e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">All Service Users</option>
                  <option value="1">Elizabeth Johnson</option>
                  <option value="2">Robert Thompson</option>
                  <option value="3">Margaret Wilson</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRunPrediction}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Predict Visits
                  </>
                )}
              </Button>

              <Button
                onClick={handlePredictWorkload}
                disabled={isProcessing}
                variant="outline"
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Predict Workload
                  </>
                )}
              </Button>
            </div>

            {predictionResults.length > 0 && !isProcessing && (
              <div className="mt-4 space-y-4">
                <h3 className="text-sm font-medium">Predicted Visits</h3>

                <div className="space-y-3">
                  {predictionResults.map((prediction, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">{prediction.serviceUserName}</h4>
                        <Badge
                          className={
                            prediction.confidence > 85
                              ? "bg-green-100 text-green-800"
                              : prediction.confidence > 70
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {prediction.confidence}% Confidence
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{prediction.predictedDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{prediction.predictedStartTime} - {prediction.predictedEndTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span>{prediction.visitType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserCheck className="h-4 w-4 text-gray-500" />
                          <span>{prediction.suggestedCaregiverName}</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workloadPredictions.length > 0 && !isProcessing && (
              <div className="mt-4 space-y-4">
                <h3 className="text-sm font-medium">Caregiver Workload Predictions</h3>

                <div className="space-y-3">
                  {workloadPredictions.map((prediction, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">{prediction.caregiverName}</h4>
                        <Badge
                          className={
                            prediction.predictedWorkload > 85
                              ? "bg-red-100 text-red-800"
                              : prediction.predictedWorkload > 70
                                ? "bg-amber-100 text-amber-800"
                                : "bg-green-100 text-green-800"
                          }
                        >
                          {prediction.predictedWorkload}% Workload
                        </Badge>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Capacity</span>
                          <span>{prediction.availableCapacity} minutes available</span>
                        </div>
                        <Progress value={prediction.predictedWorkload} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{prediction.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{prediction.predictedVisitCount} visits</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Route className="h-4 w-4 text-gray-500" />
                          <span>{prediction.predictedTravelTime} min travel</span>
                        </div>
                        {prediction.riskFactors.length > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span>{prediction.riskFactors.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ML Allocation Tab */}
          <TabsContent value="ml" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Optimization Preference</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={optimizationPreference}
                  onChange={(e) => setOptimizationPreference(e.target.value)}
                >
                  <option value="balanced">Balanced</option>
                  <option value="quality">Quality of Care</option>
                  <option value="efficiency">Efficiency</option>
                  <option value="continuity">Continuity of Care</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Advanced Options</label>
                <div className="flex gap-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={useHistoricalData}
                      onChange={(e) => setUseHistoricalData(e.target.checked)}
                    />
                    Use historical data
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={usePredictions}
                      onChange={(e) => setUsePredictions(e.target.checked)}
                    />
                    Consider predictions
                  </label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRunMlAllocation}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run ML Allocation
                </>
              )}
            </Button>

            {mlResults.length > 0 && !isProcessing && (
              <div className="mt-4 space-y-4">
                <h3 className="text-sm font-medium">ML Allocation Results</h3>

                <div className="space-y-3">
                  {mlResults.map((result, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{result.serviceUserName}</h4>
                          <p className="text-xs text-gray-500">{result.visitDate} • {result.visitTime}</p>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={
                              result.score > 85
                                ? "bg-green-100 text-green-800"
                                : result.score > 70
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {result.score}% Match
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{result.confidence}% Confidence</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <Avatar>
                          <AvatarImage src={`/avatars/0${index + 1}.png`} />
                          <AvatarFallback>{result.caregiverName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{result.caregiverName}</h4>
                        </div>
                      </div>

                      <div className="bg-white p-2 rounded border border-gray-100 mb-3">
                        <h5 className="text-xs font-medium mb-1">AI Explanation</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {result.explanation.map((exp: string, i: number) => (
                            <li key={i} className="flex items-start gap-1">
                              <ChevronRight className="h-3 w-3 mt-0.5 text-primary-500" />
                              <span>{exp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Modify
                        </Button>
                        <Button size="sm" onClick={() => handleAcceptSuggestion(index)}>
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
          <Button className="flex-1">
            <Sparkles className="h-4 w-4 mr-2" />
            Bulk Allocate
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}