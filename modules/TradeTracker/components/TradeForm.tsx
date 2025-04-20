"use client";

import React, { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useTradeStore } from "@/modules/TradeTracker/store";
import { useTradeForm } from "@/modules/TradeTracker/hooks";
import { SIDE_OPTIONS, TIMEFRAME_OPTIONS } from "@/modules/TradeTracker/constants";
import { calculateQuantity, calculatePositionSize } from "@/modules/TradeTracker/utils";
import clsx from "clsx";

interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  placeholder: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  step?: string;
  colSpan?: number;
  rows?: number;
  helpText?: string;
}

interface FormFieldProps {
  field: FormField;
}

const FormField = ({ field }: FormFieldProps) => {
  const { formData, validationErrors, handleChange } = useTradeForm();
  const fieldName = field.name as keyof typeof formData;
  const hasError = !!validationErrors[field.name];
  const errorMessage = validationErrors[field.name];
  const fieldValue = formData[fieldName] || "";

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className={hasError ? "text-destructive" : ""}>
        {field.label}
      </Label>

      {field.type === "select" ? (
        <Select
          name={field.name}
          value={String(fieldValue)}
          onValueChange={(value) => {
            const event = {
              target: { name: field.name, value },
            } as React.ChangeEvent<HTMLSelectElement>;
            handleChange(event);
          }}
        >
          <SelectTrigger className={clsx("w-full", hasError ? "border-destructive" : "")}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "textarea" ? (
        <Textarea
          id={field.name}
          name={field.name}
          value={String(fieldValue)}
          onChange={handleChange}
          placeholder={field.placeholder}
          rows={field.rows}
          className={hasError ? "border-destructive" : ""}
        />
      ) : field.type === "number" ? (
        <Input
          id={field.name}
          name={field.name}
          type="number"
          value={String(fieldValue)}
          onChange={handleChange}
          placeholder={field.placeholder}
          min={field.min}
          step={field.step}
          className={hasError ? "border-destructive" : ""}
        />
      ) : (
        <Input
          id={field.name}
          name={field.name}
          type="text"
          value={String(fieldValue)}
          onChange={handleChange}
          placeholder={field.placeholder}
          className={hasError ? "border-destructive" : ""}
        />
      )}

      {/* Help text */}
      {field.helpText && !hasError && <p className="text-xs text-muted-foreground">{field.helpText}</p>}

      {/* Validation error */}
      {hasError && <p className="text-xs text-destructive">{errorMessage}</p>}
    </div>
  );
};

/**
 * Enhanced Trade form component for adding new trades
 * Optimized with memoization, better field organization, and improved validation
 * Now using shadcn UI components and displayed in a modal
 */
