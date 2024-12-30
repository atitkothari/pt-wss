"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoveredCallTable } from "./CoveredCallTable";
import { CashSecuredPutTable } from "./CashSecuredPutTable";

export function OptionTabs() {
  return (
    <Tabs defaultValue="covered-calls" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="covered-calls">Covered Calls</TabsTrigger>
        <TabsTrigger value="cash-secured-puts">Cash Secured Puts</TabsTrigger>
      </TabsList>
      <TabsContent value="covered-calls">
        <CoveredCallTable />
      </TabsContent>
      <TabsContent value="cash-secured-puts">
        <CashSecuredPutTable data={[]}/>
      </TabsContent>
    </Tabs>
  );
}