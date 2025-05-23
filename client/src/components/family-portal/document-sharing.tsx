import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Upload,
  Eye,
  Clock,
  Calendar,
  FileIcon,
  FilePlus,
  FileQuestion,
  FilePdf,
  FileImage,
  FileSpreadsheet,
  FileCheck,
  Share2,
  Lock,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OfflineWrapper } from "@/components/ui/offline-indicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Document {
  id: number;
  name: string;
  type: string;
  category: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  status: 'shared' | 'private' | 'pending';
  icon: React.ReactNode;
}

/**
 * Document Sharing Component for Family Portal
 * 
 * This component allows family members to view, download, and upload
 * documents related to their loved one's care.
 */
const DocumentSharing = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock document data
  const documents: Document[] = [
    {
      id: 1,
      name: "Care Plan - May 2023.pdf",
      type: "PDF",
      category: "Care Plan",
      uploadedBy: "Dr. Sarah Johnson",
      uploadDate: "2023-05-15",
      size: "1.2 MB",
      status: 'shared',
      icon: <FilePdf className="h-6 w-6 text-red-500" />
    },
    {
      id: 2,
      name: "Medication Schedule.xlsx",
      type: "Excel",
      category: "Medication",
      uploadedBy: "Nurse Michael Brown",
      uploadDate: "2023-05-10",
      size: "245 KB",
      status: 'shared',
      icon: <FileSpreadsheet className="h-6 w-6 text-green-500" />
    },
    {
      id: 3,
      name: "Weekly Progress Report.pdf",
      type: "PDF",
      category: "Reports",
      uploadedBy: "Jane Wilson",
      uploadDate: "2023-05-08",
      size: "890 KB",
      status: 'shared',
      icon: <FilePdf className="h-6 w-6 text-red-500" />
    },
    {
      id: 4,
      name: "Physiotherapy Assessment.pdf",
      type: "PDF",
      category: "Medical",
      uploadedBy: "Dr. Robert Davis",
      uploadDate: "2023-05-01",
      size: "1.5 MB",
      status: 'shared',
      icon: <FilePdf className="h-6 w-6 text-red-500" />
    },
    {
      id: 5,
      name: "Family Visit Photos.zip",
      type: "ZIP",
      category: "Photos",
      uploadedBy: "You",
      uploadDate: "2023-04-28",
      size: "15.8 MB",
      status: 'private',
      icon: <FileImage className="h-6 w-6 text-blue-500" />
    },
    {
      id: 6,
      name: "Consent Form.pdf",
      type: "PDF",
      category: "Administrative",
      uploadedBy: "Admin Staff",
      uploadDate: "2023-04-15",
      size: "320 KB",
      status: 'pending',
      icon: <FileCheck className="h-6 w-6 text-amber-500" />
    }
  ];
  
  // Filter documents based on active tab and search query
  const filteredDocuments = documents.filter(doc => {
    // Filter by tab
    if (activeTab !== 'all' && doc.category.toLowerCase() !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Get document status badge
  const getStatusBadge = (status: 'shared' | 'private' | 'pending') => {
    switch (status) {
      case 'shared':
        return <Badge className="bg-green-100 text-green-800">Shared</Badge>;
      case 'private':
        return <Badge className="bg-blue-100 text-blue-800">Private</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Document Sharing</CardTitle>
            <CardDescription>
              View and share documents related to your loved one's care
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <OfflineWrapper requiresOnline={true} fallback={
              <Button disabled>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            }>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </OfflineWrapper>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search-documents" className="sr-only">Search Documents</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search-documents"
                placeholder="Search documents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="care plan">Care Plan</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileQuestion className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
                <p className="text-gray-500 mt-1">
                  {searchQuery 
                    ? `No documents matching "${searchQuery}"`
                    : "No documents in this category yet"}
                </p>
              </div>
            ) : (
              <div className="border rounded-md divide-y">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {doc.icon}
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-9 md:ml-0">
                      {getStatusBadge(doc.status)}
                      <OfflineWrapper requiresOnline={false}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </OfflineWrapper>
                      <OfflineWrapper requiresOnline={true} fallback={
                        <Button variant="outline" size="sm" disabled>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      }>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </OfflineWrapper>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Lock className="h-4 w-4 mr-2" />
                            Change Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Request Document
        </Button>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          View Document History
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentSharing;
