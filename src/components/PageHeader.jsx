import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100 mb-2">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
