type FieldHintToastProps = {
  message: string
}

export function FieldHintToast({ message }: FieldHintToastProps) {
  return (
    <div className="bc-field-toast" role="status">
      <p className="bc-field-toast__text">{message}</p>
    </div>
  )
}
