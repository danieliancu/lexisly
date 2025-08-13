// pages/index.js
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';

const CATEGORIES = [
  { id: 'work',    label: 'Work' },
  { id: 'family',  label: 'Family' },
  { id: 'shopping',label: 'Shopping' },
  { id: 'holiday', label: 'Holiday' },
  { id: 'health',  label: 'Health' },
  { id: 'travel',  label: 'Travel' }
];

const SCENARIOS = [
  // --- Work ---
  {
    id: 'support-invoice',
    cat: 'work',
    label: 'Customer Support – Invoice Discount',
    theme: `You're a support agent. A customer reports that the 10% flash-sale discount is not reflected on the MMC invoice.`,
    goal: `Ask billing to investigate, confirm the expected price, and advise the next steps.`,
    tone: `Polite and concise.`,
    sample: `Need your help as the flash sale -10% does not reflect the invoice price on MMC, Karen complains.`
  },
  {
    id: 'interview',
    cat: 'work',
    label: 'Job Interview – Behavioral Question',
    theme: `You answer “Tell me about a time you handled a difficult stakeholder”.`,
    goal: `Use the STAR structure to explain the situation in 120–160 words.`,
    tone: `Professional and positive.`,
    sample: `We had a stakeholder who changed scope every week and I...`
  },
  {
    id: 'standup',
    cat: 'work',
    label: 'Stand-up Daily – Update & Blockers',
    theme: `Daily stand-up meeting with your team.`,
    goal: `State what you did yesterday, what you will do today, and any blockers in 80 words or less.`,
    tone: `Concise and factual.`,
    sample: `Yesterday finished the invoice screen. Today API integration. Blocked by auth.`
  },
  {
    id: 'negotiate-priority',
    cat: 'work',
    label: 'Negotiate Task Priority',
    theme: `You need a teammate to prioritize a bug fix over a low-impact feature.`,
    goal: `Explain the impact, propose a timeline, and ask for confirmation.`,
    tone: `Firm yet respectful.`,
    sample: `Could we prioritize the checkout bug before the new banner? It affects payments.`
  },
  {
    id: 'project-deadline',
    cat: 'work',
    label: 'Project Deadline Extension',
    theme: `You need to request an extension for a project deadline.`,
    goal: `Explain the reasons for the delay, propose a new date, and show your plan to complete it.`,
    tone: `Professional and solution-oriented.`,
    sample: `Due to unforeseen technical issues, I request extending the project deadline by one week.`
  },
  {
    id: 'new-hire-intro',
    cat: 'work',
    label: 'Introduce a New Hire',
    theme: `You are introducing a new colleague to the team.`,
    goal: `Provide their role, background, and how they will contribute.`,
    tone: `Welcoming and informative.`,
    sample: `Please welcome John, our new backend developer with 5 years of experience in Node.js.`
  },

  // --- Family ---
  {
    id: 'landlord-boiler',
    cat: 'family',
    label: 'Call the Landlord – Boiler Issue',
    theme: `You're a tenant and the boiler stopped working yesterday evening.`,
    goal: `Request an urgent visit today or tomorrow and confirm available time windows.`,
    tone: `Firm but polite.`,
    sample: `Hello, the boiler doesn't work since last night. Can you come today?`
  },
  {
    id: 'teacher-meeting',
    cat: 'family',
    label: 'School – Parent–Teacher Meeting',
    theme: `You want to discuss your child's reading progress with the teacher.`,
    goal: `Propose two meeting slots, ask for current observations, and any preparation materials.`,
    tone: `Friendly and cooperative.`,
    sample: `Could we schedule a quick meeting to talk about Alex's reading progress?`
  },
  {
    id: 'family-reunion',
    cat: 'family',
    label: 'Organize Family Reunion',
    theme: `You're planning a family reunion for next month.`,
    goal: `Suggest a date, location, and ask for food/activity preferences.`,
    tone: `Friendly and inclusive.`,
    sample: `Thinking of hosting a family reunion on the 15th at our place. Thoughts?`
  },
  {
    id: 'babysitting-request',
    cat: 'family',
    label: 'Babysitting Request',
    theme: `You need someone to watch your kids this weekend.`,
    goal: `State dates/times, children’s ages, and offer payment.`,
    tone: `Polite and clear.`,
    sample: `Could you babysit my kids (5 & 8) on Saturday evening?`
  },
  {
    id: 'pet-care',
    cat: 'family',
    label: 'Ask for Pet Care',
    theme: `You need help feeding and walking your dog while away.`,
    goal: `List dates, pet’s needs, and offer compensation.`,
    tone: `Friendly and appreciative.`,
    sample: `Would you mind feeding and walking Max from Friday to Sunday?`
  },
  {
    id: 'appliance-repair',
    cat: 'family',
    label: 'Arrange Appliance Repair',
    theme: `Your washing machine is broken.`,
    goal: `Explain the issue, request repair date, and ask about costs.`,
    tone: `Polite but urgent.`,
    sample: `Our washing machine stopped spinning yesterday. Could you repair it this week?`
  },

  // --- Shopping ---
  {
    id: 'refund-online',
    cat: 'shopping',
    label: 'Online Order – Refund Request',
    theme: `Your parcel arrived damaged.`,
    goal: `Provide the order number, describe the issue, and request a refund or replacement.`,
    tone: `Neutral and concise.`,
    sample: `Order #10422 arrived with a cracked screen protector. I'd like a refund or replacement.`
  },
  {
    id: 'price-match',
    cat: 'shopping',
    label: 'Price Match Inquiry',
    theme: `You found a lower price for the same item at a competitor.`,
    goal: `Provide proof of the lower price, ask if price match applies, and how to proceed.`,
    tone: `Neutral and direct.`,
    sample: `I found the same model £20 cheaper at RivalTech. Do you offer price matching?`
  },
  {
    id: 'delayed-delivery',
    cat: 'shopping',
    label: 'Delayed Delivery Complaint',
    theme: `Your order hasn't arrived on time.`,
    goal: `Provide order details, ask for updated delivery date, and compensation if applicable.`,
    tone: `Polite but firm.`,
    sample: `Order #10987 was due yesterday but hasn't arrived. Could you update me?`
  },
  {
    id: 'product-warranty',
    cat: 'shopping',
    label: 'Warranty Claim',
    theme: `Your product stopped working within the warranty period.`,
    goal: `Provide proof of purchase, describe the fault, and request repair or replacement.`,
    tone: `Clear and factual.`,
    sample: `My vacuum cleaner (purchased in March) no longer turns on. Can it be replaced?`
  },
  {
    id: 'gift-wrap',
    cat: 'shopping',
    label: 'Gift Wrapping Request',
    theme: `You are ordering a gift online.`,
    goal: `Ask if gift wrapping is available and confirm any extra cost.`,
    tone: `Polite and concise.`,
    sample: `Could you gift wrap order #11223? Is there an extra fee?`
  },
  {
    id: 'bulk-order',
    cat: 'shopping',
    label: 'Bulk Order Inquiry',
    theme: `You want to buy a large quantity of a product.`,
    goal: `Ask about stock availability, bulk discount, and delivery time.`,
    tone: `Direct and business-like.`,
    sample: `I’d like to order 50 units of item #4421. What’s the best price?`
  },

  // --- Holiday ---
  {
    id: 'travel-booking',
    cat: 'holiday',
    label: 'Travel Booking – Budget & Dates',
    theme: `You need a return flight from London to Madrid next month.`,
    goal: `Find 2–3 options under £180, with no overnight layovers, and include baggage rules.`,
    tone: `Friendly and clear.`,
    sample: `I need cheap flights London to Madrid next month, please.`
  },
  {
    id: 'hotel-request',
    cat: 'holiday',
    label: 'Hotel – Special Request',
    theme: `You booked a hotel and want a quiet room away from the lift.`,
    goal: `Confirm the reservation, request your preferred room, and ask about early check-in.`,
    tone: `Polite and clear.`,
    sample: `Reservation #AB3492 for 2 nights. Could we have a quiet room away from the lift?`
  },
  {
    id: 'car-rental',
    cat: 'holiday',
    label: 'Car Rental Inquiry',
    theme: `You want to rent a car for a trip.`,
    goal: `Specify pick-up/drop-off dates, car type, and ask about insurance.`,
    tone: `Clear and direct.`,
    sample: `I need a small car from 3–7 May in Barcelona. What’s available?`
  },
  {
    id: 'tour-booking',
    cat: 'holiday',
    label: 'Guided Tour Booking',
    theme: `You are booking a city tour.`,
    goal: `Ask about dates, price, group size, and language options.`,
    tone: `Polite and curious.`,
    sample: `Do you have a city tour in Rome on 12th May in English?`
  },
  {
    id: 'cruise-offer',
    cat: 'holiday',
    label: 'Cruise Offer Request',
    theme: `You want information on Mediterranean cruise packages.`,
    goal: `Ask about routes, price, cabin options, and available dates.`,
    tone: `Polite and interested.`,
    sample: `Could you send me your best offers for a 7-day Mediterranean cruise?`
  },
  {
    id: 'restaurant-reservation',
    cat: 'holiday',
    label: 'Restaurant Reservation',
    theme: `You are booking a dinner during holiday.`,
    goal: `State date/time, number of guests, and any dietary requirements.`,
    tone: `Polite and friendly.`,
    sample: `Table for 4 on 15th July at 7pm, vegetarian options please.`
  },

  // --- Health ---
  {
    id: 'gp-appointment',
    cat: 'health',
    label: 'GP Appointment – Symptoms',
    theme: `You need to book a GP appointment for a persistent cough lasting 2 weeks.`,
    goal: `Describe your symptoms, state your availability, and ask if anything is needed for the appointment.`,
    tone: `Clear and straightforward.`,
    sample: `I'd like to book a GP appointment for a cough that's lasted two weeks.`
  },
  {
    id: 'dentist-visit',
    cat: 'health',
    label: 'Dentist Visit Request',
    theme: `You need a dental check-up and cleaning.`,
    goal: `Request appointment date, ask about insurance coverage.`,
    tone: `Polite and concise.`,
    sample: `Could I book a dental cleaning next week? Do you accept AXA insurance?`
  },
  {
    id: 'physio-session',
    cat: 'health',
    label: 'Physiotherapy Session',
    theme: `You need physio for a back injury.`,
    goal: `Request availability, describe injury, and ask about treatment plan.`,
    tone: `Polite and informative.`,
    sample: `I injured my back. Could you book me for physiotherapy this week?`
  },
  {
    id: 'eye-test',
    cat: 'health',
    label: 'Eye Test Booking',
    theme: `You want an eye examination.`,
    goal: `Ask for earliest slot, price, and if prescription lenses are included.`,
    tone: `Clear and polite.`,
    sample: `Do you have an eye test slot tomorrow afternoon?`
  },
  {
    id: 'nutritionist-consult',
    cat: 'health',
    label: 'Nutritionist Consultation',
    theme: `You want dietary advice for weight loss.`,
    goal: `Request appointment, mention goals, and ask about packages.`,
    tone: `Polite and health-focused.`,
    sample: `I'd like to schedule a consultation for healthy weight loss guidance.`
  },
  {
    id: 'mental-health',
    cat: 'health',
    label: 'Mental Health Support',
    theme: `You need counseling sessions for anxiety.`,
    goal: `Ask about therapist availability, session format, and confidentiality.`,
    tone: `Sensitive and respectful.`,
    sample: `Could you recommend a counselor for anxiety sessions?`
  },

  // --- Travel ---
  {
    id: 'visa-query',
    cat: 'travel',
    label: 'Visa – Document Checklist',
    theme: `You are requesting information from the consulate for a short tourist visa.`,
    goal: `List your situation, ask for the official document checklist, and confirm the processing time.`,
    tone: `Formal and polite.`,
    sample: `Could you confirm the document checklist for a short-stay tourist visa?`
  },
  {
    id: 'flight-delay',
    cat: 'travel',
    label: 'Flight Delay Complaint',
    theme: `Your flight was delayed by over 4 hours.`,
    goal: `Request compensation or rebooking options.`,
    tone: `Polite but firm.`,
    sample: `Flight EZY456 delayed 5 hours. What compensation is available?`
  },
  {
    id: 'lost-luggage',
    cat: 'travel',
    label: 'Lost Luggage Report',
    theme: `Your luggage didn’t arrive at destination.`,
    goal: `Provide flight details, bag description, and contact info.`,
    tone: `Clear and factual.`,
    sample: `Bag missing from flight BA217. Black Samsonite, tag #9982.`
  },
  {
    id: 'travel-insurance-claim',
    cat: 'travel',
    label: 'Travel Insurance Claim',
    theme: `You need to claim for lost items during travel.`,
    goal: `Provide details, receipts, and incident report.`,
    tone: `Formal and detailed.`,
    sample: `Claim for lost camera during trip to Paris. Police report attached.`
  },
  {
    id: 'airport-transfer',
    cat: 'travel',
    label: 'Airport Transfer Booking',
    theme: `You need a ride from the airport to hotel.`,
    goal: `Specify flight arrival, hotel address, and passenger count.`,
    tone: `Polite and clear.`,
    sample: `Pick-up from Heathrow at 10am, drop to Hilton Park Lane, 2 passengers.`
  },
  {
    id: 'travel-advisory',
    cat: 'travel',
    label: 'Travel Advisory Inquiry',
    theme: `You are checking for safety updates on a destination.`,
    goal: `Ask about current risks, health advisories, and entry restrictions.`,
    tone: `Polite and cautious.`,
    sample: `Are there any travel advisories for visiting Thailand in November?`
  }
];


