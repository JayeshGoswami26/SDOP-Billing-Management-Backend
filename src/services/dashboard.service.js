import Bill from "../models/bill.modal.js";

export async function getDashboardSummary() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [recentBills, monthBills] = await Promise.all([
    Bill.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("billNumber totalAmount createdAt")
      .populate("customer", "name")
      .lean(),
    Bill.find({ isActive: true, createdAt: { $gte: startOfMonth, $lte: endOfMonth } })
      .select("totalAmount createdAt")
      .lean(),
  ]);

  const totalSales = monthBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalBills = monthBills.length;
  const avgOrder = totalBills ? Math.round(totalSales / totalBills) : 0;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const salesSeries = Array.from({ length: daysInMonth }, () => 0);
  monthBills.forEach((b) => {
    const d = new Date(b.createdAt).getDate();
    salesSeries[d - 1] += 1;
  });

  const recent = recentBills.map((b) => ({
    id: b.billNumber,
    date: b.createdAt,
    customer: b.customer?.name || "Customer",
    amount: b.totalAmount || 0,
  }));

  return {
    kpis: { totalSales, totalBills, avgOrder },
    salesSeries,
    recentBills: recent,
  };
}
