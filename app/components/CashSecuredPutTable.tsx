import { OptionsTableComponent } from "./shared/OptionsTableComponent";
import { OptionType } from "@/app/types/option";

export function CashSecuredPutTable() {
  const optionType: OptionType = 'put';
  return <OptionsTableComponent option={optionType} />;
}