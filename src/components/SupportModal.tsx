import React, { useState } from "react";
import { X, HeartHandshake, QrCode } from "lucide-react";
import { useCurrency } from "../lib/store";

export function SupportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [showCustom, setShowCustom] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const symbol = useCurrency(); // Wait, symbol isn't strictly needed for UPI (must be INR), but good for labels

  if (!isOpen) return null;

  const upiId = "ranvir1709@ptyes"; 
  const payeeName = "MathDot";
  const note = "Support FinCalc";
  
  // Construct standard UPI deep link string
  let upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&tn=${encodeURIComponent(note)}&cu=INR`;
  if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
    upiString += `&am=${amount}`;
  }

  // Generate QR code image URL
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

  const handlePayClick = (amt: string | number) => {
    const finalUpiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&tn=${encodeURIComponent(note)}&am=${amt}&cu=INR`;
    window.location.href = finalUpiString;
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setShowCustom(false);
      setAmount("");
      setError("");
    }, 200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-colors duration-300" onClick={handleClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 relative flex flex-col shadow-2xl dark:shadow-slate-900/50 transition-colors duration-300 border border-transparent dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-slate-200">
          <X className="w-4 h-4" />
        </button>

        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-full flex items-center justify-center shadow-inner shadow-rose-100 dark:shadow-rose-500/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 tracking-tight">Support the App</h2>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 mb-4 leading-relaxed">
          100% goes directly to the developer via UPI.<br/> Scan to pay from any device.
        </p>

        <div className="flex flex-col items-center mb-6">
          <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800/50 shadow-sm mb-2">
            <img src={qrApiUrl} alt="UPI QR Code" className="w-32 h-32 object-contain rounded-lg" />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase flex items-center gap-1">
            <QrCode size={12} /> Scan QR with Any App
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button 
            onClick={() => { setAmount("51"); handlePayClick("51"); }} 
            className={`group relative w-full border ${amount === "51" ? "border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-500/10" : "border-slate-200 dark:border-slate-800 dark:bg-slate-900"} p-3 rounded-xl hover:border-rose-300 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-rose-200`}
          >
            <span>₹51</span>
            <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 group-hover:text-rose-400">A small thanks</span>
          </button>
          
          <button 
            onClick={() => { setAmount("101"); handlePayClick("101"); }} 
            className={`group relative w-full border ${amount === "101" ? "border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-500/10" : "border-slate-200 dark:border-slate-800 dark:bg-slate-900"} p-3 rounded-xl hover:border-rose-300 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-rose-200`}
          >
            <span>₹101</span>
            <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 group-hover:text-rose-400">You're awesome!</span>
          </button>

          {!showCustom ? (
            <button 
              onClick={() => { setShowCustom(true); setAmount(""); }} 
              className="w-full border border-slate-200 dark:border-slate-800 border-dashed p-3 rounded-xl hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold text-slate-600 dark:text-slate-300 flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm"
            >
              Custom Amount
            </button>
          ) : (
            <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 shadow-sm">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError("");
                  }}
                  className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all font-semibold"
                  autoFocus
                />
              </div>
              {error && <span className="text-xs text-rose-500 font-medium text-center">{error}</span>}
              <button 
                onClick={() => {
                  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
                     setError("Please enter a valid amount"); return;
                  }
                  handlePayClick(amount);
                }} 
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg p-2.5 font-semibold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
              >
                Pay via UPI <span className="text-sm opacity-60">↗</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
