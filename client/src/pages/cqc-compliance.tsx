import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import CQCWellLedCompliance from '@/components/cqc/CQCWellLedCompliance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CQCCompliancePage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="CQC Compliance" 
          description="Track and evidence your compliance with CQC regulations" 
        />
        
        <div className="mt-6">
          <Tabs defaultValue="well-led" className="w-full">
            <TabsList className="grid grid-cols-5 w-full max-w-4xl mb-8">
              <TabsTrigger value="well-led">Well-Led</TabsTrigger>
              <TabsTrigger value="safe">Safe</TabsTrigger>
              <TabsTrigger value="effective">Effective</TabsTrigger>
              <TabsTrigger value="caring">Caring</TabsTrigger>
              <TabsTrigger value="responsive">Responsive</TabsTrigger>
            </TabsList>
            
            <TabsContent value="well-led">
              <CQCWellLedCompliance />
            </TabsContent>
            
            <TabsContent value="safe">
              <div className="py-12 px-4 text-center">
                <h3 className="text-xl font-medium text-gray-500 mb-4">Safe Compliance</h3>
                <p>This section is under development and will be available soon.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="effective">
              <div className="py-12 px-4 text-center">
                <h3 className="text-xl font-medium text-gray-500 mb-4">Effective Compliance</h3>
                <p>This section is under development and will be available soon.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="caring">
              <div className="py-12 px-4 text-center">
                <h3 className="text-xl font-medium text-gray-500 mb-4">Caring Compliance</h3>
                <p>This section is under development and will be available soon.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="responsive">
              <div className="py-12 px-4 text-center">
                <h3 className="text-xl font-medium text-gray-500 mb-4">Responsive Compliance</h3>
                <p>This section is under development and will be available soon.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}