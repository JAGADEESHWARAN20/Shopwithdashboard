"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const MarkDeliveredButton = ({ orderId, delivered }: { orderId: string; delivered: boolean }) => {
  const params = useParams();
  const router = useRouter();
  const onMark = async () => {
    try { await axios.patch(`/api/${params.storeId}/orders/${orderId}/deliver`); toast.success("Order marked as delivered"); router.refresh(); } catch { toast.error("Failed to update"); }
  };
  return <Button disabled={delivered} onClick={onMark}>{delivered ? "Delivered" : "Mark as delivered"}</Button>;
};

export default MarkDeliveredButton;
