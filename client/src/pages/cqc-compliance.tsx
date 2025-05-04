import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import CQCWellLedCompliance from '@/components/cqc/CQCWellLedCompliance';
import CQCSafeCompliance from '@/components/cqc/CQCSafeCompliance';
import CQCEffectiveCompliance from '@/components/cqc/CQCEffectiveCompliance';
import CQCCaringCompliance from '@/components/cqc/CQCCaringCompliance';
import CQCResponsiveCompliance from '@/components/cqc/CQCResponsiveCompliance';
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
              <CQCSafeCompliance />
            </TabsContent>
            
            <TabsContent value="effective">
              <CQCEffectiveCompliance />
            </TabsContent>
            
            <TabsContent value="caring">
              <CQCCaringCompliance />
            </TabsContent>
            
            <TabsContent value="responsive">
              <CQCResponsiveCompliance />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}