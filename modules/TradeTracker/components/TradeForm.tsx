"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useTradeStore } from "@/modules/TradeTracker/store";
import { useTradeForm } from "@/modules/TradeTracker/hooks";
import { SIDE_OPTIONS, TIMEFRAME_OPTIONS, DEFAULT_FORM_VALUES } from "@/modules/TradeTracker/constants";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";

/**
 * Enhanced Trade form component using Shadcn UI Form
 * Optimized with react-hook-form and zod validation
 */
export const TradeForm: React.FC = () => {
  const { showForm, toggleForm, isEditMode, formData } = useTradeStore();
  const { form, onSubmit, handleDialogChange, calculatedValues } = useTradeForm();

  // We don't need to log form values anymore

  const handleAddTradeClick = () => {
    // Make sure we're not in edit mode when adding a new trade
    if (isEditMode) {
      useTradeStore.getState().resetForm();
    }
    toggleForm();
  };

  const renderTrigger = () => (
    <DialogTrigger asChild>
      <Button onClick={handleAddTradeClick}>Add Trade</Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={showForm} onOpenChange={handleDialogChange}>
      {renderTrigger()}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Trade" : "Add New Trade"}</DialogTitle>
        </DialogHeader>

        {form.formState.errors.root?.message && (
          <div className="px-4 py-3 mb-4 border rounded text-destructive bg-destructive/10 border-destructive/20">
            {form.formState.errors.root.message}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Entry Date and Exit Date */}
              <FormField
                control={form.control}
                name="entryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Time</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        modal={true}
                        date={field.value ? new Date(field.value) : undefined}
                        setDate={(date) => {
                          field.onChange(date ? date.toISOString() : "");
                        }}
                        placeholder="Select entry date/time"
                        className="shadow-sm"
                        onPopoverClose={() => {
                          // Ensure the field is marked as touched when popover closes
                          form.trigger("entryTime");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exitTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Time</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        modal={true}
                        date={field.value ? new Date(field.value) : undefined}
                        setDate={(date) => {
                          field.onChange(date ? date.toISOString() : "");
                        }}
                        placeholder="Select exit date/time"
                        className="shadow-sm"
                        onPopoverClose={() => {
                          // Ensure the field is marked as touched when popover closes
                          form.trigger("exitTime");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Symbol and Risk Amount */}
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol *</FormLabel>
                    <FormControl>
                      <Input placeholder="BTC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Side and Timeframe */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="side"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Side *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select side" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SIDE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeframe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeframe</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMEFRAME_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Entry Price and Leverage */}
              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min={0}
                        step="0.01"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="riskAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.0"
                        min={0}
                        step="0.1"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stop Loss and Take Profit */}
              <FormField
                control={form.control}
                name="stopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min={0}
                        step="0.01"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="takeProfit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Take Profit *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min={0}
                        step="0.01"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Strategy */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="strategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strategy</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Breakout, Support/Resistance, Moving Average Crossover..."
                          rows={3}
                          className="resize-y min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add details about market conditions, your thought process, what went well or could be improved..."
                          rows={4}
                          className="resize-y min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              <Button
                type="button"
                onClick={() => {
                  // Reset form to default values
                  if (isEditMode) {
                    // In edit mode, reset to the original trade data
                    form.reset(formData);
                  } else {
                    // In add mode, reset to empty form with defaults
                    form.reset(getDefaultFormValues());
                  }
                }}
                variant="outline"
              >
                Reset
              </Button>
              <Button type="button" onClick={toggleForm} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : isEditMode ? "Update Trade" : "Add Trade"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
