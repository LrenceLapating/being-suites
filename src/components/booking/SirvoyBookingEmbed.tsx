import React, { useEffect, useRef, useState } from 'react';

const SIRVOY_FORM_ID = 'b91fa766a43130b6';
const SIRVOY_SCRIPT_SRC = 'https://secured.sirvoy.com/widget/sirvoy.js';

type EmbedStatus = 'loading' | 'ready' | 'error';

interface SirvoyBookingEmbedProps {
  widget?: 'review';
  loadingTitle?: string;
  fallbackText?: string;
  errorTitle?: string;
  errorText?: string;
}

const SirvoyBookingEmbed: React.FC<SirvoyBookingEmbedProps> = ({
  widget,
  loadingTitle = 'Loading secure booking engine...',
  fallbackText = 'If the form does not appear, paste the latest Sirvoy embed code inside',
  errorTitle = 'The booking engine could not load.',
  errorText = 'Please refresh the page or contact Being Suites for reservation assistance.',
}) => {
  const embedRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<EmbedStatus>('loading');

  useEffect(() => {
    const container = embedRef.current;
    if (!container) return;

    setStatus('loading');
    container.innerHTML = '';

    const script = document.createElement('script');
    script.async = true;
    script.dataset.formId = SIRVOY_FORM_ID;
    if (widget) {
      script.dataset.widget = widget;
    }
    script.src = SIRVOY_SCRIPT_SRC;
    script.onload = () => setStatus('ready');
    script.onerror = () => setStatus('error');

    container.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
      container.innerHTML = '';
    };
  }, []);

  return (
    <div className="sirvoy-booking-embed" aria-live="polite">
      <div ref={embedRef} className="sirvoy-booking-embed__target" />

      {status === 'loading' && (
        <div className="sirvoy-booking-embed__fallback">
          <p className="font-semibold text-[#173c38]">{loadingTitle}</p>
          <p>
            {fallbackText}
            {' '}
            <code>SirvoyBookingEmbed</code>.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="sirvoy-booking-embed__fallback sirvoy-booking-embed__fallback--error">
          <p className="font-semibold text-[#173c38]">{errorTitle}</p>
          <p>{errorText}</p>
        </div>
      )}

      <noscript>
        <div className="sirvoy-booking-embed__fallback">
          JavaScript is required to load the Sirvoy booking engine.
        </div>
      </noscript>
    </div>
  );
};

export default SirvoyBookingEmbed;
