import { OptionsTableComponent } from "./shared/OptionsTableComponent";
import { OptionType } from "@/app/types/option";

export function CoveredCallTable() {
  const optionType: OptionType = 'call';
  return <OptionsTableComponent option={optionType} />;
}