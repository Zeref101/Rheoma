"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormDescription,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<LimitFormValues>;
}

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  sourceData: z
    .string()
    .min(1, {
      message: "Source's variable name is required",
    })
    .nonoptional(),
  limit: z.number().int().default(1).nonoptional(),
  mode: z.enum(["first", "last"]).default("first").nonoptional(),
});
export type LimitFormValues = z.infer<typeof formSchema>;

export const LimitDialog = ({ open, onOpenChange, onSubmit, defaultValues }: Props) => {
  const form = useForm<LimitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues?.variableName ?? "",
      sourceData: defaultValues?.sourceData ?? "",
      mode: defaultValues?.mode ?? "first",
      limit: defaultValues?.limit ?? 1,
    },
  });

  const watchVariableName =
    useWatch({
      control: form.control,
      name: "variableName",
    }) || "limitData";

  const handleSubmit = (values: LimitFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues?.variableName ?? "",
        sourceData: defaultValues?.sourceData ?? "",
        mode: defaultValues?.mode ?? "first",
        limit: defaultValues?.limit ?? 1,
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Limit Configuration</DialogTitle>
          <DialogDescription>Restricts the number of items</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="limitData" {...field} />
                  </FormControl>
                  <FormDescription>
                    Reference output as <code>{`{{${watchVariableName}}}`}</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sourceData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Node Variable</FormLabel>
                  <FormControl>
                    <Input placeholder="{{json splitData}}" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the variable name from a previous node (for example:{" "}
                    <code>{`{{json splitData}}`}</code>)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Items</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </FormControl>
                  <FormDescription>
                    If there are more items than this number, some are removed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keep</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="first">First Items</SelectItem>
                      <SelectItem value="last">Last Items</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription></FormDescription>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
