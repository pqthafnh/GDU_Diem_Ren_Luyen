export default function Loading() {
  return (
    <div className="container py-8 flex flex-col gap-8 animate-pulse">
      <div className="h-8 w-48 bg-muted/20 rounded-md"></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-4 p-4 border border-border rounded-xl">
            <div className="h-40 w-full bg-muted/20 rounded-lg"></div>
            <div className="h-6 w-3/4 bg-muted/20 rounded-md"></div>
            <div className="h-4 w-1/2 bg-muted/20 rounded-md mt-2"></div>
            <div className="h-4 w-1/3 bg-muted/20 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
