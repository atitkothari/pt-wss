"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoveredCallTable } from "./CoveredCallTable";
import { CashSecuredPutTable } from "./CashSecuredPutTable";
import { OptionType } from "@/app/types/option";
import { useSearchParams } from 'next/navigation';

interface OptionsParams {
  [key: string]: string | undefined;
}

export function OptionTabs() {
  const searchParams = useSearchParams();
  
  // Convert searchParams to regular object
  const params = Object.fromEntries(searchParams.entries());
  
  // Check for put-only parameters by looking for put_ prefix
  const hasPutParamsOnly = Object.keys(params).some(key => key.startsWith('put_')) && 
    !Object.keys(params).some(key => key.startsWith('call_'));
    
  const defaultTab = hasPutParamsOnly ? "cash-secured-put" : "covered-call";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="covered-call">Covered Call</TabsTrigger>
        <TabsTrigger value="cash-secured-put">Cash Secured Put</TabsTrigger>
      </TabsList>
      <TabsContent value="covered-call">
        <CoveredCallTable />
      </TabsContent>
      <TabsContent value="cash-secured-put">
        <CashSecuredPutTable />
      </TabsContent>
    </Tabs>
  );
}