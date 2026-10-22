import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

// Comprehensive country/territory calling prefix list
export const COUNTRY_CODES = [
  { name: 'Afghanistan', code: '+93', iso: 'AF', flag: '🇦🇫' },
  { name: 'Albania', code: '+355', iso: 'AL', flag: '🇦🇱' },
  { name: 'Algeria', code: '+213', iso: 'DZ', flag: '🇩🇿' },
  { name: 'Andorra', code: '+376', iso: 'AD', flag: '🇦🇩' },
  { name: 'Angola', code: '+244', iso: 'AO', flag: '🇦🇴' },
  { name: 'Argentina', code: '+54', iso: 'AR', flag: '🇦🇷' },
  { name: 'Armenia', code: '+374', iso: 'AM', flag: '🇦🇲' },
  { name: 'Australia', code: '+61', iso: 'AU', flag: '🇦🇺' },
  { name: 'Austria', code: '+43', iso: 'AT', flag: '🇦🇹' },
  { name: 'Azerbaijan', code: '+994', iso: 'AZ', flag: '🇦🇿' },
  { name: 'Bahrain', code: '+973', iso: 'BH', flag: '🇧🇭' },
  { name: 'Bangladesh', code: '+880', iso: 'BD', flag: '🇧🇩' },
  { name: 'Belarus', code: '+375', iso: 'BY', flag: '🇧🇾' },
  { name: 'Belgium', code: '+32', iso: 'BE', flag: '🇧🇪' },
  { name: 'Bolivia', code: '+591', iso: 'BO', flag: '🇧🇴' },
  { name: 'Bosnia & Herzegovina', code: '+387', iso: 'BA', flag: '🇧🇦' },
  { name: 'Brazil', code: '+55', iso: 'BR', flag: '🇧🇷' },
  { name: 'Bulgaria', code: '+359', iso: 'BG', flag: '🇧🇬' },
  { name: 'Cambodia', code: '+855', iso: 'KH', flag: '🇰🇭' },
  { name: 'Cameroon', code: '+237', iso: 'CM', flag: '🇨🇲' },
  { name: 'Canada', code: '+1', iso: 'CA', flag: '🇨🇦', note: 'same prefix as US' },
  { name: 'Chile', code: '+56', iso: 'CL', flag: '🇨🇱' },
  { name: 'China', code: '+86', iso: 'CN', flag: '🇨🇳' },
  { name: 'Colombia', code: '+57', iso: 'CO', flag: '🇨🇴' },
  { name: 'Croatia', code: '+385', iso: 'HR', flag: '🇭🇷' },
  { name: 'Cuba', code: '+53', iso: 'CU', flag: '🇨🇺' },
  { name: 'Cyprus', code: '+357', iso: 'CY', flag: '🇨🇾' },
  { name: 'Czech Republic', code: '+420', iso: 'CZ', flag: '🇨🇿' },
  { name: 'Denmark', code: '+45', iso: 'DK', flag: '🇩🇰' },
  { name: 'Ecuador', code: '+593', iso: 'EC', flag: '🇪🇨' },
  { name: 'Egypt', code: '+20', iso: 'EG', flag: '🇪🇬' },
  { name: 'Ethiopia', code: '+251', iso: 'ET', flag: '🇪🇹' },
  { name: 'Finland', code: '+358', iso: 'FI', flag: '🇫🇮' },
  { name: 'France', code: '+33', iso: 'FR', flag: '🇫🇷' },
  { name: 'Georgia', code: '+995', iso: 'GE', flag: '🇬🇪' },
  { name: 'Germany', code: '+49', iso: 'DE', flag: '🇩🇪' },
  { name: 'Ghana', code: '+233', iso: 'GH', flag: '🇬🇭' },
  { name: 'Greece', code: '+30', iso: 'GR', flag: '🇬🇷' },
  { name: 'Guatemala', code: '+502', iso: 'GT', flag: '🇬🇹' },
  { name: 'Hong Kong', code: '+852', iso: 'HK', flag: '🇭🇰' },
  { name: 'Hungary', code: '+36', iso: 'HU', flag: '🇭🇺' },
  { name: 'Iceland', code: '+354', iso: 'IS', flag: '🇮🇸' },
  { name: 'India', code: '+91', iso: 'IN', flag: '🇮🇳' },
  { name: 'Indonesia', code: '+62', iso: 'ID', flag: '🇮🇩' },
  { name: 'Iran', code: '+98', iso: 'IR', flag: '🇮🇷' },
  { name: 'Iraq', code: '+964', iso: 'IQ', flag: '🇮🇶' },
  { name: 'Ireland', code: '+353', iso: 'IE', flag: '🇮🇪' },
  { name: 'Israel', code: '+972', iso: 'IL', flag: '🇮🇱' },
  { name: 'Italy', code: '+39', iso: 'IT', flag: '🇮🇹' },
  { name: 'Jamaica', code: '+1876', iso: 'JM', flag: '🇯🇲' },
  { name: 'Japan', code: '+81', iso: 'JP', flag: '🇯🇵' },
  { name: 'Jordan', code: '+962', iso: 'JO', flag: '🇯🇴' },
  { name: 'Kazakhstan', code: '+7', iso: 'KZ', flag: '🇰🇿', note: 'same prefix as Russia' },
  { name: 'Kenya', code: '+254', iso: 'KE', flag: '🇰🇪' },
  { name: 'Kuwait', code: '+965', iso: 'KW', flag: '🇰🇼' },
  { name: 'Kyrgyzstan', code: '+996', iso: 'KG', flag: '🇰🇬' },
  { name: 'Laos', code: '+856', iso: 'LA', flag: '🇱🇦' },
  { name: 'Latvia', code: '+371', iso: 'LV', flag: '🇱🇻' },
  { name: 'Lebanon', code: '+961', iso: 'LB', flag: '🇱🇧' },
  { name: 'Libya', code: '+218', iso: 'LY', flag: '🇱🇾' },
  { name: 'Lithuania', code: '+370', iso: 'LT', flag: '🇱🇹' },
  { name: 'Luxembourg', code: '+352', iso: 'LU', flag: '🇱🇺' },
  { name: 'Macau', code: '+853', iso: 'MO', flag: '🇲🇴' },
  { name: 'Malaysia', code: '+60', iso: 'MY', flag: '🇲🇾' },
  { name: 'Maldives', code: '+960', iso: 'MV', flag: '🇲🇻' },
  { name: 'Malta', code: '+356', iso: 'MT', flag: '🇲🇹' },
  { name: 'Mexico', code: '+52', iso: 'MX', flag: '🇲🇽' },
  { name: 'Moldova', code: '+373', iso: 'MD', flag: '🇲🇩' },
  { name: 'Mongolia', code: '+976', iso: 'MN', flag: '🇲🇳' },
  { name: 'Morocco', code: '+212', iso: 'MA', flag: '🇲🇦' },
  { name: 'Mozambique', code: '+258', iso: 'MZ', flag: '🇲🇿' },
  { name: 'Myanmar', code: '+95', iso: 'MM', flag: '🇲🇲' },
  { name: 'Nepal', code: '+977', iso: 'NP', flag: '🇳🇵' },
  { name: 'Netherlands', code: '+31', iso: 'NL', flag: '🇳🇱' },
  { name: 'New Zealand', code: '+64', iso: 'NZ', flag: '🇳🇿' },
  { name: 'Nigeria', code: '+234', iso: 'NG', flag: '🇳🇬' },
  { name: 'Norway', code: '+47', iso: 'NO', flag: '🇳🇴' },
  { name: 'Oman', code: '+968', iso: 'OM', flag: '🇴🇲' },
  { name: 'Pakistan', code: '+92', iso: 'PK', flag: '🇵🇰' },
  { name: 'Palestine', code: '+970', iso: 'PS', flag: '🇵🇸' },
  { name: 'Panama', code: '+507', iso: 'PA', flag: '🇵🇦' },
  { name: 'Peru', code: '+51', iso: 'PE', flag: '🇵🇪' },
  { name: 'Philippines', code: '+63', iso: 'PH', flag: '🇵🇭' },
  { name: 'Poland', code: '+48', iso: 'PL', flag: '🇵🇱' },
  { name: 'Portugal', code: '+351', iso: 'PT', flag: '🇵🇹' },
  { name: 'Puerto Rico', code: '+1787', iso: 'PR', flag: '🇵🇷' },
  { name: 'Qatar', code: '+974', iso: 'QA', flag: '🇶🇦' },
  { name: 'Romania', code: '+40', iso: 'RO', flag: '🇷🇴' },
  { name: 'Russia', code: '+7', iso: 'RU', flag: '🇷🇺', note: 'same prefix as Kazakhstan' },
  { name: 'Saudi Arabia', code: '+966', iso: 'SA', flag: '🇸🇦' },
  { name: 'Senegal', code: '+221', iso: 'SN', flag: '🇸🇳' },
  { name: 'Serbia', code: '+381', iso: 'RS', flag: '🇷🇸' },
  { name: 'Singapore', code: '+65', iso: 'SG', flag: '🇸🇬' },
  { name: 'Slovakia', code: '+421', iso: 'SK', flag: '🇸🇰' },
  { name: 'Slovenia', code: '+386', iso: 'SI', flag: '🇸🇮' },
  { name: 'South Africa', code: '+27', iso: 'ZA', flag: '🇿🇦' },
  { name: 'South Korea', code: '+82', iso: 'KR', flag: '🇰🇷' },
  { name: 'Spain', code: '+34', iso: 'ES', flag: '🇪🇸' },
  { name: 'Sri Lanka', code: '+94', iso: 'LK', flag: '🇱🇰' },
  { name: 'Sudan', code: '+249', iso: 'SD', flag: '🇸🇩' },
  { name: 'Sweden', code: '+46', iso: 'SE', flag: '🇸🇪' },
  { name: 'Switzerland', code: '+41', iso: 'CH', flag: '🇨🇭' },
  { name: 'Syria', code: '+963', iso: 'SY', flag: '🇸🇾' },
  { name: 'Taiwan', code: '+886', iso: 'TW', flag: '🇹🇼' },
  { name: 'Tajikistan', code: '+992', iso: 'TJ', flag: '🇹🇯' },
  { name: 'Tanzania', code: '+255', iso: 'TZ', flag: '🇹🇿' },
  { name: 'Thailand', code: '+66', iso: 'TH', flag: '🇹🇭' },
  { name: 'Tunisia', code: '+216', iso: 'TN', flag: '🇹🇳' },
  { name: 'Turkey', code: '+90', iso: 'TR', flag: '🇹🇷' },
  { name: 'Turkmenistan', code: '+993', iso: 'TM', flag: '🇹🇲' },
  { name: 'Uganda', code: '+256', iso: 'UG', flag: '🇺🇬' },
  { name: 'Ukraine', code: '+380', iso: 'UA', flag: '🇺🇦' },
  { name: 'United Arab Emirates', code: '+971', iso: 'AE', flag: '🇦🇪' },
  { name: 'United Kingdom', code: '+44', iso: 'GB', flag: '🇬🇧' },
  { name: 'United States', code: '+1', iso: 'US', flag: '🇺🇸', note: 'same prefix as Canada' },
  { name: 'Uruguay', code: '+598', iso: 'UY', flag: '🇺🇾' },
  { name: 'Uzbekistan', code: '+998', iso: 'UZ', flag: '🇺🇿' },
  { name: 'Venezuela', code: '+58', iso: 'VE', flag: '🇻🇪' },
  { name: 'Vietnam', code: '+84', iso: 'VN', flag: '🇻🇳' },
  { name: 'Yemen', code: '+967', iso: 'YE', flag: '🇾🇪' },
  { name: 'Zimbabwe', code: '+263', iso: 'ZW', flag: '🇿🇼' },
];

