import React, { useEffect, useRef, useState } from 'react';

const SIRVOY_FORM_ID = 'b91fa766a43130b6';
const SIRVOY_SCRIPT_SRC = 'https://secured.sirvoy.com/widget/sirvoy.js';

type EmbedStatus = 'loading' | 'ready' | 'error';

const SirvoyBookingEmbed: React.FC = () => {
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
          <p className="font-semibold text-[#173c38]">Loading secure booking engine...</p>
          <p>
            If the form does not appear, paste the latest Sirvoy embed code inside
            {' '}
            <code>SirvoyBookingEmbed</code>.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="sirvoy-booking-embed__fallback sirvoy-booking-embed__fallback--error">
          <p className="font-semibold text-[#173c38]">The booking engine could not load.</p>
          <p>Please refresh the page or contact Being Suites for reservation assistance.</p>
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
