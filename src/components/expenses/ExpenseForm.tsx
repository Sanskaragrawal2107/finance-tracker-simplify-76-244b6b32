
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Expense, ExpenseCategory } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const EXPENSE_CATEGORIES = [
  "STAFF TRAVELLING CHARGES",
  "STATIONARY & PRINTING",
  "DIESEL & FUEL CHARGES",
  "LABOUR TRAVELLING EXP.",
  "LOADGING & BOARDING FOR STAFF",
  "FOOD CHARGES FOR LABOUR",
  "SITE EXPENSES",
  "ROOM RENT FOR LABOUR"
];

// Define the validation schema for the expense form
const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  recipientType: z.enum(["contractor", "worker"], {
    required_error: "Please select contractor or worker",
  }),
  recipientName: z.string().min(2, {
    message: "Name must be at least 2 characters",
  }),
  purpose: z.string().min(5, {
    message: "Purpose description must be at least 5 characters",
  }),
  category: z.string({
    required_error: "Category is required",
  }),
  amount: z.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }).positive({
    message: "Amount must be a positive number",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Partial<Expense>) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      amount: undefined,
      purpose: "",
    },
  });

  // Function to analyze purpose text using Gemini API
  const analyzePurpose = async (purposeText: string) => {
    if (!purposeText || purposeText.length < 5) return;
    
    setIsAnalyzing(true);
    try {
      const apiKey = "AIzaSyDwqj1YcFKVzpLc_4ZyC_s9YAMCONx57RI";
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
      
      const prompt = `
Given this expense description: "${purposeText}"
Classify it into exactly ONE of these categories:
- STAFF TRAVELLING CHARGES
- STATIONARY & PRINTING
- DIESEL & FUEL CHARGES
- LABOUR TRAVELLING EXP.
- LOADGING & BOARDING FOR STAFF
- FOOD CHARGES FOR LABOUR
- SITE EXPENSES
- ROOM RENT FOR LABOUR

Return ONLY the category name, with no additional text or explanation.
`;

      const response = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 50,
          },
        }),
      });

      const data = await response.json();
      
      // Extract the category from the response
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const categoryText = data.candidates[0].content.parts[0].text.trim();
        
        // Check if the returned category is in our list
        const matchedCategory = EXPENSE_CATEGORIES.find(cat => 
          categoryText.includes(cat)
        );
        
        if (matchedCategory) {
          form.setValue("category", matchedCategory);
          toast.success("Category detected");
        } else {
          toast.warning("Could not determine category");
        }
      }
    } catch (error) {
      console.error("Error analyzing purpose:", error);
      toast.error("Failed to analyze purpose");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (values: FormValues) => {
    // Create a new expense object
    const newExpense: Partial<Expense> = {
      date: values.date,
      description: values.purpose,
      category: values.category as unknown as ExpenseCategory,
      amount: values.amount,
      status: "pending" as any, // Default status
      createdBy: "Current User", // This should be replaced with actual user
      createdAt: new Date(),
    };

    onSubmit(newExpense);
    form.reset();
    onClose();
  };

  // Blur handler for purpose field to trigger analysis
  const handlePurposeBlur = () => {
    const purposeValue = form.getValues("purpose");
    if (purposeValue && purposeValue.length >= 5) {
      analyzePurpose(purposeValue);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Expense</DialogTitle>
          <DialogDescription>
            Enter the details for the new expense.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Date Field */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recipient Type Field */}
            <FormField
              control={form.control}
              name="recipientType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Recipient Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="contractor" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Contractor
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="worker" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Worker
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recipient Name Field */}
            <FormField
              control={form.control}
              name="recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purpose Field */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the purpose of this expense..." 
                      className="resize-none" 
                      {...field} 
                      onBlur={handlePurposeBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Category
                    {isAnalyzing && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseFloat(value) : undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Submit Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseForm;
