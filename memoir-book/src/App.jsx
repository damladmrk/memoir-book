import { useState, useEffect } from "react";

const SUPABASE_URL = "https://iueheqcpibdkmqwfovrf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1ZWhlcWNwaWJka21xd2ZvdnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MjM5NTksImV4cCI6MjA5NzQ5OTk1OX0.P3IvpKHpKVrGW0-hv-m0D0qsTDFY96nSxlq5n4KCPos";

async function dbGetAnswers() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/answers?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

async function dbSaveAnswer(question_idx, answer_text) {
  await fetch(`${SUPABASE_URL}/rest/v1/answers`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ question_idx, answer_text, locked_at: new Date().toISOString() }),
  });
}

const WEEKLY_QUESTIONS = [
  "Çocukluğundan kalan en eski anın ne?",
  "Hayatında örnek aldığın biri var mı? Varsa kim ve neden?",
  "Beni ilk gördüğünde ne hissettin?",
  "Küçükken ne olmak istiyordun?",
  "En mutlu olduğun yer neresi? Sana nasıl hissettiriyor?",
  "Bir babanın çocuğuna vermesi gereken şeyler ne sence?",
  "Gençliğinde en büyük maceran neydi?",
  "Benim için en çok endişelendiğin zaman hangisiydi?",
  "Geçmişe dönebilsen, kendine ne söylerdin?",
  "Hayatında en çok gurur duyduğun an hangisi?",
  "Benle ilgili bir şeyi değiştirebilseydin bu ne olurdu?",
  "Senin için güzel bir gün nasıl olur?",
  "Kendine baba olsaydın neleri farklı yapardın?",
  "Benle ilgili özel bir an hatırlıyor musun, nasıldı ve neydi?",
  "Yaşlandıkça nelerin daha az, nelerin daha çok önem kazandığını fark ettin?",
  "Bana bırakmak istediğin en önemli şey ne?",
  "En sevdiğin mevsim hangisi ve neden?",
  "Zor bir dönemden nasıl çıkılır?",
  "Benle ilgili en çok gurur duyduğun şey ne?",
  "Hayatının en güzel tatili ya da yolculuğu hangisi?",
  "Bana söylemediğin ama söylemek istediğin bir şey var mı?",
  "Nasıl mutlu olunur?",
  "Benimle geçirmek isteyip de geçiremediğin bir anı var mı?",
  "Bu hayatta seni en çok şaşırtan şey ne oldu?",
  "Sana göre aşk ne demek?",
  "Seninle ilgili bilmemi istediğin bir şey var mı?",
  "Hayatın boyunca en çok neye şükrettin?",
  "Gelecekte beni nasıl biri olarak görüyorsun?",
  "Bir çocuğun olacağını öğrendiğinde ilk ne hissettin?",
  "Sana göre iyi bir insan nasıl olunur?",
  "Benle ilgili en çok ne öğrenmek isterdin?",
  "Bugün, şu an, nasıl hissediyorsun?",
  "Benim geleceğimle ilgili seni en çok ne endişelendiriyor ya da korkutuyor?",
  "Benle ilgili şaşırdığın bir şey var mı?",
  "Bir günlüğüne istediğin herhangi bir zamanda yaşayabilseydin, nereye giderdin?",
  "Seni en çok ne güldürür?",
  "Bana verdiğin en iyi hediye ne sence?",
  "İnsanların seni nasıl gördüğünü düşünüyorsun?",
  "Nasıl daha iyi bi evlat olabilirim?",
  "Son olarak bana ne söylemek istersin?",
];

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const weekOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7));
  return Math.max(0, weekOfYear - 24);
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric"
  });
}

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [answers, setAnswers] = useState({});
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [lockingIdx, setLockingIdx] = useState(null);
  const currentWeek = getWeekNumber();
  const visibleCount = Math.min(currentWeek + 1, WEEKLY_QUESTIONS.length);

  useEffect(() => {
    loadAnswers();
  }, []);

  async function loadAnswers() {
    try {
      const rows = await dbGetAnswers();
      const map = {};
      rows.forEach(r => {
        map[r.question_idx] = { text: r.answer_text, lockedAt: r.locked_at };
      });
      setAnswers(map);
    } catch (e) {}
    setLoading(false);
  }

  async function saveAnswer(idx) {
    const text = drafts[idx];
    if (!text || !text.trim()) return;
    setLockingIdx(idx);
    await new Promise(r => setTimeout(r, 900));

    try {
      await window.emailjs.send(
        "service_2i0zled",
        "template_d49mgy8",
        {
          week_num: idx + 1,
          question: WEEKLY_QUESTIONS[idx],
          answer: text.trim(),
          date: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
        },
        "dxBY-FMG_OyKBuUdn"
      );
    } catch (e) {
      console.error("Mail gönderilemedi:", e);
    }

    try {
      await dbSaveAnswer(idx, text.trim());
    } catch (e) {
      console.error("Supabase kaydedilemedi:", e);
    }

    const newAnswers = {
      ...answers,
      [idx]: { text: text.trim(), lockedAt: new Date().toISOString() }
    };
    setAnswers(newAnswers);
    setLockingIdx(null);
  }

  const answeredCount = Object.keys(answers).length;

  if (loading) return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "'Lora', serif", color: "#8B7355", fontSize: 18 }}>yükleniyor…</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #EDE8DF; }

        .intro {
          min-height: 100vh;
          background: #F7F3EC;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 28px;
          position: relative;
          overflow: hidden;
        }

        .intro::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            transparent, transparent 31px, #D6CDBF 31px, #D6CDBF 32px
          );
          opacity: 0.45;
          pointer-events: none;
        }

        .intro-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 480px;
          width: 100%;
        }

        .intro-ornament {
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          color: #8B3A2A;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 28px;
          opacity: 0.8;
        }

        .intro-book { font-size: 64px; margin-bottom: 24px; display: block; filter: sepia(0.3); }

        .intro-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(34px, 8vw, 54px);
          font-weight: 700;
          color: #2C2416;
          text-align: center;
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .intro-title em { font-style: italic; color: #8B3A2A; }

        .intro-rule { width: 60px; height: 1px; background: #8B3A2A; margin: 24px auto; opacity: 0.5; }

        .intro-subtitle {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 16px;
          color: #6B5B45;
          text-align: center;
          line-height: 1.8;
          margin-bottom: 44px;
          max-width: 340px;
        }

        .intro-btn {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 600;
          color: #F7F3EC;
          background: #2C2416;
          border: none;
          border-radius: 2px;
          padding: 15px 48px;
          cursor: pointer;
          letter-spacing: 1px;
          transition: background 0.2s, transform 0.15s;
        }

        .intro-btn:hover { background: #8B3A2A; transform: translateY(-1px); }

        .intro-week-hint {
          margin-top: 28px;
          font-family: 'Lora', serif;
          font-size: 13px;
          color: #A0917A;
          font-style: italic;
        }

        .book { min-height: 100vh; background: #EDE8DF; padding-bottom: 80px; }

        .book-header {
          background: #2C2416;
          padding: 20px 24px 18px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .back-btn {
          background: none;
          border: 1px solid #5C4A32;
          color: #C4A882;
          font-size: 16px;
          width: 34px;
          height: 34px;
          border-radius: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .back-btn:hover { border-color: #C4A882; color: #F7F3EC; }

        .book-header-text { flex: 1; }

        .book-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 600;
          color: #F7F3EC;
          letter-spacing: 0.3px;
        }

        .book-header-sub {
          font-family: 'Lora', serif;
          font-size: 12px;
          color: #8B7355;
          margin-top: 3px;
          font-style: italic;
        }

        .book-progress { padding: 20px 24px 0; }

        .progress-meta {
          font-family: 'Lora', serif;
          font-size: 12px;
          color: #8B7355;
          font-style: italic;
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .progress-track { height: 2px; background: #D6CDBF; }

        .progress-fill {
          height: 100%;
          background: #8B3A2A;
          transition: width 0.7s ease;
        }

        .section-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 28px 24px 12px;
        }

        .section-divider-line { flex: 1; height: 1px; background: #C4B89A; }

        .section-divider-text {
          font-family: 'Lora', serif;
          font-size: 11px;
          font-style: italic;
          color: #A0917A;
          white-space: nowrap;
        }

        .cards {
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .card {
          background: #F7F3EC;
          border-radius: 1px;
          box-shadow: 2px 3px 12px rgba(44,36,22,0.12), 0 1px 3px rgba(44,36,22,0.08);
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 3px;
          background: #8B3A2A;
          opacity: 0.7;
        }

        .card.past::before { background: #C4B89A; opacity: 0.5; }

        .card-lines {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            transparent, transparent 31px, #E0D8CC 31px, #E0D8CC 32px
          );
          pointer-events: none;
          opacity: 0.6;
        }

        .card-inner {
          position: relative;
          z-index: 1;
          padding: 24px 24px 24px 28px;
        }

        .card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .card-week-num {
          font-family: 'Playfair Display', serif;
          font-size: 11px;
          color: #8B3A2A;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .card.past .card-week-num { color: #A0917A; }

        .locked-tag {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'Lora', serif;
          font-size: 11px;
          font-style: italic;
          color: #A0917A;
        }

        .current-tag {
          font-family: 'Lora', serif;
          font-size: 11px;
          font-style: italic;
          color: #8B3A2A;
        }

        .card-question {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 400;
          font-style: italic;
          color: #2C2416;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .card-answer-text {
          font-family: 'Lora', serif;
          font-size: 15px;
          color: #4A3C2A;
          line-height: 1.85;
          white-space: pre-wrap;
          padding-top: 4px;
          border-top: 1px solid #D6CDBF;
        }

        .card-answer-date {
          font-family: 'Lora', serif;
          font-size: 11px;
          font-style: italic;
          color: #B0A088;
          margin-top: 12px;
          text-align: right;
        }

        .card-textarea {
          width: 100%;
          min-height: 160px;
          background: transparent;
          border: none;
          border-top: 1px solid #D6CDBF;
          padding: 16px 0 4px;
          font-family: 'Lora', serif;
          font-size: 15px;
          color: #2C2416;
          line-height: 1.85;
          resize: vertical;
          outline: none;
        }

        .card-textarea::placeholder { color: #C4B89A; font-style: italic; }

        .send-btn {
          margin-top: 16px;
          width: 100%;
          padding: 13px;
          background: #2C2416;
          border: none;
          border-radius: 1px;
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-weight: 600;
          color: #F7F3EC;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .send-btn:hover:not(:disabled) { background: #8B3A2A; }
        .send-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        @keyframes lockBounce {
          0% { transform: scale(1); }
          40% { transform: scale(1.4) rotate(-8deg); }
          70% { transform: scale(0.9) rotate(4deg); }
          100% { transform: scale(1) rotate(0); }
        }
        .lock-anim { display: inline-block; animation: lockBounce 0.7s ease; }

        .future-note {
          font-family: 'Lora', serif;
          font-size: 13px;
          font-style: italic;
          color: #B0A088;
          text-align: center;
          padding: 32px 0 8px;
        }
      `}</style>

      {screen === "intro" ? (
        <div className="intro">
          <div className="intro-inner">
            <p className="intro-ornament">— Hatıra —</p>
            <img src="/memoir-book/photo.jpeg" alt="" style={{
              width: 200,
              height: 200,
              objectFit: "cover",
              marginBottom: 24,
              filter: "sepia(0.2)",
              boxShadow: "0 4px 20px rgba(44,36,22,0.2)"
            }} />
            <p className="intro-subtitle">
              Her hafta bir soru ve bir cevap olacak.<br />
              Çocuğuna neler bırakırdın gibi bir şeyler.
            </p>
            <button className="intro-btn" onClick={() => setScreen("book")}>
              Sorular için...
            </button>
            <p className="intro-week-hint">
              {visibleCount}. hafta sorusu seni bekliyor
            </p>
          </div>
        </div>
      ) : (
        <div className="book">
          <div className="book-header">
            <button className="back-btn" onClick={() => setScreen("intro")}>←</button>
            <div className="book-header-text">
              <div className="book-header-title">Anılar Kitabı</div>
              <div className="book-header-sub">Her hafta yeni bir soru</div>
            </div>
          </div>

          <div className="book-progress">
            <div className="progress-meta">
              <span>{answeredCount} sayfa yazıldı</span>
              <span>{WEEKLY_QUESTIONS.length - answeredCount} sayfa kaldı</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(answeredCount / WEEKLY_QUESTIONS.length) * 100}%` }} />
            </div>
          </div>

          <div className="section-divider">
            <div className="section-divider-line" />
            <span className="section-divider-text">bu hafta</span>
            <div className="section-divider-line" />
          </div>

          <div className="cards">
            <QuestionCard
              idx={currentWeek}
              question={WEEKLY_QUESTIONS[currentWeek]}
              isCurrent={true}
              isLocked={!!answers[currentWeek]}
              answer={answers[currentWeek]}
              draft={drafts[currentWeek] || ""}
              isLocking={lockingIdx === currentWeek}
              onDraftChange={(val) => setDrafts(d => ({ ...d, [currentWeek]: val }))}
              onSave={() => saveAnswer(currentWeek)}
            />
          </div>

          {visibleCount > 1 && (
            <>
              <div className="section-divider">
                <div className="section-divider-line" />
                <span className="section-divider-text">geçmiş sayfalar</span>
                <div className="section-divider-line" />
              </div>
              <div className="cards">
                {Array.from({ length: visibleCount - 1 }, (_, i) => visibleCount - 2 - i).map((idx) => (
                  <QuestionCard
                    key={idx}
                    idx={idx}
                    question={WEEKLY_QUESTIONS[idx]}
                    isCurrent={false}
                    isLocked={!!answers[idx]}
                    answer={answers[idx]}
                    draft={drafts[idx] || ""}
                    isLocking={lockingIdx === idx}
                    onDraftChange={(val) => setDrafts(d => ({ ...d, [idx]: val }))}
                    onSave={() => saveAnswer(idx)}
                  />
                ))}
              </div>
            </>
          )}

          <p className="future-note">— Yeni sorular her Pazar gelir —</p>
        </div>
      )}
    </>
  );
}

function QuestionCard({ idx, question, isCurrent, isLocked, answer, draft, isLocking, onDraftChange, onSave }) {
  return (
    <div className={`card ${isCurrent ? "current" : "past"}`}>
      <div className="card-lines" />
      <div className="card-inner">
        <div className="card-meta">
          <span className="card-week-num">{idx + 1}. Hafta</span>
          {isLocked
            ? <span className="locked-tag"><span className={isLocking ? "lock-anim" : ""}>🔒</span> kilitlendi</span>
            : isCurrent
              ? <span className="current-tag">bugün</span>
              : null
          }
        </div>

        <p className="card-question">{question}</p>

        {isLocked ? (
          <>
            <p className="card-answer-text">{answer.text}</p>
            <p className="card-answer-date">{formatDate(answer.lockedAt)}</p>
          </>
        ) : (
          <>
            <textarea
              className="card-textarea"
              placeholder="Aklından geçenleri buraya yaz…"
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
            />
            <button
              className="send-btn"
              onClick={onSave}
              disabled={!draft.trim() || isLocking}
            >
              {isLocking
                ? <><span className="lock-anim">🔒</span> Kilitleniyor…</>
                : "Yaz & Kilitle"
              }
            </button>
          </>
        )}
      </div>
    </div>
  );
}