export const SAMPLE_MESSAGES = [
  {
    id: 'sample-1',
    label: 'OTP / Account Threat',
    tag: 'Fictional phishing',
    text: 'ALERT: Your FictBank account will be blocked in 10 minutes due to incomplete KYC. Send your OTP to confirm and avoid suspension: http://fictbank-verify.example/kyc',
    url: 'http://fictbank-verify.example/kyc',
    expected: 'Urgency, credential request, brand mismatch URL, impersonation cue'
  },
  {
    id: 'sample-2',
    label: 'Fake Internship Fee',
    tag: 'Fictional job scam',
    text: 'Congratulations! You are selected for a Data Analyst internship at Northwind Demo Ltd, earning 40,000 per month with no interview required. To receive your offer letter, pay a refundable registration fee of 2,500 today. Contact our HR on Telegram.',
    url: '',
    expected: 'Unrealistic reward, upfront fee, channel shift to Telegram'
  },
  {
    id: 'sample-3',
    label: 'Delivery Package Scam',
    tag: 'Fictional delivery scam',
    text: 'Your courier parcel #IN-98214 is on hold due to missing address verification. Immediate action required: Pay 25 delivery clearance fee within 2 hours or package will be returned: http://192.0.2.1/track-parcel',
    url: 'http://192.0.2.1/track-parcel',
    expected: 'Urgency, clearance fee, bare IP address URL'
  },
  {
    id: 'sample-4',
    label: 'Ordinary Legitimate Note',
    tag: 'Fictional legitimate',
    text: 'Hi, your library book “Intro to Statistics” is due on Friday. You can renew it on the library website or at the front desk. No action is needed if you have already returned it.',
    url: '',
    expected: 'Zero warning signs; cautious reminder that lack of signals is not proof'
  },
  {
    id: 'sample-5',
    label: 'Ambiguous Recruiter',
    tag: 'Fictional ambiguous',
    text: 'Hello, this is Priya from Contoso Campus Recruitment. We would like to schedule a short call about your application. Please confirm your availability today or tomorrow by replying to this message.',
    url: '',
    expected: 'Unverified sender identity, low urgency cues, neutral advice'
  }
];

export const SIMULATED_CALLS = [
  {
    id: 'call-1',
    name: 'Unknown Suspicious Caller (C1)',
    number: '+1 555 0100',
    signals: [
      'Number not in contacts',
      'Carrier did not verify caller ID (STIR/SHAKEN unverified)',
      '3rd call attempt within 60 minutes'
    ],
    verified: false,
    inContacts: false,
    description: 'Simulates an unfamiliar, unverified number repeatedly calling.'
  },
  {
    id: 'call-2',
    name: 'Saved Contact: Library Desk (C2)',
    number: '+1 555 0111',
    signals: [
      'Saved in contacts: "Library Desk"',
      'Carrier verification passed'
    ],
    verified: true,
    inContacts: true,
    description: 'Legitimate call from your trusted address book. Generates zero alarm.'
  }
];
