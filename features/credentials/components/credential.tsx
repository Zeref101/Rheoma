"use client";

import { CredentialType } from "@/app/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useCreateCredential, useSuspenseCredential, useUpdateCredential } from "../hooks/use-credentials";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(CredentialType),
    value: z.string().min(1, "API key is required"),
})

interface CredentialFormProps {
    initialData?: {
        id?: string;
        name: string;
        type: CredentialType;
        value: string;
    };
};

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
    {
        value: CredentialType.OPENAI,
        label: "OpenAI",
        logo: "/logos/openai.svg",
    },
    {
        value: CredentialType.ANTHROPIC,
        label: "Anthropic",
        logo: "/logos/anthropic.svg",
    },
    {
        value: CredentialType.GEMINI,
        label: "Gemini",
        logo: "/logos/gemini.svg",
    },

];

export const CredentialForm = ({
    initialData
}: CredentialFormProps) => {
    const router = useRouter();
    const createCredential = useCreateCredential();
    const updateCredential = useUpdateCredential();

    const isEdit = !!initialData?.id;
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            type: CredentialType.OPENAI,
            value: ""
        }
    });

    const onSubmit = async (values: FormValues) => {
        if (isEdit && initialData?.id) {
            await updateCredential.mutateAsync({
                id: initialData?.id,
                ...values
            })
        } else {
            await createCredential.mutateAsync(values, {
                onError: (error) => {
                    toast.error("Failed to create the credential");
                    throw error;
                },
                onSuccess: () => {
                    toast.success("Successfully created the credential");
                    router.push(`/credentials/${createCredential.data?.id}`);
                }
            })
        }
    }
    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>
                    {isEdit ? "Edit Credential" : "Create Credential"}
                </CardTitle>
                <CardDescription>
                    {isEdit
                        ? "Update your API key or credential details"
                        : "Add a new API key or credential to your account"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="My API key" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )

                            }}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {credentialTypeOptions.map((option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Image
                                                                src={option.logo}
                                                                alt={option.label}
                                                                width={16}
                                                                height={16}
                                                            />
                                                            {option.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )

                            }}
                        />
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="sk-********************************" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )

                            }}
                        />
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={
                                    createCredential.isPending || updateCredential.isPending
                                }
                            >
                                {isEdit ? "Update" : "Create"}
                            </Button>
                            <Button
                                type="button"
                                variant={"outline"}
                                onClick={() => router.push("/credentials")}
                            >
                                <Link href={"/credentials"} prefetch>
                                    Cancel
                                </Link>
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
    const { data: credential } = useSuspenseCredential(credentialId);

    return <CredentialForm initialData={credential} />
}