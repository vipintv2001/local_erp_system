import { useState, useEffect } from "react";
import api from "../utils/api";
import { Printer } from "@phosphor-icons/react";

const numToWords = (num) => {
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if ((num = num.toString()).length > 9) return "Overflow";
  const n = ("000000000" + num)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";
  let str = "";
  str +=
    n[1] != 0
      ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore "
      : "";
  str +=
    n[2] != 0
      ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh "
      : "";
  str +=
    n[3] != 0
      ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand "
      : "";
  str +=
    n[4] != 0
      ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred "
      : "";
  str +=
    n[5] != 0
      ? (str != "" ? "and " : "") +
        (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) +
        "Only "
      : str === ""
        ? "Zero"
        : "Only";
  return str.trim();
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [receiptToPrint, setReceiptToPrint] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = (payment) => {
    setReceiptToPrint(payment);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          /* Force A5 portrait size and strip default browser headers/footers */
          @page {
            size: A5 portrait;
            margin: 0mm !important;
          }
          
          html, body {
            width: 148mm;
            height: 210mm;
            background: #fff !important;
            color: #000 !important;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          /* Wrapper to simulate clean padding internal to the A5 sheet */
          .print-container {
            display: block !important;
            width: 148mm !important;
            height: 210mm !important;
            padding: 12mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid;
            page-break-after: avoid;
          }
        }
      `}</style>

      {/* Non-Print UI */}
      <div className="no-print">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Payment History & Ledger
          </h1>
          <p className="text-slate-500 mt-1">
            View all recorded receipts and print them.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Receipt ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Method
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {payment.receiptId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(payment.datePaid).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-700">
                      {payment.student?.name}{" "}
                      <span className="text-slate-400 font-normal ml-1">
                        (
                        {payment.student?.registerNumber ||
                          payment.student?.studentId}
                        )
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {payment.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-emerald-600">
                      ₹{payment.amountPaid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handlePrint(payment)}
                        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded transition-colors"
                      >
                        <Printer weight="bold" /> Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modern Fixed A5 Portrait Print Container */}
      {receiptToPrint && (
        <div className="print-container hidden print:block bg-white text-black text-sm mx-auto">
          {/* Header Branding */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              {/* <div className="w-12 h-12 flex items-center justify-center border border-black p-1 rounded">
                <img
                  src="/logo.png"
                  alt=""
                  className="w-full h-full object-contain grayscale"
                />
              </div> */}
              <div>
                {/* <h2 className="text-2xl font-black uppercase tracking-tight leading-none m-0">
                  TECH-E
                </h2>
                <p className="text-[11px] tracking-widest font-bold text-slate-600 m-0 mt-0.5 uppercase">
                  Education
                </p> */}
                <div className="h-12 w-auto max-w-[180px]">
                  <img
                    src="/logo.png"
                    alt="TECH-E EDUCATION"
                    className="h-full w-full object-contain grayscale object-left"
                  />
                </div>
              </div>
            </div>

            <div className="text-right">
              <h3 className="text-lg font-bold tracking-wider text-slate-900 uppercase m-0 mb-1">
                FEE RECEIPT
              </h3>
              <p className="m-0 text-xs text-slate-600 font-medium">
                North Kottachery, Kanhangad
              </p>
              <p className="m-0 text-xs text-slate-600 font-medium">
                Ph: +91 8891999405
              </p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 my-5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500 font-medium text-xs uppercase">
                Receipt No:
              </span>
              <span className="font-bold text-slate-900">
                {receiptToPrint.receiptId}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500 font-medium text-xs uppercase">
                Date:
              </span>
              <span className="font-bold text-slate-900">
                {new Date(receiptToPrint.datePaid).toLocaleDateString("en-GB")}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1 col-span-2">
              <span className="text-slate-500 font-medium text-xs uppercase">
                Reg No:
              </span>
              <span className="font-bold text-slate-900">
                {receiptToPrint.student?.registerNumber ||
                  receiptToPrint.student?.studentId ||
                  "N/A"}
              </span>
            </div>
          </div>

          {/* Statement / Particulars Layout */}
          <div className="space-y-4 border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-1.5 font-semibold text-xs uppercase tracking-wider">
              Payment Particulars
            </div>

            <div className="px-4 pb-4 space-y-3.5">
              <div className="flex items-baseline justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-600 font-medium">Student Name</span>
                <span className="font-bold text-base text-right">
                  {receiptToPrint.student?.name}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-600 font-medium">Course</span>
                <span className="font-semibold text-right">
                  {receiptToPrint.student?.courses && receiptToPrint.student.courses.length > 0
                    ? receiptToPrint.student.courses.join(', ')
                    : (receiptToPrint.student?.course || '')}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-600 font-medium">Payment Mode</span>
                <span className="font-semibold uppercase text-right">
                  {receiptToPrint.method}
                </span>
              </div>

              <div className="pt-1">
                <span className="text-xs text-slate-500 block font-medium uppercase tracking-tight mb-0.5">
                  Amount in Words
                </span>
                <span className="font-medium italic text-slate-800 text-sm">
                  {numToWords(receiptToPrint.amountPaid)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Ledger Totals & Signatures */}
          <div className="flex justify-between items-end mt-8 pt-4 border-t border-slate-200">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Amount Paid
              </span>
              <div className="border-2 border-slate-950 rounded-lg px-5 py-2 flex items-center min-w-[160px] text-xl font-black bg-slate-50">
                <span className="font-sans mr-2">₹</span>
                <span>{receiptToPrint.amountPaid}/-</span>
              </div>
            </div>

            <div className="flex flex-col items-center relative pb-1">
              <div className="absolute bottom-[24px] opacity-90 pointer-events-none">
                {/* <svg
                  width="110"
                  height="36"
                  viewBox="0 0 120 45"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 35 C 15 15, 25 -5, 45 20 C 55 45, 65 30, 75 25 C 85 20, 95 40, 105 30 C 110 25, 115 15, 120 20"
                    stroke="#000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M40 25 C 45 15, 55 35, 65 25"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg> */}
                <img
                  src="/bgggc.png"
                  alt=""
                  className="h-full w-full object-contain grayscale object-left"
                />
              </div>
              <div className="w-[150px] border-b border-slate-900 mb-1.5"></div>
              <span className="text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                Authorized Signatory
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
