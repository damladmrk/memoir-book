import { useState, useEffect, useRef } from "react";

const WEEKLY_QUESTIONS = [
  "Çocukluğunda en çok hangi anını hatırlıyorsun? O gün nasıl hissettirdi sana?",
  "Hayatında seni en çok şekillendiren kişi kim oldu ve neden?",
  "Beni ilk gördüğünde ne hissettin? O günü anlatır mısın?",
  "Şimdiye kadar verdiğin en cesur kararın hangisiydi?",
  "Küçükken ne olmak istiyordun? O hayal gerçek oldu mu?",
  "En mutlu olduğun yer neresi? O yerin kokusu, sesi nasıl?",
  "Bana verdiğin en değerli ders hangisi sence?",
  "Gençliğinde en büyük maceran neydi?",
  "Hayatında en çok neye güldün? O anı anlatabilir misin?",
  "Benim için en çok endişelendiğin zaman hangisiydi?",
  "Kendin hakkında en çok ne öğrendin?",
  "Geçmişe dönebilsen, kendine ne söylerdin?",
  "Hayatında en çok gurur duyduğun an hangisi?",
  "Sevmenin ne demek olduğunu anladığın an hangisiydi?",
  "Beni büyütürken en zor olan ne oldu?",
  "Bir gün bütün zamanını dilediğin gibi geçirebilseydin ne yapardın?",
  "Ailenden sana geçen en güzel şey ne?",
  "Seninle geçirdiğimiz en özel anı hatırlıyor musun?",
  "Yaşlandıkça nelerin daha az, nelerin daha çok önem kazandığını fark ettin?",
  "Bana bırakmak istediğin en önemli şey ne?",
  "Hayatında müzik ya da sanat sana ne ifade etti?",
  "En sevdiğin mevsim ve o mevsimle birlikte gelen anılar neler?",
  "Zor bir dönemden nasıl çıktın? O gücü nereden buldun?",
  "Evimizde, aile hayatımızda hiç değişmemesini istediğin bir şey var mı?",
  "Hayatının en güzel tatili ya da yolculuğu hangisi?",
  "Bana söylemediğin ama söylemek istediğin bir şey var mı?",
  "Mutluluğun tarifi nedir senin için?",
  "Seninle geçirmek isteyip de geçiremediğin bir anı var mı?",
  "Bu hayatta seni en çok şaşırtan şey ne oldu?",
  "Sana göre aşk ne demek?",
  "Benim hakkımda bilmemi istediğin bir şey var mı?",
  "Hayatın boyunca en çok neye minnettarsın?",
  "Gelecekte benim için hayal ettiğin şeyler neler?",
  "En zor vedanı hatırlıyor musun?",
  "Bu dünyaya bıraktığın izin ne olmasını istersin?",
  "Sana göre iyi bir insan nasıl olunur?",
  "Benimle paylaşmak istediğin bir sır ya da hikaye var mı?",
  "Bugün, şu an, nasıl hissediyorsun?",
  "Bir sonraki nesle bırakmak istediğin en önemli değer ne?",
  "Bu kitabı okuyanlar seni nasıl hatırlamasını istersin?",
  "Seni sen yapan şey nedir?",
  "Beni büyütürken en çok hangi özelliğime şaşırdın?",
  "Bir günlüğüne istediğin herhangi bir çağda yaşayabilseydin, nereye giderdin?",
  "Hayatında hiç terk etmek zorunda kaldığın bir şey ya da yer var mıydı?",
  "Geçmişte başka türlü yapabilmeyi dilediğin bir anın var mı?",
  "Seni en çok ne güldürür?",
  "Bana verdiğin en iyi hediye ne sence?",
  "İnsanların seni nasıl gördüğünü düşünüyorsun? Bu doğru mu?",
  "Hayatında en çok neye zaman harcadın?",
  "Son olarak bana ne söylemek istersin?",
];

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek);
}

function getCurrentQuestionIndex() {
  return getWeekNumber() % WEEKLY_QUESTIONS.length;
}

const FloatingSymbol = ({ symbol, style }) => (
  <span className="floating-symbol" style={style}>{symbol}</span>
);

