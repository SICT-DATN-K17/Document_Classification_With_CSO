export default function NewsHeadlineClassifierUI() {
  const stats = [
    { label: "Tổng dữ liệu", value: "26,458", tone: "text-blue-600" },
    { label: "Số category", value: "8", tone: "text-orange-500" },
    { label: "Độ chính xác", value: "92.5%", tone: "text-emerald-600" },
    { label: "Model", value: "SVM", tone: "text-slate-700", badge: "Đã huấn luyện" },
  ];

  const categories = [
    { name: "Thể thao", value: 32, color: "bg-blue-500" },
    { name: "Kinh tế", value: 28, color: "bg-orange-500" },
    { name: "Giải trí", value: 20, color: "bg-violet-500" },
    { name: "Xã hội", value: 20, color: "bg-emerald-500" },
  ];

  const models = [
    { name: "SVM", score: 92, bar: "bg-blue-600" },
    { name: "Naive Bayes", score: 84, bar: "bg-orange-400" },
    { name: "Logistic", score: 86, bar: "bg-sky-500" },
    { name: "BERT", score: 94, bar: "bg-emerald-500" },
  ];

  const keywords = ["bóng đá", "chính phủ", "kinh tế", "giá vàng", "covid", "giải trí", "thời tiết"];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#2563eb_0%,_#0f2f66_40%,_#081a35_100%)] p-6 text-slate-800">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-white/95 shadow-2xl backdrop-blur">
        <header className="flex flex-col gap-4 bg-[linear-gradient(135deg,#08244f,#0d3b82_55%,#0a2d63)] px-6 py-5 text-white lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <div className="h-9 w-9 rounded-full bg-[conic-gradient(from_220deg,_#0ea5e9,_#facc15,_#2563eb,_#0ea5e9)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">HỆ THỐNG PHÂN LOẠI TIÊU ĐỀ BÁO</h1>
              <p className="text-base text-blue-100">News Headline Classification</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <button className="rounded-2xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
              Đăng xuất
            </button>
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-120px)] grid-cols-1 lg:grid-cols-[250px_1fr]">
          <aside className="bg-[linear-gradient(180deg,#0d3674,#0a2551)] px-5 py-6 text-white">
            <nav className="space-y-2">
              <SidebarItem label="Phân loại" active />
              <SidebarItem label="Dự đoán hàng loạt" />
              <SidebarItem label="Kết quả gần đây" />
              <SidebarItem label="Hướng dẫn" />
            </nav>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-blue-100">Model Accuracy</p>
              <div className="mt-4 flex items-center justify-center">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[conic-gradient(#22c55e_0_89%,rgba(255,255,255,0.15)_89%_100%)] p-3">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0b2b5d] text-center">
                    <div>
                      <div className="text-3xl font-bold">89%</div>
                      <div className="mt-1 text-xs text-blue-100">Model đang sẵn sàng</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="bg-slate-100/80 p-4 md:p-6">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className={`text-3xl font-bold ${item.tone}`}>{item.value}</p>
                    {item.badge ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.7fr]">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-4xl font-bold text-slate-800">Phân loại tiêu đề báo</h2>
                <p className="mt-2 text-lg text-slate-500">Nhập tiêu đề để hệ thống phân loại</p>

                <textarea
                  placeholder="Nhập tiêu đề báo..."
                  className="mt-5 h-36 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-4 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="min-w-40 rounded-2xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                    Phân loại
                  </button>
                  <button className="min-w-40 rounded-2xl border border-slate-300 bg-slate-100 px-6 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-200">
                    Xóa
                  </button>
                </div>

                <div className="my-6 h-px bg-slate-200" />

                <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-white">
                      ✓
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-700">Kết quả: Kinh tế</p>
                      <p className="mt-1 text-lg text-slate-700">Độ tin cậy: 91%</p>
                      <p className="mt-1 text-lg text-slate-700">Thời gian xử lý: 115 ms</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-3xl font-bold text-slate-800">Phân bố dữ liệu</h3>
                <div className="mt-6 flex items-center gap-6">
                  <div className="relative h-40 w-40 rounded-full bg-[conic-gradient(#3b82f6_0_32%,#f59e0b_32%_60%,#8b5cf6_60%_80%,#10b981_80%_100%)]">
                    <div className="absolute inset-6 rounded-full bg-white" />
                  </div>
                  <div className="space-y-4 text-lg">
                    {categories.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                          <span className={`h-4 w-4 rounded-full ${item.color}`} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-semibold">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-2xl font-bold text-slate-800">Từ khóa phổ biến</h4>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-2xl bg-slate-100 px-4 py-2 text-base font-medium text-slate-700 ring-1 ring-slate-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.7fr]">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-3xl font-bold text-slate-800">Model Accuracy</h3>
                <div className="mt-6 space-y-5">
                  {models.map((item) => (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between text-xl">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <span className="font-bold text-slate-800">{item.score}%</span>
                      </div>
                      <div className="h-5 overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full rounded-full ${item.bar}`} style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-3xl font-bold text-slate-800">Độ chính xác</h3>
                <div className="mt-6 flex items-center justify-center">
                  <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-[conic-gradient(#60a5fa_0_25%,#1d4ed8_25%_73%,#14b8a6_73%_100%)] p-5">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-center shadow-inner">
                      <div>
                        <div className="text-6xl font-bold text-slate-800">92.5%</div>
                        <div className="mt-2 text-base text-slate-500">Độ chính xác tổng thể</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ label, active = false }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-lg font-medium transition ${
        active ? "bg-white/15 text-white shadow-lg" : "text-blue-50 hover:bg-white/10"
      }`}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/30 text-sm">
        {active ? "▣" : "◫"}
      </span>
      <span>{label}</span>
    </button>
  );
}
