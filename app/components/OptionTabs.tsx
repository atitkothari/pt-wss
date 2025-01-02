"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoveredCallTable } from "./CoveredCallTable";
import { CashSecuredPutTable } from "./CashSecuredPutTable";
import { OptionType } from "@/app/types/option";

interface TabProps {
  option: OptionType;
}

export function OptionTabs() {
  return (
    <Tabs defaultValue="call" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="call">Covered Calls</TabsTrigger>
        <TabsTrigger value="put">Cash Secured Puts</TabsTrigger>
      </TabsList>
      <TabsContent value="call">
        <CoveredCallTable />
      </TabsContent>
      <TabsContent value="put">
        <CashSecuredPutTable />
      </TabsContent>
    </Tabs>
  );
}