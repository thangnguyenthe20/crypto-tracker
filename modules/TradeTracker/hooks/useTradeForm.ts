import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTradeStore } from "../store";
import { tradeFormSchema, TradeFormValues } from "../schemas/tradeFormSchema";
import { calculateRR, calculatePositionSize, calculateQuantity } from "../utils";
import { DEFAULT_FORM_VALUES, getDefaultFormValues } from "../constants";

/**
 * Enhanced Trade form hook using react-hook-form and zod validation
 */
export const useTradeForm = () => {
  const { submitForm, toggleForm, showForm, formData, isEditMode } = useTradeStore();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: isEditMode ? formData : getDefaultFormValues(),
    mode: "onChange",
  });

  const { watch } = form;

  // Watch for changes to calculate derived values
  const entryPrice = watch("entryPrice");
  const stopLoss = watch("stopLoss");
  const takeProfit = watch("takeProfit");
  const riskAmount = watch("riskAmount");
  const side = watch("side");
  // const leverage = watch("leverage");

  // Update form values when formData changes (for edit mode)
  useEffect(() => {
    if (isEditMode && Object.keys(formData).length > 0) {
      // Update form values with formData
      form.reset(formData, { keepDefaultValues: true });
    }
  }, [formData, isEditMode, form]);

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
      const positionSize = calculatePositionSize(riskAmount, entryPrice, stopLoss);
      const quantity = calculateQuantity(positionSize, entryPrice);

      form.setValue("positionSize", positionSize, { shouldValidate: false });
      form.setValue("quantity", quantity, { shouldValidate: false });
    } else {
      // Set default values when inputs are missing or invalid
      form.setValue("positionSize", 0, { shouldValidate: false });
      form.setValue("quantity", 0, { shouldValidate: false });
    }
  }, [entryPrice, stopLoss, takeProfit, riskAmount, form, side]);

  // Handle form submission
  const onSubmit = useCallback(
    async (data: TradeFormValues) => {
      try {
        // The validation is already handled by zod schema, but we'll add a safety check
        const requiredFields = ["symbol", "entryPrice", "stopLoss", "takeProfit"];
        for (const field of requiredFields) {
          if (!data[field as keyof TradeFormValues]) {
            form.setError(field as any, { message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required` });
            return false;
          }
        }

        // Calculate derived values
        const calculatedValues = {
          rr: calculateRR(data.entryPrice!, data.stopLoss!, data.takeProfit!),
          positionSize: data.riskAmount ? calculatePositionSize(data.riskAmount, data.entryPrice!, data.stopLoss!) : 0,
          quantity: 0,
        };

        // Calculate quantity based on position size
        if (calculatedValues.positionSize > 0) {
          calculatedValues.quantity = calculateQuantity(calculatedValues.positionSize, data.entryPrice!);
        }

        // Prepare complete form data with calculated values
        const completeFormData = {
          ...data,
          ...calculatedValues,
        };

        // Update the store's formData with the complete data
        useTradeStore.getState().setFormData(completeFormData);

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
      } else if (open && isEditMode) {
        // When opening in edit mode, reset the form with the current formData
        form.reset(formData);

        // Force a re-render to ensure the form values are updated
        setTimeout(() => {
          form.trigger();
        }, 0);
      } else if (open && !isEditMode) {
        // When opening in add mode, make sure form is reset to defaults
        const defaultValues = getDefaultFormValues();
        form.reset(defaultValues);

        // Also reset the store's form data to ensure clean state
        useTradeStore.getState().resetForm();
      }
    },
    [showForm, toggleForm, form, isEditMode, formData]
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
          ? calculatePositionSize(riskAmount, entryPrice, stopLoss)
          : 0,
      quantity:
        riskAmount && entryPrice && stopLoss && !isNaN(riskAmount) && !isNaN(entryPrice) && !isNaN(stopLoss)
          ? calculateQuantity(calculatePositionSize(riskAmount, entryPrice, stopLoss), entryPrice)
          : 0,
    },
  };
};
