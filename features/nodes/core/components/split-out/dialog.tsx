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
import { Switch } from "@/components/ui/switch";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<SplitOutFormValues>;
}

export const MODE = ["zip", "single"] as const;

export type splitModes = (typeof MODE)[number];
const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  fields: z.array(z.string()).min(1),
  fieldsInput: z.string(),
  sourceData: z
    .string()
    .min(1, {
      message: "Source's variable name is required",
    })
    .nonoptional(),
  mode: z.enum(["zip", "single"]).default("single").nonoptional(),
  keepOtherFields: z.boolean().default(true).nonoptional(),
});
export type SplitOutFormValues = z.infer<typeof formSchema>;

export const SplitOutDialog = ({ open, onOpenChange, onSubmit, defaultValues }: Props) => {
  const form = useForm<SplitOutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues?.variableName ?? "",
      fields: defaultValues?.fields ?? [],
      fieldsInput: (defaultValues?.fields ?? []).join(", "),
      sourceData: defaultValues?.sourceData ?? "",
      mode: defaultValues?.mode ?? "single",
      keepOtherFields: defaultValues?.keepOtherFields ?? false,
    },
  });

  const watchVariableName =
    useWatch({
      control: form.control,
      name: "variableName",
    }) || "splitData";

  const handleSubmit = (values: SplitOutFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues?.variableName ?? "",
        fields: defaultValues?.fields ?? [],
        fieldsInput: (defaultValues?.fields ?? []).join(", "),
        mode: defaultValues?.mode ?? "single",
        sourceData: defaultValues?.sourceData ?? "",
        keepOtherFields: defaultValues?.keepOtherFields ?? false,
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Split Out Configuration</DialogTitle>
          <DialogDescription>
            Separates a single data item containing a list into multiple items
          </DialogDescription>
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
                    <Input placeholder="splitData" {...field} />
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
                    <Input placeholder="{{json htmlData}}" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the variable name from a previous node (for example:{" "}
                    <code>{`{{json htmlData}}`}</code>)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fieldsInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fields to Split</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="title, link, author"
                      {...field}
                      onBlur={(e) => {
                        const parsed = e.target.value
                          .split(",")
                          .map((v) => v.trim())
                          .filter(Boolean);

                        form.setValue("fields", parsed, { shouldValidate: true });
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated array fields from the input data
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
                  <FormLabel>Split Mode</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">Single (one array, copy others)</SelectItem>
                      <SelectItem value="zip">Zip (align arrays by index)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === "zip"
                      ? "Align multiple arrays by index"
                      : "Split one array and copy remaining fields"}
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keepOtherFields"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <FormLabel>Keep Other Fields</FormLabel>
                    <FormDescription>Include non-split fields in each output item</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
