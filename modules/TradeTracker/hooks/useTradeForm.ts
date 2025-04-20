import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTradeStore } from "../store";
import { tradeFormSchema, TradeFormValues } from "../schemas/tradeFormSchema";
import { calculateRR, calculatePositionSize, calculateQuantity } from "../utils";
import { DEFAULT_FORM_VALUES } from "../constants";

/**
 * Enhanced Trade form hook using react-hook-form and zod validation
 */
export const useTradeForm = () => {
  const { submitForm, toggleForm, showForm } = useTradeStore();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      symbol: "",
      side: DEFAULT_FORM_VALUES.side as "buy" | "sell",
      timeframe: DEFAULT_FORM_VALUES.timeframe,
      riskAmount: undefined,
      entryPrice: undefined,
      leverage: 1,
      stopLoss: undefined,
      takeProfit: undefined,
      strategy: "",
      note: "",
      // Default values for calculated fields
      rr: 0,
      positionSize: 0,
      quantity: 0,
    },
    mode: "onChange",
  });

  const { watch, setValue } = form;

  // Watch for changes to calculate derived values
  const entryPrice = watch("entryPrice");
  const stopLoss = watch("stopLoss");
  const takeProfit = watch("takeProfit");
  const riskAmount = watch("riskAmount");
  const leverage = watch("leverage");
  const side = watch("side");

  // Calculate derived values
  useEffect(() => {
    // Only calculate RR if all required values are present and valid numbers
    if (entryPrice && stopLoss && takeProfit && !isNaN(entryPrice) && !isNaN(stopLoss) && !isNaN(takeProfit)) {
      const rr = calculateRR(entryPrice, stopLoss, takeProfit);
      form.setValue("rr", rr, { shouldValidate: false });
    } else {
      // Set default value when inputs are missing or invalid
      form.setValue("rr", 0, { shouldValidate: false });
    }

    // Only calculate position size and quantity if all required values are present and valid numbers
    if (riskAmount && entryPrice && stopLoss && !isNaN(riskAmount) && !isNaN(entryPrice) && !isNaN(stopLoss)) {
      const positionSize = calculatePositionSize(riskAmount, entryPrice, stopLoss, leverage || 1);
      const quantity = calculateQuantity(positionSize, entryPrice);

      form.setValue("positionSize", positionSize, { shouldValidate: false });
      form.setValue("quantity", quantity, { shouldValidate: false });
    } else {
      // Set default values when inputs are missing or invalid
      form.setValue("positionSize", 0, { shouldValidate: false });
      form.setValue("quantity", 0, { shouldValidate: false });
    }
  }, [entryPrice, stopLoss, takeProfit, riskAmount, leverage, form, side]);

  // Handle form submission
  const onSubmit = useCallback(
    async (data: TradeFormValues) => {
      try {
        // Validate required fields
        if (!data.symbol) {
          form.setError("symbol", { message: "Symbol is required" });
          return false;
        }

        if (!data.entryPrice) {
          form.setError("entryPrice", { message: "Entry price is required" });
          return false;
        }

        if (!data.stopLoss) {
          form.setError("stopLoss", { message: "Stop loss is required" });
          return false;
        }

        if (!data.takeProfit) {
          form.setError("takeProfit", { message: "Take profit is required" });
          return false;
        }

        // Add calculated fields to the form data with proper validation
        const formData = {
          ...data,
          rr:
            data.entryPrice &&
            data.stopLoss &&
            data.takeProfit &&
            !isNaN(data.entryPrice) &&
            !isNaN(data.stopLoss) &&
            !isNaN(data.takeProfit)
              ? calculateRR(data.entryPrice, data.stopLoss, data.takeProfit)
              : 0,
          // Calculate position size and quantity if risk amount is provided
          positionSize:
            data.riskAmount &&
            data.entryPrice &&
            data.stopLoss &&
            !isNaN(data.riskAmount) &&
            !isNaN(data.entryPrice) &&
            !isNaN(data.stopLoss)
              ? calculatePositionSize(data.riskAmount, data.entryPrice, data.stopLoss, data.leverage || 1)
              : 0,
          quantity:
            data.riskAmount &&
            data.entryPrice &&
            data.stopLoss &&
            !isNaN(data.riskAmount) &&
            !isNaN(data.entryPrice) &&
            !isNaN(data.stopLoss)
              ? calculateQuantity(
                  calculatePositionSize(data.riskAmount, data.entryPrice, data.stopLoss, data.leverage || 1),
                  data.entryPrice
                )
              : 0,
        };

        // Update the store's formData before submitting
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined) {
            // @ts-ignore - We know these fields exist in the store
            useTradeStore.getState().updateFormField(key, value);
          }
        });

        // Submit the form data to the store
        await submitForm();

        // Reset form
        form.reset();

        return true;
      } catch (error) {
        form.setError("root", { message: error instanceof Error ? error.message : "Failed to submit trade" });
        return false;
      }
    },
    [form, submitForm]
  );

  // Handle dialog close
  const handleDialogChange = useCallback(
    (open: boolean) => {
      if (!open && showForm) {
        toggleForm();
      }

      // Reset form when dialog is closed
      if (!open) {
        form.reset();
        // Also reset the store's form data
        useTradeStore.getState().resetForm();
      }
    },
    [showForm, toggleForm, form]
  );

  return {
    form,
    onSubmit,
    handleDialogChange,
    calculatedValues: {
      rr:
        entryPrice && stopLoss && takeProfit && !isNaN(entryPrice) && !isNaN(stopLoss) && !isNaN(takeProfit)
          ? calculateRR(entryPrice, stopLoss, takeProfit)
          : 0,
      positionSize:
        riskAmount && entryPrice && stopLoss && !isNaN(riskAmount) && !isNaN(entryPrice) && !isNaN(stopLoss)
          ? calculatePositionSize(riskAmount, entryPrice, stopLoss, leverage || 1)
          : 0,
      quantity:
        riskAmount && entryPrice && stopLoss && !isNaN(riskAmount) && !isNaN(entryPrice) && !isNaN(stopLoss)
          ? calculateQuantity(calculatePositionSize(riskAmount, entryPrice, stopLoss, leverage || 1), entryPrice)
          : 0,
    },
  };
};

/**
 * Alias for useTradeForm for backward compatibility
 */
export const useShadcnTradeForm = useTradeForm;
