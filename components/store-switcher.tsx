"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStoreModal } from "@/hooks/use-store-modal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, ChevronDown, PlusCircle, Store as StoreIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type StoreSwitcherItem = {
  id: string;
  name: string;
  isActive: boolean;
};

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface StoreSwitcherProps extends PopoverTriggerProps {
  items: StoreSwitcherItem[];
}

export default function StoreSwitcher({ className, items = [] }: StoreSwitcherProps) {
  const storeModel = useStoreModal();
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const formattedItems = useMemo(
    () =>
      items.map((item) => ({
        label: item.name,
        value: item.id,
        isActive: item.isActive,
      })),
    [items],
  );

  const currentStore = formattedItems.find((item) => item.value === params.storeId);
  const activeStores = formattedItems.filter((item) => item.value !== params.storeId && item.isActive);
  const inactiveStores = formattedItems.filter((item) => item.value !== params.storeId && !item.isActive);

  const onStoreSelect = (selectedStore: { value: string; label: string }) => {
    setOpen(false);
    router.push(`/${selectedStore.value}`);
  };

  const renderStore = (store: { value: string; label: string; isActive: boolean }) => (
    <CommandItem
      key={store.value}
      className="min-w-0 text-sm text-black aria-selected:bg-black/10 aria-selected:text-black"
      onSelect={() => onStoreSelect(store)}
    >
      <StoreIcon className="mr-2 h-4 w-4 shrink-0 text-black" />
      <span className="min-w-0 flex-1 truncate text-black">{store.label}</span>
      <Check
        className={cn(
          "ml-2 h-4 w-4 shrink-0 text-black",
          currentStore?.value === store.value ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label="Select a store"
          className={cn(
            "h-10 justify-between overflow-hidden bg-orange-600/20 px-3 text-black shadow-sm hover:bg-orange-600/50 hover:text-black",
            className,
          )}
          role="combobox"
          size="sm"
          suppressHydrationWarning
          variant="default"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/10 text-black">
              <StoreIcon suppressHydrationWarning className="h-4 w-4" />
            </span>
            <span className="min-w-0 truncate text-left text-black">
              {currentStore?.label ?? "Select store"}
            </span>
          </span>
          <ChevronDown suppressHydrationWarning className="ml-2 h-4 w-4 shrink-0 text-black opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="mt-2 w-[min(22rem,calc(100vw-2rem))] p-0">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <Command className="text-black">
            <CommandInput placeholder="Search store" />
            <CommandList>
              <CommandEmpty>No store found</CommandEmpty>
              {currentStore ? (
                <CommandGroup heading="Current store">{renderStore(currentStore)}</CommandGroup>
              ) : null}
              {activeStores.length ? (
                <CommandGroup heading="Active stores">{activeStores.map(renderStore)}</CommandGroup>
              ) : null}
              {inactiveStores.length ? (
                <CommandGroup heading="Inactive stores">{inactiveStores.map(renderStore)}</CommandGroup>
              ) : null}
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  className="text-black aria-selected:bg-black/10 aria-selected:text-black"
                  onSelect={() => {
                    setOpen(false);
                    storeModel.onOpen();
                  }}
                >
                  <PlusCircle className="mr-2 h-5 w-5 text-black" />
                  <span className="truncate text-black">Create Store</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
