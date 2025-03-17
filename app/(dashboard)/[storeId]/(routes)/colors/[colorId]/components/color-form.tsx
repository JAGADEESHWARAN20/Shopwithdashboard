"use client";

import { Color } from "@prisma/client";
import * as z from 'zod'
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Separator } from "../../../../../../../components/ui/separator";
import { Heading } from "../../../../../../../components/ui/heading";
import { Button } from "../../../../../../../components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '../../../../../../../components/ui/form';
import { Input } from '../../../../../../../components/ui/input';
import { AlertModel } from "../../../../../../../components/modals/alert-model";
import { ChromePicker, ColorResult } from "react-color";

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().refine(value => !value || (value.length >= 4 && /^#([0-9A-Fa-f]{3}){1,2}$/.test(value)), {
        message: 'String must be a valid hex code with at least 4 characters'
    }),
});

type ColorFormValues = z.infer<typeof formSchema>;

interface ColorFormProps {
    initialData: Color | null;
}

export const ColorForm: React.FC<ColorFormProps> = ({
    initialData,
}) => {
    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [color, setColor] = useState<string>(initialData?.value || '#FFFFFF');
    const [displayColorPicker, setDisplayColorPicker] = useState(false);

    const title = initialData ? "Edit Color" : "Create Color";
    const description = initialData ? "Edit a Color" : "add a new Color";
    const toastMessage = initialData ? "Color Updated" : "Create Color";
    const action = initialData ? "Save changes" : "Create";

    const form = useForm<ColorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            value: ''
        }
    });

  const onSubmit = async (data: ColorFormValues) => {
    try {
      setLoading(true);
      const colorData = { ...data, value: color }; // Include the color value

      if (initialData) {
        // PATCH for update
        await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, colorData);
      } else {
        // POST for creation
        await axios.post(`/api/${params.storeId}/colors`, colorData);
      }

      router.push(`/${params.storeId}/colors`);
      router.refresh();
      toast.success(toastMessage);
    } catch {
      toast.error("its not working");
    } finally {
      setLoading(false);
    }
  };

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`)
            router.refresh();
            router.push(`/${params.storeId}/colors`);
            toast.success("Color Deleted");
        } catch (error) {
            toast.error("Make sure you remove all products and sizes first")
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    const handleColorChange = useCallback((color: ColorResult) => {
        setColor(color.hex);
    }, []);

    const handleClick = () => {
        setDisplayColorPicker(!displayColorPicker);
    };

    const handleClose = () => {
        setDisplayColorPicker(false);
    };

    const popover = {
        position: 'absolute' as 'absolute',
        zIndex: '2',
    };

    const cover = {
        position: 'fixed' as 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
    };

    return (
        <>
            <AlertModel
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <div className="flex items-center justify-between">
                <Heading
                    title={title}
                    description={description}
                />
                {initialData && (
                    <Button
                        disabled={loading}
                        suppressHydrationWarning={true}
                        variant="destructive"
                        size="icon"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 w-full'>
                    <div className='grid grid-cols-3 gap-8'>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder='Color name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Value
                                    </FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-x-4 relative">
                                            <Input
                                                disabled={loading}
                                                placeholder='Color value'
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                            />
                                            <div
                                                className={`border rounded-full p-4 cursor-pointer`}
                                                style={{ backgroundColor: color }}
                                                onClick={handleClick}
                                            />
                                            {displayColorPicker ? (
                                                <div style={popover}>
                                                    <div style={cover} onClick={handleClose} />
                                                    <ChromePicker color={color} onChange={handleColorChange} />
                                                </div>
                                            ) : null}

                                            <Input
                                                type="hidden"
                                                {...field}
                                                value={color}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button suppressHydrationWarning={true} disabled={loading} className="ml-auto" type='submit'>
                        {action}
                    </Button>
                </form>
            </Form>
            <Separator />
        </>
    );
}