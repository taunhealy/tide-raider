interface FormattedDateProps {
  date: Date;
}

export function FormattedDate({ date }: FormattedDateProps) {
  return (
    <time dateTime={date.toISOString()}>
      {date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </time>
  );
} 