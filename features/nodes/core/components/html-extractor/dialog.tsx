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
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<HtmlExtractorFormValues>;
}

const extractionSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, "Invalid variable name"),
  selector: z.string().min(1, "CSS selector is required"),
  returnValue: z.enum(["text", "html", "attribute"]),
  attribute: z.string().optional(),
  skipSelectors: z.string().optional(),
  returnArray: z.boolean(),
});

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  sourceHtml: z.string().optional(),
  extractions: z.array(extractionSchema).min(1, "Add at least one extraction field"),
});
export type HtmlExtractorFormValues = z.infer<typeof formSchema>;

export const HtmlExtractorDialog = ({ open, onOpenChange, onSubmit, defaultValues }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues?.variableName || "",
      sourceHtml: defaultValues?.sourceHtml || "",
      extractions: defaultValues?.extractions || [
        {
          key: "",
          selector: "",
          returnValue: "text",
          skipSelectors: "",
          returnArray: true,
        },
      ],
    }

  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "extractions",
  });

  const watchVariableName =
    useWatch({
      control: form.control,
      name: "variableName",
    }) || "htmlData";
  const watchedExtractions = useWatch({
    control: form.control,
    name: "extractions",
  });

  const handleSubmit = (values: HtmlExtractorFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues?.variableName || "",
        sourceHtml: defaultValues?.sourceHtml || "",
        extractions:
          defaultValues?.extractions || [
            {
              key: "",
              selector: "",
              returnValue: "text",
              skipSelectors: "",
              returnArray: true,
            },
          ],
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>HTML Extractor</DialogTitle>
          <DialogDescription>
            Extract structured data from HTML using CSS selectors.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            {/* Variable Name */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="htmlData" {...field} />
                  </FormControl>
                  <FormDescription>
                    Reference this data as <code>{`{{${watchVariableName}}}`}</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Source HTML */}
            <FormField
              control={form.control}
              name="sourceHtml"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTML Source</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px] font-mono text-sm"
                      placeholder="To use previous node output use {{variableName}} or paste the html here"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Paste HTML here or leave empty to extract from upstream data.
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              {fields.map((item, index) => {
                const returnValue = watchedExtractions?.[index]?.returnValue;

                return (
                  <div
                    key={item.id}
                    className="rounded-md border p-4 space-y-4"
                  >
                    {/* Key */}
                    <FormField
                      control={form.control}
                      name={`extractions.${index}.key`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input placeholder="price" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Selector */}
                    <FormField
                      control={form.control}
                      name={`extractions.${index}.selector`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CSS Selector</FormLabel>
                          <FormControl>
                            <Input placeholder=".price" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Return Value */}
                    <FormField
                      control={form.control}
                      name={`extractions.${index}.returnValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Value</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="html">HTML</SelectItem>
                              <SelectItem value="attribute">Attribute</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* ✅ Attribute Name (conditional) */}
                    {returnValue === "attribute" && (
                      <FormField
                        control={form.control}
                        name={`extractions.${index}.attribute`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attribute Name</FormLabel>
                            <FormControl>
                              <Input placeholder="href" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Skip selectors */}
                    <FormField
                      control={form.control}
                      name={`extractions.${index}.skipSelectors`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skip Selectors</FormLabel>
                          <FormControl>
                            <Input placeholder="img, svg, .icon" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                    >
                      Remove Extraction
                    </Button>
                  </div>
                );
              })}
            </div>


            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                append({
                  key: "",
                  selector: "",
                  returnValue: "text",
                  skipSelectors: "",
                  returnArray: true,
                })
              }
            >
              + Add Extraction
            </Button>

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