import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  AlertTriangle, 
  Check, 
  Download, 
  FileText, 
  Info,
  Upload, 
  FileBarChart,
  Clipboard,
  Heart
} from 'lucide-react';

import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Evidence type
interface Evidence {
  id: string;
  title: string;
  type: 'document' | 'record' | 'audit';
  dateAdded: string;
  addedBy: string;
  description: string;
  regulationCode: string;
  regulationName: string;
  fileUrl?: string;
  fileType?: string;
}

export default function CQCCaringCompliance() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [evidenceDialog, setEvidenceDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  
  useEffect(() => {
    // Check for online status
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Initial check
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);
  
  const handleOpenUploadDialog = (section: string) => {
    setSelectedSection(section);
    setUploadDialog(true);
  };
  
  const handleCloseUploadDialog = () => {
    setUploadDialog(false);
  };
  
  const handleCloseEvidenceDialog = () => {
    setEvidenceDialog(false);
    setSelectedEvidence(null);
  };
  
  const handleViewEvidence = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    setEvidenceDialog(true);
  };
  
  const handleGenerateReport = () => {
    // Logic to generate and download a PDF/Word report
    alert('Generating CQC Caring Compliance Report. This would download a full report in a real implementation.');
  };
  
  // Mock evidence for demo
  const mockEvidence: {
    reg10_1: Evidence[];
    reg10_2a: Evidence[];
    reg10_2b: Evidence[];
  } = {
    reg10_1: [
      {
        id: 'ev1',
        title: 'Dignity and Respect Policy',
        type: 'document' as const,
        dateAdded: '2025-03-20',
        addedBy: 'John Davies, Director',
        description: 'Comprehensive policy on ensuring dignity and respect for all service users.',
        regulationCode: '10(1)',
        regulationName: 'Dignity and Respect'
      },
      {
        id: 'ev2',
        title: 'Staff Training on Compassionate Care',
        type: 'record' as const,
        dateAdded: '2025-03-01',
        addedBy: 'Emily Johnson, Training Coordinator',
        description: 'Records of staff training on providing compassionate, dignified care.',
        regulationCode: '10(1)',
        regulationName: 'Dignity and Respect'
      },
      {
        id: 'ev3',
        title: 'Service User Dignity Survey Results',
        type: 'audit' as const,
        dateAdded: '2025-02-15',
        addedBy: 'Sarah Williams, Quality Officer',
        description: 'Results from quarterly survey of service users regarding respectful treatment.',
        regulationCode: '10(1)',
        regulationName: 'Dignity and Respect'
      }
    ],
    reg10_2a: [
      {
        id: 'ev4',
        title: 'Privacy and Confidentiality Protocol',
        type: 'document' as const,
        dateAdded: '2025-03-15',
        addedBy: 'Jane Smith, Care Manager',
        description: 'Protocol for maintaining privacy and confidentiality during care delivery.',
        regulationCode: '10(2)(a)',
        regulationName: 'Respect privacy'
      },
      {
        id: 'ev5',
        title: 'Privacy Audit Results',
        type: 'audit' as const,
        dateAdded: '2025-02-20',
        addedBy: 'Sarah Williams, Quality Officer',
        description: 'Results of privacy audit across all care settings.',
        regulationCode: '10(2)(a)',
        regulationName: 'Respect privacy'
      }
    ],
    reg10_2b: [
      {
        id: 'ev6',
        title: 'Independence Promotion Framework',
        type: 'document' as const,
        dateAdded: '2025-03-05',
        addedBy: 'Jane Smith, Care Manager',
        description: 'Framework for promoting independence and individual control.',
        regulationCode: '10(2)(b)',
        regulationName: 'Support independence'
      },
      {
        id: 'ev7',
        title: 'Independence Support Case Studies',
        type: 'record' as const,
        dateAdded: '2025-02-25',
        addedBy: 'Jane Smith, Care Manager',
        description: 'Case studies demonstrating how independence is supported in practice.',
        regulationCode: '10(2)(b)',
        regulationName: 'Support independence'
      }
    ]
  };
  
  const viewEvidenceItem = (id: string) => {
    // Find evidence in our mock data
    const allEvidence = [
      ...mockEvidence.reg10_1,
      ...mockEvidence.reg10_2a,
      ...mockEvidence.reg10_2b
    ];
    
    const evidence = allEvidence.find(ev => ev.id === id);
    if (evidence) {
      handleViewEvidence(evidence);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">CQC Caring Compliance</CardTitle>
            <Badge className={isOnline ? "bg-green-500" : "bg-amber-500"}>
              {isOnline ? "Online" : "Offline Mode"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Alert className="mb-6">
                <Heart className="h-4 w-4" />
                <AlertTitle>Regulation 10: Dignity and Respect</AlertTitle>
                <AlertDescription>
                  Service users must be treated with dignity and respect. This includes respecting privacy, supporting independence, and meeting needs in a caring way.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Overall Compliance Status</h3>
                    <p className="text-muted-foreground text-sm">Last reviewed: April 26, 2025</p>
                  </div>
                </div>
                <Badge className="bg-green-600">Compliant</Badge>
              </div>
              
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="reg10_1" className="border rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center">
                        <Heart className="h-5 w-5 mr-2" />
                        <div className="text-left">
                          <span className="font-medium">10(1) Dignity and Respect</span>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Compliant</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-muted-foreground mb-4">
                      Service users must be treated with dignity and respect, including by respecting their privacy, autonomy and independence.
                    </p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-sm">Evidence Items (3)</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenUploadDialog('reg10_1')}
                        disabled={!isOnline}
                      >
                        <Upload className="h-4 w-4 mr-2" /> Add Evidence
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {mockEvidence.reg10_1.map(evidence => (
                        <div key={evidence.id} className="flex items-center justify-between p-2 border rounded-md bg-background">
                          <div className="flex items-center">
                            {evidence.type === 'document' ? (
                              <FileText className="h-4 w-4 text-primary mr-2" />
                            ) : evidence.type === 'audit' ? (
                              <FileBarChart className="h-4 w-4 text-primary mr-2" />
                            ) : (
                              <Clipboard className="h-4 w-4 text-primary mr-2" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{evidence.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Last updated: {new Date(evidence.dateAdded).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => viewEvidenceItem(evidence.id)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="reg10_2a" className="border rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        <div className="text-left">
                          <span className="font-medium">10(2)(a) Respect privacy</span>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Compliant</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-muted-foreground mb-4">
                      Respecting and promoting the privacy, autonomy and independence of service users in the carrying on of the regulated activity.
                    </p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-sm">Evidence Items (2)</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenUploadDialog('reg10_2a')}
                        disabled={!isOnline}
                      >
                        <Upload className="h-4 w-4 mr-2" /> Add Evidence
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {mockEvidence.reg10_2a.map(evidence => (
                        <div key={evidence.id} className="flex items-center justify-between p-2 border rounded-md bg-background">
                          <div className="flex items-center">
                            {evidence.type === 'document' ? (
                              <FileText className="h-4 w-4 text-primary mr-2" />
                            ) : evidence.type === 'audit' ? (
                              <FileBarChart className="h-4 w-4 text-primary mr-2" />
                            ) : (
                              <Clipboard className="h-4 w-4 text-primary mr-2" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{evidence.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Last updated: {new Date(evidence.dateAdded).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => viewEvidenceItem(evidence.id)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="reg10_2b" className="border rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        <div className="text-left">
                          <span className="font-medium">10(2)(b) Support independence</span>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Compliant</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-muted-foreground mb-4">
                      Having due regard to any relevant protected characteristics (as defined in section 149(7) of the Equality Act 2010) of the service user.
                    </p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-sm">Evidence Items (2)</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenUploadDialog('reg10_2b')}
                        disabled={!isOnline}
                      >
                        <Upload className="h-4 w-4 mr-2" /> Add Evidence
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {mockEvidence.reg10_2b.map(evidence => (
                        <div key={evidence.id} className="flex items-center justify-between p-2 border rounded-md bg-background">
                          <div className="flex items-center">
                            {evidence.type === 'document' ? (
                              <FileText className="h-4 w-4 text-primary mr-2" />
                            ) : evidence.type === 'audit' ? (
                              <FileBarChart className="h-4 w-4 text-primary mr-2" />
                            ) : (
                              <Clipboard className="h-4 w-4 text-primary mr-2" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{evidence.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Last updated: {new Date(evidence.dateAdded).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => viewEvidenceItem(evidence.id)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="flex justify-center mt-8">
                <Button 
                  size="lg" 
                  onClick={handleGenerateReport}
                  disabled={!isOnline}
                >
                  <Download className="h-5 w-5 mr-2" /> Generate Full CQC Caring Compliance Report
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Evidence Dialog */}
      <Dialog open={evidenceDialog} onOpenChange={setEvidenceDialog}>
        <DialogContent className="max-w-3xl">
          {selectedEvidence && (
            <>
              <DialogHeader>
                <div className="flex items-center">
                  {selectedEvidence.type === 'document' ? (
                    <FileText className="h-5 w-5 text-primary mr-2" />
                  ) : selectedEvidence.type === 'audit' ? (
                    <FileBarChart className="h-5 w-5 text-primary mr-2" />
                  ) : (
                    <Clipboard className="h-5 w-5 text-primary mr-2" />
                  )}
                  <DialogTitle>{selectedEvidence.title}</DialogTitle>
                </div>
                <DialogDescription>
                  Related to Regulation {selectedEvidence.regulationCode}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Evidence Type:</h4>
                  <p className="text-sm capitalize">
                    {selectedEvidence.type}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Related Regulation:</h4>
                  <p className="text-sm">
                    {selectedEvidence.regulationCode}: {selectedEvidence.regulationName}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Date Added:</h4>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(selectedEvidence.dateAdded), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Added By:</h4>
                  <p className="text-sm">
                    {selectedEvidence.addedBy}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Description:</h4>
                <p className="text-sm">
                  {selectedEvidence.description}
                </p>
              </div>
              
              {selectedEvidence.fileUrl && (
                <div className="border rounded-md p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    File preview would be displayed here
                  </p>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseEvidenceDialog}>
                  Close
                </Button>
                {selectedEvidence.fileUrl && (
                  <Button>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Evidence</DialogTitle>
            <DialogDescription>
              Upload a document or record evidence for CQC compliance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title">Evidence Title</Label>
                <Input id="title" placeholder="Enter a descriptive title" />
              </div>
              
              <div>
                <Label htmlFor="type">Evidence Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="record">Record</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Provide details about this evidence" />
              </div>
              
              <div>
                <Label htmlFor="file">Upload File (optional)</Label>
                <Input id="file" type="file" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseUploadDialog}>Cancel</Button>
            <Button type="submit">Add Evidence</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}