// Default: India (+91)
export const DEFAULT_COUNTRY = COUNTRY_CODES.find(c => c.iso === 'IN');

export default function CountryCodeSelector({ value, onChange, id = 'country-code-selector', label = 'Home Country' }) {
  // value is the iso code (string), e.g. 'IN'
  const selected = COUNTRY_CODES.find(c => c.iso === value) || DEFAULT_COUNTRY;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when opening
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  // Filter: match by name or code prefix
  const filtered = COUNTRY_CODES.filter(c => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  const handleSelect = (country) => {
    onChange(country.iso, country.code);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    if (e.key === 'Enter' && filtered.length > 0) { handleSelect(filtered[0]); }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', display: 'block', marginBottom: '6px' }}
        >
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 12px',
          borderRadius: '6px',
          border: `1px solid ${open ? 'var(--color-primary)' : '#CBD5E1'}`,
          background: 'white',
          cursor: 'pointer',
          fontSize: '13.5px',
          color: '#1E293B',
          textAlign: 'left',
          transition: 'border-color 150ms',
          boxShadow: open ? '0 0 0 2px rgba(31,58,95,0.12)' : 'none'
        }}
      >
        <span style={{ fontSize: '20px', lineHeight: 1 }}>{selected.flag}</span>
        <span style={{ flex: 1, fontWeight: '500' }}>
          {selected.name}
        </span>
        <span style={{ color: '#64748B', fontFamily: 'monospace', fontSize: '13px', fontWeight: '600' }}>
          {selected.code}
        </span>
        {selected.note && (
          <span style={{ fontSize: '10px', background: '#FEF9C3', color: '#713F12', padding: '1px 5px', borderRadius: '4px', border: '1px solid #FEF08A' }}>
            shared
          </span>
        )}
        <ChevronDown
          size={15}
          color="#64748B"
          style={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Select country"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 200,
            background: 'white',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            maxHeight: '320px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Search box */}
          <div style={{ padding: '8px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '6px 10px' }}>
              <Search size={13} color="#94A3B8" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by country or +code…"
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: '13px', color: '#1E293B', width: '100%' }}
                aria-label="Search countries"
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X size={13} color="#94A3B8" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>
                No country found for "{query}"
              </div>
            ) : (
              filtered.map(country => {
                const isSelected = country.iso === value;
                return (
                  <button
                    key={`${country.iso}-${country.code}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(country)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      border: 'none',
                      background: isSelected ? '#EFF6FF' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: isSelected ? 'var(--color-primary)' : '#1E293B',
                      fontWeight: isSelected ? '600' : '400',
                      borderBottom: '1px solid #F8FAFC',
                      transition: 'background 100ms'
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>{country.flag}</span>
                    <span style={{ flex: 1, lineHeight: 1.3 }}>
                      {country.name}
                      {country.note && (
                        <span style={{ fontSize: '10px', color: '#94A3B8', marginLeft: '4px' }}>({country.note})</span>
                      )}
                    </span>
                    <span style={{ color: '#64748B', fontFamily: 'monospace', fontSize: '12.5px', fontWeight: '600', flexShrink: 0 }}>
                      {country.code}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
