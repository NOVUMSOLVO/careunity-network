import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Filter } from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState('care-delivery');
  const [dateRange, setDateRange] = useState('this-week');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Reports"
          description="Generate and view CQC compliance reports"
        />

        <div className="py-4">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="generate">Generate Report</TabsTrigger>
              <TabsTrigger value="saved">Saved Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate New Report</CardTitle>
                  <CardDescription>
                    Select parameters to generate a new report
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="report-type">Report Type</Label>
                        <Select 
                          value={reportType} 
                          onValueChange={setReportType}
                        >
                          <SelectTrigger id="report-type" className="mt-1">
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="care-delivery">Care Delivery</SelectItem>
                            <SelectItem value="medication">Medication Administration</SelectItem>
                            <SelectItem value="incidents">Incidents & Accidents</SelectItem>
                            <SelectItem value="staff-performance">Staff Performance</SelectItem>
                            <SelectItem value="cqc-compliance">CQC Compliance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="date-range">Date Range</Label>
                        <Select 
                          value={dateRange} 
                          onValueChange={setDateRange}
                        >
                          <SelectTrigger id="date-range" className="mt-1">
                            <SelectValue placeholder="Select date range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="this-week">This Week</SelectItem>
                            <SelectItem value="this-month">This Month</SelectItem>
                            <SelectItem value="last-month">Last Month</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {dateRange === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start-date">Start Date</Label>
                            <Input 
                              id="start-date" 
                              type="date" 
                              className="mt-1" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-date">End Date</Label>
                            <Input 
                              id="end-date" 
                              type="date" 
                              className="mt-1" 
                            />
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor="service-user">Service User (Optional)</Label>
                        <Select>
                          <SelectTrigger id="service-user" className="mt-1">
                            <SelectValue placeholder="All service users" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All service users</SelectItem>
                            <SelectItem value="1">James Wilson</SelectItem>
                            <SelectItem value="2">Emily Parker</SelectItem>
                            <SelectItem value="3">Robert Thompson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="format">Report Format</Label>
                        <Select defaultValue="pdf">
                          <SelectTrigger id="format" className="mt-1">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF Document</SelectItem>
                            <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                            <SelectItem value="csv">CSV File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="include-metrics">Include Metrics</Label>
                        <Select defaultValue="standard">
                          <SelectTrigger id="include-metrics" className="mt-1">
                            <SelectValue placeholder="Select metrics" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard Metrics</SelectItem>
                            <SelectItem value="detailed">Detailed Metrics</SelectItem>
                            <SelectItem value="summary">Summary Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="pt-6">
                        <Button 
                          className="w-full"
                          onClick={generateReport}
                          disabled={isGenerating}
                        >
                          {isGenerating ? 'Generating...' : 'Generate Report'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="saved" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Saved Reports</CardTitle>
                    <CardDescription>
                      Previously generated reports
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { 
                        id: 1, 
                        title: 'Care Delivery Report', 
                        date: '2023-07-05', 
                        type: 'Care Delivery',
                        format: 'PDF'
                      },
                      { 
                        id: 2, 
                        title: 'Medication Administration Review', 
                        date: '2023-07-01', 
                        type: 'Medication',
                        format: 'Excel'
                      },
                      { 
                        id: 3, 
                        title: 'Monthly CQC Compliance', 
                        date: '2023-06-30', 
                        type: 'CQC Compliance',
                        format: 'PDF'
                      },
                      { 
                        id: 4, 
                        title: 'Staff Performance Summary', 
                        date: '2023-06-15', 
                        type: 'Staff Performance',
                        format: 'PDF'
                      }
                    ].map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-md">
                            <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 dark:text-white">{report.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {report.date} • {report.type} • {report.format}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
