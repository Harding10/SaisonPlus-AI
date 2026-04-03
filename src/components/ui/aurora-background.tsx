"use client";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AuroraBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const AuroraBackground = ({ children, className }: AuroraBackgroundProps) => {
  return (
    <div className={cn("relative flex flex-col min-h-screen w-full overflow-hidden bg-background", className)}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Deep dark base representing space/night */}
        <div className="absolute inset-0 bg-slate-950 z-0"></div>
        
        {/* Animated Aurora blobs using standard tailwind colors */}
        <motion.div
          animate={{
            transform: ["translateY(0%) translateX(0%)", "translateY(-20%) translateX(10%)", "translateY(0%) translateX(0%)"],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/20 blur-[120px] z-10"
        />
        <motion.div
          animate={{
            transform: ["translateY(0%) translateX(0%)", "translateY(20%) translateX(-10%)", "translateY(0%) translateX(0%)"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] -right-[10%] w-[50%] h-[70%] rounded-full bg-violet-600/20 blur-[150px] z-10"
        />
        <motion.div
          animate={{
            transform: ["translateY(0%)", "translateY(-10%)", "translateY(0%)"],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-blue-500/15 blur-[100px] z-10"
        />
        
        {/* Grid Pattern overlay for tech feel */}
        <div className="absolute inset-0 z-20" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)' }}></div>
      </div>
      
      <div className="relative z-30 flex-1 flex flex-col w-full">
        {children}
      </div>
    </div>
  );
};
