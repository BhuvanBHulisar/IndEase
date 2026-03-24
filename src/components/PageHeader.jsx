const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 mb-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm font-normal text-slate-500 max-w-[600px] leading-relaxed">
          {subtitle}
        </p>
      </div>
      {action && (
        <div className="shrink-0 mb-1">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
