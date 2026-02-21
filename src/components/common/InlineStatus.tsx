import React from 'react';

export function InlineStatus({
  title,
  message,
  tone = 'neutral'
}: {
  title: string;
  message?: string;
  tone?: 'neutral' | 'danger' | 'success';
}) {
  return (
    <div className={`status status--${tone}`}>
      <div className="status__title">{title}</div>
      {message ? <div className="status__msg">{message}</div> : null}
    </div>
  );
}
