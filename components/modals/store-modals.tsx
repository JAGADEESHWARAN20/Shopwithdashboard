import * as React from "react";
import * as z from "zod";
import  axios  from "axios";
import {useState} from "react";
import { useStoreModal } from "@/hooks/use-store-modal";
import { Modal } from "@/components/ui/modal";
import { useForm, FormProvider } from "react-hook-form"; // Import FormProvider
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl, FormField, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const formSchema = z.object({
    name: z.string().min(1),
});

export const StoreModal = () => {
    const storeModal = useStoreModal();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            setLoading(true);
            const response = await axios.post('/api/stores',values);
            window.location.assign(`/${response.data.id}`);
        }catch(error){
            toast.error("Something went wrong");
        }finally{
            setLoading(false);
        }
    };

    return (
        <Modal title="Create Store" description="Add a new Store to manage products and Categories" isOpen={storeModal.isOpen} onClose={storeModal.onClose}>
            <div className="space-y-4 py-2 pb-4">
                {/* Wrap the form with the FormProvider component */}
                <FormProvider {...form}> 
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="E-commerce" {...field} />
                                    </FormControl> 
                                    <FormMessage />
                                </FormItem> 
                            )}
                        />
                        <div className="pt-6 space-x-2 flex items-center justify-end w-full ">
                                <Button disabled={loading} variant="outline" onClick={storeModal.onClose}>
                                    cancel
                                </Button>
                                 <Button disabled={loading} type="submit">
                                    Continue
                                </Button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </Modal>
    );
};
