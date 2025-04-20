import { useCallback, useEffect } from "react";
import { useTradeStore } from "../store";
import { calculateRR, calculateQuantity, calculatePositionSize } from "../utils";

/**
 * Enhanced custom hook for working with the trade form
 * Provides convenient methods for form handling with improved validation
 * and automatic calculations
 */
export const useTradeForm = () => {
  const {
    formData,
    isSubmitting,
    formError,
    validationErrors,
    setValidationErrors,
    setFormData,
    updateFormField,
    resetForm,
    submitForm,
  } = useTradeStore();

  // Auto-calculate derived values when form fields change
  useEffect(() => {
    // Only run calculations if we have the necessary values
    if (formData.entryPrice && formData.stopLoss && formData.takeProfit) {
      // Calculate risk-reward ratio
      const rr = calculateRR(Number(formData.entryPrice), Number(formData.stopLoss), Number(formData.takeProfit));

      // Don't trigger an update if the value hasn't changed
      if (formData.rr !== rr) {
        updateFormField("rr", rr);
      }
    }

    // Calculate position size and quantity if risk amount is provided
    if (formData.riskAmount && formData.entryPrice && formData.stopLoss) {
      const positionSize = calculatePositionSize(
        Number(formData.riskAmount),
        Number(formData.entryPrice),
        Number(formData.stopLoss),
        Number(formData.leverage || 1)
      );

      const quantity = calculateQuantity(positionSize, Number(formData.entryPrice));

      // Only update if changed
      if (formData.quantity !== quantity) {
        updateFormField("quantity", quantity);
      }
    }
  }, [
    formData.entryPrice,
    formData.stopLoss,
    formData.takeProfit,
    formData.riskAmount,
    formData.leverage,
    formData.rr,
    formData.quantity,
    updateFormField,
  ]);

  /**
   * Enhanced form field change handler with validation
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      // Parse numeric values
      if (name.match(/Price|Loss|Profit|Amount|rr|quantity|leverage|pnl|realizedRR|fee/)) {
        updateFormField(name, value === "" ? "" : parseFloat(value));
      } else {
        updateFormField(name, value);
      }
    },
    [updateFormField]
  );

  /**
   * Validate form before submission
   */
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.symbol) errors.symbol = "Symbol is required";
    if (!formData.entryPrice) errors.entryPrice = "Entry price is required";
    if (!formData.stopLoss) errors.stopLoss = "Stop loss is required";
    if (!formData.takeProfit) errors.takeProfit = "Take profit is required";

    // Logical validations
    if (formData.side === "buy") {
      if (Number(formData.stopLoss) >= Number(formData.entryPrice)) {
        errors.stopLoss = "For buy orders, stop loss must be below entry price";
      }
      if (Number(formData.takeProfit) <= Number(formData.entryPrice)) {
        errors.takeProfit = "For buy orders, take profit must be above entry price";
      }
    } else if (formData.side === "sell") {
      if (Number(formData.stopLoss) <= Number(formData.entryPrice)) {
        errors.stopLoss = "For sell orders, stop loss must be above entry price";
      }
      if (Number(formData.takeProfit) >= Number(formData.entryPrice)) {
        errors.takeProfit = "For sell orders, take profit must be below entry price";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, setValidationErrors]);

  /**
   * Enhanced form submission handler with validation
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Clear any previous form errors
      if (formError) {
        updateFormField("formError", null);
      }

      if (validateForm()) {
        submitForm();
        return true;
      }

      return false;
    },
    [submitForm, validateForm, formError, updateFormField]
  );

  /**
   * Enhanced reset form handler
   */
  const handleResetForm = useCallback(() => {
    resetForm();
  }, [resetForm]);

  return {
    formData,
    isSubmitting,
    formError,
    validationErrors,
    handleChange,
    handleSubmit,
    resetForm: handleResetForm,
    setFormData,
  };
};