export const TradeForm: React.FC = () => {
  const { showForm, toggleForm } = useTradeStore();
  const { formData, isSubmitting, formError, validationErrors, handleSubmit, resetForm } = useTradeForm();
  // Calculate position size and quantity for display
  const calculatedValues = useMemo(() => {
    const values = {
      positionSize: 0,
      quantity: 0,
      rr: formData.rr || 0,
    };

    if (formData.riskAmount && formData.entryPrice && formData.stopLoss) {
      values.positionSize = calculatePositionSize(
        Number(formData.riskAmount),
        Number(formData.entryPrice),
        Number(formData.stopLoss),
        Number(formData.leverage || 1)
      );

      values.quantity = calculateQuantity(values.positionSize, Number(formData.entryPrice));
    }

    return values;
  }, [formData.riskAmount, formData.entryPrice, formData.stopLoss, formData.leverage, formData.rr]);

  // Define form fields configuration with help text
  const formFields: FormField[] = useMemo(
    () => [
      {
        name: "entryPrice",
        label: "Entry Price *",
        type: "number",
        placeholder: "0.00",
        required: true,
        min: 0,
        step: "0.01",
      },
      {
        name: "leverage",
        label: "Leverage",
        type: "number",
        placeholder: "1",
        min: 1,
        step: "0.1",
      },
      {
        name: "stopLoss",
        label: "Stop Loss *",
        type: "number",
        placeholder: "0.00",
        required: true,
        min: 0,
        step: "0.01",
      },
      {
        name: "takeProfit",
        label: "Take Profit *",
        type: "number",
        placeholder: "0.00",
        required: true,
        min: 0,
        step: "0.01",
      },
      {
        name: "strategy",
        label: "Strategy",
        type: "textarea",
        placeholder: "Breakout",
        colSpan: 2,
        rows: 3,
      },
      {
        name: "note",
        label: "Notes",
        type: "textarea",
        placeholder: "Add any trade notes here...",
        colSpan: 2,
        rows: 3,
      },
    ],
    []
  );

  // Handle form submission
  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const success = handleSubmit(e);
      console.log("Form submission result:", success, "Validation errors:", validationErrors);
      // The submitForm function in the store will handle the form closing
      // after successful submission
    },
    [handleSubmit, validationErrors]
  );

  // Handle dialog close
  const handleDialogChange = useCallback(
    (open: boolean) => {
      console.log("Dialog change:", open, "Current showForm state:", showForm);
      if (!open && showForm) {
        toggleForm();
      }

      // Reset form when dialog is closed
      if (!open) {
        resetForm();
        console.log("Form reset due to dialog close");
      }
    },
    [showForm, toggleForm, resetForm]
  );

  // Render form field based on its type using shadcn UI components
  // const renderField = useCallback(
  //   (field: FormField) => {
  //     const fieldName = field.name as keyof typeof formData;
  //     const hasError = !!validationErrors[field.name];
  //     const errorMessage = validationErrors[field.name];
  //     const fieldValue = formData[fieldName] || "";

  //     return (
  //       <div className="space-y-2">
  //         <Label htmlFor={field.name} className={hasError ? "text-destructive" : ""}>
  //           {field.label}
  //         </Label>

  //         {field.type === "select" ? (
  //           <Select
  //             name={field.name}
  //             value={String(fieldValue)}
  //             onValueChange={(value) => {
  //               const event = {
  //                 target: { name: field.name, value },
  //               } as React.ChangeEvent<HTMLSelectElement>;
  //               handleChange(event);
  //             }}
  //           >
  //             <SelectTrigger className={hasError ? "border-destructive" : ""}>
  //               <SelectValue placeholder={field.placeholder} />
  //             </SelectTrigger>
  //             <SelectContent>
  //               {field.options?.map((option) => (
  //                 <SelectItem key={option.value} value={option.value}>
  //                   {option.label}
  //                 </SelectItem>
  //               ))}
  //             </SelectContent>
  //           </Select>
  //         ) : field.type === "textarea" ? (
  //           <Textarea
  //             id={field.name}
  //             name={field.name}
  //             value={String(fieldValue)}
  //             onChange={handleChange}
  //             placeholder={field.placeholder}
  //             rows={field.rows}
  //             className={hasError ? "border-destructive" : ""}
  //           />
  //         ) : field.type === "number" ? (
  //           <Input
  //             id={field.name}
  //             name={field.name}
  //             type="number"
  //             value={String(fieldValue)}
  //             onChange={handleChange}
  //             placeholder={field.placeholder}
  //             min={field.min}
  //             step={field.step}
  //             className={hasError ? "border-destructive" : ""}
  //           />
  //         ) : (
  //           <Input
  //             id={field.name}
  //             name={field.name}
  //             type="text"
  //             value={String(fieldValue)}
  //             onChange={handleChange}
  //             placeholder={field.placeholder}
  //             className={hasError ? "border-destructive" : ""}
  //           />
  //         )}

  //         {/* Help text */}
  //         {field.helpText && !hasError && <p className="text-xs text-muted-foreground">{field.helpText}</p>}

  //         {/* Validation error */}
  //         {hasError && <p className="text-xs text-destructive">{errorMessage}</p>}
  //       </div>
  //     );
  //   },
  //   [formData, handleChange, validationErrors]
  // );

  // Render the Add Trade button that opens the dialog
  const renderTrigger = () => (
    <DialogTrigger asChild>
      <Button onClick={toggleForm}>Add Trade</Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={showForm} onOpenChange={handleDialogChange}>
      {renderTrigger()}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Trade</DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="px-4 py-3 mb-4 border rounded text-destructive bg-destructive/10 border-destructive/20">
            {formError}
          </div>
        )}

        <form id="trade-form" onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                field={{
                  name: "symbol",
                  label: "Symbol *",
                  type: "text",
                  placeholder: "BTC",
                  required: true,
                }}
              />
              <FormField
                field={{
                  name: "riskAmount",
                  label: "Risk Amount ($)",
                  type: "number",
                  placeholder: "0.0",
                  min: 0,
                  step: "0.1",
                  required: true,
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                field={{
                  name: "side",
                  label: "Side *",
                  type: "select",
                  placeholder: "",
                  required: true,
                  options: SIDE_OPTIONS,
                }}
              />
              <FormField
                field={{
                  name: "timeframe",
                  label: "Timeframe",
                  type: "select",
                  placeholder: "",
                  options: TIMEFRAME_OPTIONS,
                }}
              />
            </div>
            {formFields.map((field) => (
              <div key={field.name} className={field.colSpan === 2 ? "md:col-span-2" : ""}>
                {/* {renderField(field)} */}
                <FormField field={field} />
              </div>
            ))}
          </div>

          {/* Display calculated values */}
          {(calculatedValues.rr > 0 || calculatedValues.quantity > 0) && (
            <div className="p-4 mt-4 border rounded-md bg-primary/5 border-primary/20">
              <h3 className="mb-2 text-sm font-medium">Calculated Values:</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {calculatedValues.rr > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Risk/Reward:</span>
                    <p className="text-sm font-medium">{calculatedValues.rr.toFixed(2)}</p>
                  </div>
                )}
                {calculatedValues.positionSize > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Position Size:</span>
                    <p className="text-sm font-medium">${calculatedValues.positionSize.toFixed(2)}</p>
                  </div>
                )}
                {calculatedValues.quantity > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Quantity:</span>
                    <p className="text-sm font-medium">
                      {calculatedValues.quantity < 0.001
                        ? calculatedValues.quantity.toFixed(6)
                        : calculatedValues.quantity.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" onClick={resetForm} variant="outline">
              Reset
            </Button>
            <Button type="button" onClick={toggleForm} variant="outline">
              Cancel
            </Button>
            <Button
              type="submit"
              form="trade-form"
              disabled={isSubmitting}
              onClick={() => console.log("Submit button clicked")}
            >
              {isSubmitting ? "Submitting..." : "Add Trade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