export default function App() {
  const [screen, setScreen] = useState("intro"); // intro | book
  const [answers, setAnswers] = useState({});
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [lockingIdx, setLockingIdx] = useState(null);
  const currentIdx = getCurrentQuestionIndex();
  const textareaRef = useRef(null);

  useEffect(() => {
    loadAnswers();
  }, []);

  async function loadAnswers() {
  try {
    const raw = localStorage.getItem("memoir_answers");
    if (raw) setAnswers(JSON.parse(raw));
  } catch (e) {}
  setLoading(false);
}

  async function saveAnswer(idx) {
  const text = drafts[idx];
  if (!text || !text.trim()) return;
  setLockingIdx(idx);
  await new Promise(r => setTimeout(r, 800));
  const newAnswers = { ...answers, [idx]: { text: text.trim(), lockedAt: new Date().toISOString() } };
  setAnswers(newAnswers);
  localStorage.setItem("memoir_answers", JSON.stringify(newAnswers));
  setLockingIdx(null);
}

  const visibleWeeks = Array.from({ length: currentIdx + 1 }, (_, i) => i);

  const symbols = ["✦", "◇", "♡", "✿", "◈", "❋", "✧", "◎"];

  if (loading) return (
    <div style={{ background: "#1C1F2E", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#F5C842", fontFamily: "Playfair Display, serif", fontSize: 24, opacity: 0.7 }}>yükleniyor…</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #1C1F2E; }

        .floating-symbol {
          position: absolute;
          color: #F5C842;
          opacity: 0.15;
          font-size: 18px;
          animation: floatUp 8s ease-in-out infinite;
          pointer-events: none;
          user-select: none;
        }

        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.12; }
          50% { transform: translateY(-18px) rotate(10deg); opacity: 0.22; }
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bookPulse {
          0%, 100% { transform: scale(1) rotate(-2deg); filter: drop-shadow(0 0 18px #F5C84255); }
          50% { transform: scale(1.04) rotate(2deg); filter: drop-shadow(0 0 36px #F5C84299); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes lockBounce {
          0% { transform: scale(1); }
          40% { transform: scale(1.3) rotate(-5deg); }
          70% { transform: scale(0.9) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .intro-screen {
          min-height: 100vh;
          background: #1C1F2E;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 40px 20px;
        }

        .book-emoji {
          font-size: 88px;
          animation: bookPulse 4s ease-in-out infinite;
          display: block;
          margin-bottom: 32px;
          cursor: default;
        }

        .intro-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 7vw, 58px);
          font-weight: 700;
          color: #F0EDE4;
          text-align: center;
          line-height: 1.15;
          margin-bottom: 14px;
          animation: fadeInDown 1s ease both;
        }

        .intro-title span {
          background: linear-gradient(90deg, #F5C842, #E8A598, #F5C842);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3.5s linear infinite;
        }

        .intro-subtitle {
          font-family: 'Inter', sans-serif;
          font-weight: 300;
          font-size: 16px;
          color: #A8A5C0;
          text-align: center;
          max-width: 360px;
          line-height: 1.7;
          margin-bottom: 48px;
          animation: fadeInDown 1.2s ease both;
        }

        .intro-btn {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          color: #1C1F2E;
          background: #F5C842;
          border: none;
          border-radius: 50px;
          padding: 16px 44px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 24px #F5C84244;
          animation: fadeInDown 1.4s ease both;
          letter-spacing: 0.3px;
        }

        .intro-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 36px #F5C84266;
        }

        .decorative-row {
          display: flex;
          gap: 18px;
          margin-bottom: 40px;
          animation: fadeInDown 1.1s ease both;
        }

        .decorative-row span {
          font-size: 22px;
          color: #E8A598;
          opacity: 0.7;
        }

        /* BOOK SCREEN */

        .book-screen {
          min-height: 100vh;
          background: #1C1F2E;
          padding: 0 0 80px;
        }

        .book-header {
          background: linear-gradient(180deg, #13162A 0%, #1C1F2E 100%);
          border-bottom: 1px solid #2D3154;
          padding: 24px 24px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .back-btn {
          background: none;
          border: 1px solid #2D3154;
          color: #A8A5C0;
          font-size: 18px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s, color 0.2s;
        }

        .back-btn:hover { border-color: #F5C842; color: #F5C842; }

        .book-header-text {
          flex: 1;
        }

        .book-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #F0EDE4;
          font-weight: 600;
        }

        .book-header-sub {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #A8A5C0;
          margin-top: 2px;
        }

        .progress-bar-wrap {
          padding: 16px 24px 0;
        }

        .progress-label {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #A8A5C0;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }

        .progress-bar {
          height: 4px;
          background: #2D3154;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #F5C842, #E8A598);
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .questions-list {
          padding: 24px 20px 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .question-card {
          background: #252840;
          border: 1px solid #2D3154;
          border-radius: 18px;
          padding: 24px;
          animation: cardReveal 0.5s ease both;
          position: relative;
          overflow: hidden;
        }

        .question-card.current {
          border-color: #F5C84255;
          background: linear-gradient(135deg, #252840 0%, #2A2A50 100%);
          box-shadow: 0 0 0 1px #F5C84222, 0 8px 32px #00000044;
        }

        .question-card.locked {
          border-color: #2D3154;
          opacity: 0.85;
        }

        .card-week-badge {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: #F5C842;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .current-badge {
          background: #F5C84222;
          color: #F5C842;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
        }

        .locked-badge {
          background: #2D3154;
          color: #6B6F96;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-question {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 400;
          color: #F0EDE4;
          line-height: 1.55;
          margin-bottom: 20px;
          font-style: italic;
        }

        .card-question::before {
          content: '"';
          color: #F5C842;
          font-size: 28px;
          line-height: 0;
          vertical-align: -8px;
          margin-right: 2px;
        }

        .card-answer-locked {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #C8C5DC;
          line-height: 1.8;
          background: #1C1F2E;
          border-radius: 12px;
          padding: 16px;
          border-left: 3px solid #F5C84255;
          white-space: pre-wrap;
        }

        .card-locked-date {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: #6B6F96;
          margin-top: 10px;
          text-align: right;
        }

        .card-textarea {
          width: 100%;
          min-height: 140px;
          background: #1C1F2E;
          border: 1px solid #3D4168;
          border-radius: 12px;
          padding: 14px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: #F0EDE4;
          line-height: 1.7;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }

        .card-textarea:focus {
          border-color: #F5C84288;
        }

        .card-textarea::placeholder {
          color: #4A4E72;
        }

        .send-btn {
          margin-top: 14px;
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #F5C842, #E8B830);
          border: none;
          border-radius: 12px;
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          color: #1C1F2E;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .send-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .locking-btn {
          background: linear-gradient(135deg, #E8A598, #D4917F);
          animation: none;
        }

        .lock-anim {
          display: inline-block;
          animation: lockBounce 0.8s ease;
        }

        .empty-future {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #4A4E72;
          text-align: center;
          padding: 32px 0 8px;
          font-style: italic;
        }

        .corner-ornament {
          position: absolute;
          top: 12px;
          right: 14px;
          font-size: 20px;
          opacity: 0.08;
          pointer-events: none;
        }

        .stats-row {
          display: flex;
          gap: 12px;
          padding: 16px 20px 0;
        }

        .stat-box {
          flex: 1;
          background: #252840;
          border: 1px solid #2D3154;
          border-radius: 14px;
          padding: 14px;
          text-align: center;
        }

        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: #F5C842;
          line-height: 1;
        }

        .stat-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: #6B6F96;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .section-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: #6B6F96;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 24px 24px 8px;
        }
      `}</style>

      {screen === "intro" ? (
        <div className="intro-screen">
          {/* Floating symbols */}
          {symbols.map((s, i) => (
            <FloatingSymbol
              key={i}
              symbol={s}
              style={{
                left: `${8 + (i * 12.5)}%`,
                top: `${15 + (i % 3) * 22}%`,
                animationDelay: `${i * 0.9}s`,
                fontSize: `${14 + (i % 3) * 6}px`,
              }}
            />
          ))}
          {[...symbols].reverse().map((s, i) => (
            <FloatingSymbol
              key={`b${i}`}
              symbol={s}
              style={{
                right: `${6 + (i * 10)}%`,
                bottom: `${10 + (i % 4) * 15}%`,
                animationDelay: `${i * 0.7 + 0.4}s`,
                fontSize: `${12 + (i % 3) * 5}px`,
              }}
            />
          ))}

          <span className="book-emoji">📖</span>

          <div className="decorative-row">
            {["✦", "◇", "♡", "◇", "✦"].map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>

          <h1 className="intro-title">
            Bir <span>Ömür</span><br />Dolusu Söz
          </h1>

          <p className="intro-subtitle">
            Her hafta bir soru, her cevap bir anı.<br />
            Yılın sonunda seninle kalacak bir kitap.
          </p>

          <button className="intro-btn" onClick={() => setScreen("book")}>
            Sayfaları Aç ✦
          </button>
        </div>
      ) : (
        <div className="book-screen">
          <div className="book-header">
            <button className="back-btn" onClick={() => setScreen("intro")}>←</button>
            <div className="book-header-text">
              <div className="book-header-title">Anılar Kitabı 📖</div>
              <div className="book-header-sub">Her Pazar yeni bir soru seni bekliyor</div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-num">{Object.keys(answers).length}</div>
              <div className="stat-label">Yazılan</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{currentIdx + 1}</div>
              <div className="stat-label">Toplam Soru</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{WEEKLY_QUESTIONS.length - currentIdx - 1}</div>
              <div className="stat-label">Kalan</div>
            </div>
          </div>

          {/* Progress */}
          <div className="progress-bar-wrap">
            <div className="progress-label">
              <span>İlerleme</span>
              <span>{Math.round((Object.keys(answers).length / WEEKLY_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(Object.keys(answers).length / WEEKLY_QUESTIONS.length) * 100}%` }} />
            </div>
          </div>

          <div className="section-label">Bu Hafta</div>

          {/* Current week card */}
          <div className="questions-list">
            <QuestionCard
              idx={currentIdx}
              question={WEEKLY_QUESTIONS[currentIdx]}
              isCurrent={true}
              isLocked={!!answers[currentIdx]}
              answer={answers[currentIdx]}
              draft={drafts[currentIdx] || ""}
              isLocking={lockingIdx === currentIdx}
              onDraftChange={(val) => setDrafts(d => ({ ...d, [currentIdx]: val }))}
              onSave={() => saveAnswer(currentIdx)}
            />
          </div>

          {currentIdx > 0 && (
            <>
              <div className="section-label" style={{ paddingTop: 32 }}>Geçmiş Haftalar</div>
              <div className="questions-list">
                {visibleWeeks.slice(0, currentIdx).reverse().map((idx) => (
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

          <p className="empty-future">
            ✦ &nbsp;Yeni sorular her Pazar gelir &nbsp;✦
          </p>
        </div>
      )}
    </>
  );
}

function QuestionCard({ idx, question, isCurrent, isLocked, answer, draft, isLocking, onDraftChange, onSave }) {
  const lockedDate = answer?.lockedAt
    ? new Date(answer.lockedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className={`question-card ${isCurrent ? "current" : ""} ${isLocked ? "locked" : ""}`}>
      <span className="corner-ornament">◈</span>
      <div className="card-week-badge">
        Hafta {idx + 1}
        {isCurrent && !isLocked && <span className="current-badge">Bu Hafta ✦</span>}
        {isLocked && (
          <span className="locked-badge">
            <span className={isLocking ? "lock-anim" : ""}>🔒</span> Kilitli
          </span>
        )}
      </div>

      <p className="card-question">{question}</p>

      {isLocked ? (
        <>
          <div className="card-answer-locked">{answer.text}</div>
          {lockedDate && <div className="card-locked-date">{lockedDate}</div>}
        </>
      ) : (
        <>
          <textarea
            className="card-textarea"
            placeholder="Aklından geçenleri buraya yaz… 🖊"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
          />
          <button
            className={`send-btn ${isLocking ? "locking-btn" : ""}`}
            onClick={onSave}
            disabled={!draft.trim() || isLocking}
          >
            {isLocking ? (
              <><span className="lock-anim">🔒</span> Kilitleniyor…</>
            ) : (
              <>Gönder & Kilitle ✦</>
            )}
          </button>
        </>
      )}
    </div>
  );
}