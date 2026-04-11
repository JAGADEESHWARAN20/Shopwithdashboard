import prismadb from "@/lib/prismadb";

const VariationsPage = async ({ params }: { params: Promise<{ itemId: string }> }) => {
  const { itemId } = await params;
  const item = await prismadb.designItem.findUnique({ where: { id: itemId }, include: { variations: { orderBy: { sortOrder: "asc" } } } });
  return <div className="p-8 space-y-4"><h2 className="text-2xl font-bold">Variations</h2><p className="text-sm text-muted-foreground">{item?.title}</p><div className="space-y-2">{item?.variations.map((v)=><div key={v.id} className="rounded border p-3 text-sm flex justify-between"><span>{v.label} {v.value ? `(${v.value})` : ""}</span><span>{v.isActive ? "Active" : "Inactive"}</span></div>)}</div></div>;
};

export default VariationsPage;
