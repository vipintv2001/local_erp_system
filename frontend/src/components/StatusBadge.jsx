export default function StatusBadge({ status }) {
  const styles = {
    'Active - Payment Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Active - Payment Pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'Passout': 'bg-purple-50 text-purple-700 border-purple-200',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Dropped: 'bg-red-50 text-red-700 border-red-200',
    Completed: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || styles.Active}`}>
      {status}
    </span>
  );
}
