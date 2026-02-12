interface ClientSlugLayoutProps {
  children: React.ReactNode
  propertyName?: string
  clientName?: string
}

export default function ClientSlugLayout({
  children,
  propertyName = 'Your Property',
  clientName,
}: ClientSlugLayoutProps) {
  // Replace template variables with actual values
  const processedContent = String(children).replace(
    /\{\{propertyName\}\}/g,
    propertyName
  )

  return (
    <>
      {typeof children === 'string' ? (
        <div dangerouslySetInnerHTML={{ __html: processedContent }} />
      ) : (
        children
      )}
    </>
  )
}
