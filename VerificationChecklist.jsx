import React from 'react';
import { CheckSquare, ExternalLink, ShieldCheck, PhoneCall } from 'lucide-react';

export default function VerificationChecklist() {
  const steps = [
    {
      title: 'Verify via Official Channels',
      desc: 'Look up the institution (bank, courier, university) through an independent search engine or the phone number printed on your physical card.'
    },
    {
      title: 'Never Share Authentication Secrets',
      desc: 'No genuine bank, government portal, or employer will ever request your one-time password (OTP), debit card CVV, or UPI PIN.'
    },
    {
      title: 'Check Link Destinations Manually',
      desc: 'Do not click links inside unsolicited SMS or emails. Navigate to the verified website directly in your browser.'
    },
    {
      title: 'Refuse Upfront Payment Demands',
      desc: 'Real internship opportunities or delivery services never demand refundable registration fees or cryptocurrency transfers.'
    }
  ];

  return (
    <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <CheckSquare size={18} color="var(--color-primary)" />
        <h4 style={{ fontSize: '15px', color: 'var(--color-primary)' }}>
          Independent Verification Checklist
        </h4>
      </div>
      <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
        Always follow these safe practices even when automated tools spot no visible danger:
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
        {steps.map((s, idx) => (
          <div key={idx} style={{ background: 'white', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <strong style={{ fontSize: '13px', color: '#1E293B', display: 'block' }}>
              {idx + 1}. {s.title}
            </strong>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
