"use client";

import { useState } from 'react';
import { Check, ChevronDown, PlusCircle, Store as StoreIcon } from 'lucide-react';
import { PopoverContent, Popover, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandList, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command';
import { useRouter, useParams } from 'next/navigation';
import { useStoreModal } from '@/hooks/use-store-modal';
import { Button }  from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { store } from '@prisma/client';

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface StoreSwitcherProps extends PopoverTriggerProps {
    items: store[];
}

export default function StoreSwitcher({
    className,
    items = [],
}: StoreSwitcherProps) {
    const storeModel = useStoreModal();
    const params = useParams();
    const router = useRouter();

    const formattedItems = items.map((item) => ({
        label: item.name,
        value: item.id
    }));

    const currentStore = formattedItems.find((item) => item.value === params.storeId);

    const [open, setOpen] = useState(false);

    const onStoreSelect = (selectedStore: { value: string, label: string }) => {
        setOpen(false);
        router.push(`/${selectedStore.value}`);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
                <Button
                    suppressHydrationWarning={true}
                    variant="outline"
                    size="sm"
                    role='combobox'
                    aria-expanded={open}
                    aria-label="select a store"
                    className={cn("w-[200px] justify-between", className)}
                >
                    <StoreIcon  suppressHydrationWarning={true} className='mr-2 h-4 w-4'/>
                    {currentStore?.label}
                    <ChevronDown  suppressHydrationWarning={true} className="ml-auto h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandList>
                        <CommandInput placeholder="Search Store"/>
                        <CommandEmpty>No Store found</CommandEmpty>
                        <CommandGroup heading="Stores">
                            {formattedItems.map((store) => (
                                <CommandItem
                                    key={store.value}
                                    onSelect={() => onStoreSelect(store)}
                                    className="text-sm"
                                >
                                    <StoreIcon className="mr-2 h-4 w-4"/>
                                    {store.label}
                                    <Check
                                        className={cn("ml-auto h-4 w-4", currentStore?.value === store.value ? "opacity-100" : "opacity-0")}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                    <CommandSeparator/>
                    <CommandList>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    setOpen(false);
                                    storeModel.onOpen();
                                }}
                            >
                                <PlusCircle className="mr-2 h-5 w-5"/>
                                Create Store
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
