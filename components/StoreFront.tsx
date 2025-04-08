"use client";

import { useState, useEffect } from "react";
import { Billboard, Product, Store } from "@/types";

interface StoreFrontProps {
     initialStore: {
          id: string;
          name: string;
          storeUrl?: string; // Allow undefined
          alternateUrls: string[];
          isActive: boolean;
          userId: string;
     };
     initialBillboard: Billboard | null;
     initialProducts: Product[];
}

const StoreFront: React.FC<StoreFrontProps> = ({ initialStore }) => {
     const [store, setStore] = useState<Store>(initialStore);
     const [wsStatus, setWsStatus] = useState<"Connecting" | "Connected" | "Disconnected">("Connecting");
     const [wsMessage, setWsMessage] = useState<string | null>(null);

    useEffect(() => {
    if (!initialStore || !initialStore.id) {
        console.error("Invalid initialStore prop.");
        return;
    }

    const ws = new WebSocket("wss://admindashboardecom.vercel.app");

    ws.onopen = () => {
        setWsStatus("Connected");
    };

    ws.onmessage = (event) => {
        try {
            const { type, data } = JSON.parse(event.data);
            if (type === "storeUpdate" && data.storeId === store.id) {
                setWsMessage("Store settings updated successfully");
                setStore((prev) => ({
                    ...prev,
                    storeUrl: data.storeUrl,
                    name: data.name || prev.name,
                    alternateUrls: data.alternateUrls || prev.alternateUrls,
                }));
            }
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
        }
    };

    ws.onclose = () => {
        setWsStatus("Disconnected");
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsStatus("Disconnected");
    };

    return () => {
        ws.close();
    };
}, [initialStore, store.id]); 

     useEffect(() => {
          setStore(initialStore);
     }, [initialStore]); // Added initialStore to the dependency array

     return (
          <div className="min-h-screen flex flex-col items-center justify-center">
               <h1 className="text-4xl font-bold mb-4">Welcome to {store.name}</h1>
               <p className="text-lg">This is your e-commerce store at {store.storeUrl}</p>
               <div id="websocket-status" className="mt-4">
                    <span
                         className={`w-4 h-4 rounded-full mr-2 inline-block ${wsStatus === "Connected" ? "bg-green-500" : wsStatus === "Connecting" ? "bg-yellow-500" : "bg-red-500"
                              }`}
                    ></span>
                    <span>WebSocket {wsStatus}</span>
               </div>
               {wsMessage && (
                    <div id="websocket-message" className="mt-2 p-2 bg-green-100 text-green-700">
                         {wsMessage}
                    </div>
               )}
          </div>
     );
};

export default StoreFront;
