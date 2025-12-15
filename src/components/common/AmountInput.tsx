import { forwardRef } from "react";
import { NumericFormat } from "react-number-format";
import { Input, type InputProps } from "../ui/Input";
import { cn } from "@/lib/utils";

/**
 * 금액 입력 컴포넌트 (금융 특화)
 * 자동 천단위 구분, 숫자만 입력 가능
 */

export interface AmountInputProps
  extends Omit<InputProps, "onChange" | "value" | "type" | "defaultValue"> {
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  max?: number;
  min?: number;
  prefix?: string;
  suffix?: string;
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  (
    {
      className,
      value,
      onValueChange,
      max,
      min = 0,
      prefix = "",
      suffix = "원",
      error,
      ...props
    },
    ref
  ) => {
    return (
      <NumericFormat
        getInputRef={ref}
        value={value}
        onValueChange={(values) => {
          const numValue = values.floatValue;
          if (numValue !== undefined) {
            if (max !== undefined && numValue > max) return;
            if (numValue < min) return;
          }
          onValueChange?.(numValue);
        }}
        thousandSeparator=","
        decimalScale={0}
        prefix={prefix}
        suffix={suffix}
        allowNegative={false}
        customInput={Input}
        className={cn(className)}
        error={error}
        {...props}
      />
    );
  }
);

AmountInput.displayName = "AmountInput";