export default function Home() {
  // category & scenario
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const scenariosForCategory = useMemo(
    () => SCENARIOS.filter(s => s.cat === category),
    [category]
  );

  const [scenarioId, setScenarioId] = useState(scenariosForCategory[0]?.id || '');
  const current = useMemo(
    () => SCENARIOS.find(s => s.id === scenarioId),
    [scenarioId]
  );

  // editor & results
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const correctedRef = useRef(null);

  // când se schimbă categoria → selectează primul scenariu, goliște editorul
  useEffect(() => {
    const first = scenariosForCategory[0]?.id || '';
    setScenarioId(first);
    setText('');
    setResult(null);
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  // când se schimbă scenariul → goliște editorul & rezultate
  useEffect(() => {
    setText('');
    setResult(null);
  }, [scenarioId]);

  // helpers scoruri
  const clamp10 = (n) => Math.max(0, Math.min(10, Number(n ?? 0)));
  const pct = (n) => `${clamp10(n) * 10}%`;
  const fmt = (n) => `${clamp10(n)}/10`;

  const useSample = () => current?.sample && setText(current.sample);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch('/api/correct', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ text, scenario: scenarioId })
      });
      const data = await r.json();
      setResult(data);
      setTimeout(() => correctedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch {
      setResult({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Natural English Fixer</div>
          <div className={styles.subtitle}>Write naturally. Receive clear, professional corrections.</div>
        </div>
      </div>

      {/* CATEGORII (bara superioară, scroll orizontal) */}
      <div className={`${styles.panel}`} aria-label="Categories">
        <div className={styles.segmentTop} role="tablist" aria-label="Category tabs">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === category}
              className={`${styles.pillCategory} ${c.id===category ? styles.pillCategoryActive : ''}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* SCENARII (linia de jos, filtrată după categorie) */}
      <div
        className={`${styles.panel} ${styles.row}`}
        role="group"
        aria-label={`Scenarios in ${CATEGORIES.find(x=>x.id===category)?.label}`}
        style={{ marginTop: 14 }}
      >
        <div className={styles.segmentBottom}>
          {scenariosForCategory.length > 0 ? (
            scenariosForCategory.map(s => (
              <button
                key={s.id}
                type="button"
                className={`${styles.pill} ${s.id===scenarioId ? styles.pillActive : ''}`}
                onClick={() => setScenarioId(s.id)}
              >
                {s.label}
              </button>
            ))
          ) : (
            <div className={styles.emptyHint}>No scenarios available in this category.</div>
          )}
        </div>
      </div>

      {/* Theme */}
      {current && (
        <div className={`${styles.panel} ${styles.theme}`}>
          <strong>Theme: {current.theme}</strong>
          <br />
          <strong>Goal:</strong> {current.goal}
          <br />
          <strong>Tone:</strong> {current.tone}
        </div>
      )}

      {/* Editor */}
      <div className={styles.panel} style={{ marginTop: 16 }}>
        <div className={styles.controls}>
          <label htmlFor="msg" style={{fontWeight:700}}>Your message</label>
          <button className={styles.sampleBtn} onClick={useSample} type="button">Use sample (testing)</button>
        </div>
        <textarea
          id="msg"
          className={styles.textarea}
          placeholder="Write your response here…"
          value={text}
          onChange={e=>setText(e.target.value)}
        />
        <button
          className={styles.cta}
          onClick={submit}
          disabled={loading || !text.trim()}
        >
          {loading ? 'Analyzing…' : 'Fix my English'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div ref={correctedRef} className={styles.result}>
          {!result.error ? (
            <>
              <h2 className={styles.resultTitle}>Corrected</h2>
              <div className={styles.corrected}>{result.corrected}</div>

              <h3 className={styles.sectionTitle}>Mistakes</h3>
              {Array.isArray(result.mistakes) && result.mistakes.length > 0 ? (
                <div className={styles.mistakes}>
                  {result.mistakes.map((m, i) => (
                    <div key={i} className={styles.mistakeItem}>
                      <span className={styles.badge}>{m.type || 'style'}</span>
                      “{m.original}” → <em>{m.fix}</em> — {m.explanation}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.mistakeItem}>
                  <span className={styles.badge}>style</span>
                  No significant errors; minor stylistic choices only.
                </div>
              )}

              <h3 className={styles.sectionTitle}>Alternatives</h3>
              {Array.isArray(result.alternatives) && result.alternatives.length > 0 ? (
                <ul className={styles.alts}>
                  {result.alternatives.map((a,i)=><li key={i}>{a}</li>)}
                </ul>
              ) : <div style={{color: '#6b7280'}}>No alternatives.</div>}

              <h3 className={styles.sectionTitle}>Scores</h3>
              <div className={styles.scores}>
                <div className={styles.score}>
                  <div className={styles.scoreRow}>
                    <div>Clarity</div>
                    <div className={styles.scoreValue}>{`${Math.max(0, Math.min(10, Number(result.scores?.clarity ?? 0)))}/10`}</div>
                  </div>
                  <div className={styles.meter}><span style={{ '--pct': pct(result.scores?.clarity) }} /></div>
                </div>
                <div className={styles.score}>
                  <div className={styles.scoreRow}>
                    <div>Correctness</div>
                    <div className={styles.scoreValue}>{`${Math.max(0, Math.min(10, Number(result.scores?.correctness ?? 0)))}/10`}</div>
                  </div>
                  <div className={styles.meter}><span style={{ '--pct': pct(result.scores?.correctness) }} /></div>
                </div>
                <div className={styles.score}>
                  <div className={styles.scoreRow}>
                    <div>Tone</div>
                    <div className={styles.scoreValue}>{`${Math.max(0, Math.min(10, Number(result.scores?.tone ?? 0)))}/10`}</div>
                  </div>
                  <div className={styles.meter}><span style={{ '--pct': pct(result.scores?.tone) }} /></div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.toastErr}>Error: {result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
