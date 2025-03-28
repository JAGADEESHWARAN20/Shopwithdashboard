"use client";

import { useState, useEffect } from "react";

interface Store {
     id: string;
     name: string;
     storeUrl: string;
     alternateUrls: string[];
     isActive: boolean;
}

interface StoreFrontProps {
     initialStore: Store;
}

const StoreFront: React.FC<StoreFrontProps> = ({ initialStore }) => {
     const [store, setStore] = useState<Store>(initialStore);
     const [wsStatus, setWsStatus] = useState("Disconnected");
     const [wsMessage, setWsMessage] = useState("");

     useEffect(() => {
          const ws = new WebSocket("wss://admindashboardecom.vercel.app");

          ws.onopen = () => {
               setWsStatus("Connected");
          };

          ws.onmessage = (event) => {
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
          };

          ws.onclose = () => {
               setWsStatus("Disconnected");
          };

          ws.onerror = (error) => {
               console.error("WebSocket error:", error);
               setWsStatus("Disconnected");
          };

          return () => ws.close();
     }, [store.id]);

     return (
          <div className="min-h-screen flex flex-col items-center justify-center">
               <h1 className="text-4xl font-bold mb-4">Welcome to {store.name}</h1>
               <p className="text-lg">This is your e-commerce store at {store.storeUrl}</p>
               <div id="websocket-status" className="mt-4">
                    <span
                         className={`w-4 h-4 rounded-full mr-2 inline-block ${wsStatus === "Connected" ? "bg-green-500" : "bg-red-500"
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