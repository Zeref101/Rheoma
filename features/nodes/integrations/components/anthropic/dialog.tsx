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
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { CredentialType } from "@/app/generated/prisma/enums";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import Image from "next/image";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<AnthropicFormValues>;
}

export const AVAILABLE_MODELS = ["claude-sonnet-4-5", "claude-3-5-sonnet-20241022"] as const;

export type AnthropicModel = (typeof AVAILABLE_MODELS)[number];

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contains only letters, number and underscores",
    }),
  credentialId: z.string().min(1, "Credential is required"),
  model: z.enum(AVAILABLE_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
});

export type AnthropicFormValues = z.infer<typeof formSchema>;

export const AnthropicDialog = ({ open, onOpenChange, onSubmit, defaultValues }: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } = useCredentialsByType(
    CredentialType.ANTHROPIC
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues?.credentialId || "",
      variableName: defaultValues?.variableName || "",
      model: defaultValues?.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues?.systemPrompt,
      userPrompt: defaultValues?.userPrompt,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const watchVariableName =
    useWatch({
      control: form.control,
      name: "variableName",
    }) || "anthropicCall";

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues?.variableName || "",
        model: defaultValues?.model || AVAILABLE_MODELS[0],
        systemPrompt: defaultValues?.systemPrompt,
        userPrompt: defaultValues?.userPrompt,
      });
    }
  }, [
    defaultValues?.model,
    defaultValues?.systemPrompt,
    defaultValues?.userPrompt,
    defaultValues?.variableName,
    form,
    open,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden flex flex-col">

        <DialogHeader>
          <DialogTitle>Anthropic Configuration</DialogTitle>
          <DialogDescription>Configure the AI model and prompt for this node.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-4 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto space-y-8 pr-2">
              <FormField
                control={form.control}
                name="variableName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Name</FormLabel>
                    <FormControl>
                      <Input placeholder="anthropicCall" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use this name to reference the result in other nodes:{" "}
                      {`{{${watchVariableName}.response}}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credentialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gemini Credential</FormLabel>
                    <Select
                      disabled={isLoadingCredentials || !credentials}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a credential" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentials?.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={"/logos/anthropic.svg"}
                                alt={"anthropic"}
                                width={16}
                                height={16}
                              />
                              {option.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Credential to use Anthropic models</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The Anthropic models to use for completion</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={"You are a helpful assistant"}
                        className="min-h-20 font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Sets the behaviour of the assistant. Use {"{{variables}}"} for single values or{" "}
                      {"{{json variable}}"} to stringify objects
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={"Analyse this data: {{json response.data}}"}
                        className="min-h-[120px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The prompt to send to the AI. Use {"{{variables}}"} for simple values or{" "}
                      {"{{json variable}}"} to stringify objects
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <DialogFooter className="sticky bottom-0 bg-background pt-4">
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
