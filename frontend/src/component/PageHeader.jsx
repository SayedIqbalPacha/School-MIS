export default function PageHeader({ title, description, children }) {
  return (
    <header className="mb-6 mt-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex w-full justify-center sm:w-auto sm:justify-end">
          {children}
        </div>
      )}
    </header>
  );
}
