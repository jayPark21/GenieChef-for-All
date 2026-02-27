import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateRecipeDetail } from '../aiService';

const Recipe = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { recipe, ingredients, dietMode } = location.state || {};

    const [recipeDetail, setRecipeDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [isTimerActive, setIsTimerActive] = useState(false);

    // 인포그래픽 실시간 생성 상태 관리
    const [isGeneratingInfo, setIsGeneratingInfo] = useState(true);
    const [infoGenerationStep, setInfoGenerationStep] = useState(0); // 0: 분석, 1: 디자인, 2: 작성, 3: 렌더링
    const [infoUrl, setInfoUrl] = useState(null);

    const generationMessages = [
        "지니 쉪이 레시피 재료를 정밀 분석 중입니다...",
        "최적의 인포그래픽 레이아웃을 디자인하고 있습니다...",
        "지니 쉪만의 비밀 팁을 꾹꾹 눌러 담는 중입니다...",
        "최종 인포그래픽 결과물을 렌더링하고 있습니다!"
    ];

    useEffect(() => {
        let interval = null;
        if (isTimerActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isTimerActive) {
            setIsTimerActive(false);
            alert("지니 쉪: 삐빅! 요리 완성 시간입니다! 맛있게 드십시오! 🐟");
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleYouTubeLink = () => {
        if (recipe?.title) {
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.title + ' 황금 레시피')}`, '_blank');
        }
    };

    // 실시간 인포그래픽 생성 시뮬레이션 및 데이터 바인딩
    useEffect(() => {
        if (!recipe) {
            navigate('/');
            return;
        }

        // 1. 상세 레시피 데이터 로드
        const fetchDetail = async () => {
            try {
                const detail = await generateRecipeDetail(recipe.title, ingredients, dietMode);
                setRecipeDetail(detail);
            } catch (error) {
                console.error(error);
                alert("상세 레시피를 불러오는데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();

        // 2. 인포그래픽 실시간 폴링 (대표님 지시: 5초 단위 상태 체크)
        // aiService.js의 checkInfographicStatus를 호출하여 실제 완료 여부를 확인합니다.
        let stepCount = 0;
        const pollInterval = setInterval(async () => {
            console.log(`[Genie Chef] Checking infographic status... (${stepCount + 1}회차)`);

            // 시각적 메시지 업데이트를 위해 step 강제 조정
            if (stepCount < 3) {
                setInfoGenerationStep(stepCount);
                stepCount++;
            }

            try {
                // aiService에서 실제 상태 확인
                const status = await import('../aiService').then(m => m.checkInfographicStatus(recipe.title));

                if (status.completed) {
                    console.log("[Genie Chef] Infographic Generation Completed!");
                    setInfoUrl(status.url);
                    setInfoGenerationStep(3); // 최종 단계 고정
                    setIsGeneratingInfo(false);
                    clearInterval(pollInterval);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 5000); // 정확히 5초 주기

        return () => clearInterval(pollInterval);
    }, [recipe, ingredients, dietMode, navigate]);

    return (
        <div className="font-display text-slate-900 min-h-screen flex flex-col pb-72 bg-white">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="size-10 rounded-full flex items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="text-base font-bold text-slate-800 tracking-tight">레시피 상세</h1>
                <button className="size-10 rounded-full flex items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined">share</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto">
                {/* 레시피 히어로 섹션 */}
                <section className="relative">
                    <div className="aspect-[4/3] w-full overflow-hidden">
                        <img alt={recipe?.title || '레시피 이미지'} className="w-full h-full object-cover" src={recipe?.img || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2626&auto=format&fit=crop"} />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex gap-2 mb-3">
                            <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full shadow-lg shadow-primary/30 uppercase tracking-widest">Genie Custom</span>
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest">Real-time AI</span>
                        </div>
                        <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md">{recipe?.title || '레시피 상세'}</h2>
                        <div className="flex items-center gap-4 mt-3 text-white/90 text-xs font-bold">
                            {recipeDetail && (
                                <>
                                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-primary">schedule</span> {recipeDetail.time}</span>
                                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-amber-400">star</span> {recipeDetail.difficulty}</span>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* 재료 활용 섹션 */}
                <section className="px-6 py-6 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 tracking-tight">
                            <div className="bg-primary/10 p-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-primary text-base">inventory_2</span>
                            </div>
                            냉장고 식재료 매칭 결과
                        </h3>
                        <span className="text-[10px] bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-400 font-bold uppercase tracking-wider">Matched</span>
                    </div>
                    <div className="space-y-4">
                        {recipeDetail ? (
                            <>
                                {recipeDetail.ingredientsUsed?.length > 0 && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter w-8">Main</span>
                                        <div className="flex flex-wrap gap-2 flex-1">
                                            {recipeDetail.ingredientsUsed.map((ing, idx) => (
                                                <div key={`ing-${idx}`} className="px-3 py-1.5 rounded-xl text-[12px] font-black bg-white border border-slate-200 text-slate-700 shadow-sm transition-all hover:border-primary/50">
                                                    {ing}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {recipeDetail.saucesUsed?.length > 0 && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter w-8">Sauce</span>
                                        <div className="flex flex-wrap gap-2 flex-1">
                                            {recipeDetail.saucesUsed.map((ing, idx) => (
                                                <div key={`sauce-${idx}`} className="px-3 py-1.5 rounded-xl text-[12px] font-black bg-amber-50 border border-amber-100 text-amber-600 shadow-sm transition-all hover:border-amber-400/50">
                                                    {ing}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-3 animate-pulse px-2 py-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-ping"></div>
                                <span className="text-sm text-slate-400 font-bold">인벤토리 분석 중...</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* 상세 요리 과정 섹션 */}
                <section className="px-6 py-12">
                    <div className="flex flex-col items-center mb-10">
                        <div className="bg-primary/5 px-4 py-1.5 rounded-full mb-3">
                            <span className="text-[10px] font-black text-primary tracking-widest uppercase">Recipe Guide</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Chef's Masterclass</h3>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 min-h-[400px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in py-10">
                                <div className="relative">
                                    <div className="size-28 rounded-full bg-primary/5 border-[6px] border-primary/10 flex items-center justify-center text-6xl relative z-10 animate-bounce">
                                        👨‍🍳
                                    </div>
                                    <div className="absolute -top-2 -right-2">
                                        <div className="size-12 rounded-full bg-amber-400 shadow-lg shadow-amber-400/30 flex items-center justify-center animate-pulse">
                                            <span className="material-symbols-outlined text-white text-2xl">lightbulb</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center space-y-3">
                                    <p className="text-primary font-black text-xl tracking-tight leading-tight">지니 쉪이 레시피를<br />설명드리는 중입니다!</p>
                                    <p className="text-slate-400 text-xs font-bold opacity-80">맛있는 냄새가 여기까지 나네요! 🐟</p>
                                </div>
                                <div className="flex gap-2">
                                    {[0, 150, 300, 450].map(delay => (
                                        <div key={delay} className="w-2.5 h-2.5 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: `${delay}ms` }}></div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full animate-fade-in translate-y-0 transition-all duration-1000">
                                <div className="space-y-8 mb-16 px-2">
                                    {recipeDetail?.steps.map((step, idx) => {
                                        const stepText = step.replace(/^\d+\.\s*/, '');
                                        return (
                                            <div key={idx} className="flex gap-6 group">
                                                <div className="bg-slate-50 border border-slate-100 size-10 rounded-2xl text-slate-400 font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-slate-700 leading-relaxed text-[15px] font-medium pt-2 group-hover:text-slate-900 transition-colors">
                                                    {stepText}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* 대표님 지시 구현: 리얼 실시간 인포그래픽 생성 UI */}
                                <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col items-center">
                                    <div className="bg-slate-900 border border-slate-800 px-5 py-2 rounded-2xl mb-6 shadow-xl flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary text-sm animate-spin">auto_awesome</span>
                                        <span className="text-[11px] font-black text-white tracking-widest uppercase">NotebookLM Visual Studio</span>
                                    </div>

                                    <h4 className="text-2xl font-black text-slate-800 mb-8 tracking-tighter flex items-center gap-3">
                                        <span className="text-3xl filter drop-shadow-md">🎨</span>
                                        지니 쉪의 맞춤 인포그래픽
                                    </h4>

                                    <div className="w-full rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border-[10px] border-white ring-1 ring-slate-100 bg-slate-50 aspect-[3/4.5] relative group">
                                        {/* 실시간 생성 중인 경우 (isGeneratingInfo 또는 infoUrl이 아직 없음) */}
                                        {(isGeneratingInfo || !infoUrl) && (
                                            <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-10 text-center animate-fade-in">
                                                <div className="relative mb-10">
                                                    <div className="size-28 rounded-full bg-primary/5 flex items-center justify-center text-5xl animate-spin-slow">
                                                        🖌️
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">
                                                        ✍️
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <p className="text-primary font-black text-xl tracking-tight leading-tight transition-all duration-500">
                                                        {generationMessages[infoGenerationStep]}
                                                    </p>
                                                    <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                                        <p className="text-slate-400 text-xs font-bold leading-relaxed">
                                                            잠시만 기다려주세요, 대표님!<br />
                                                            최고의 인포그래픽을 위해 쉪이 집중하고 있습니다. 🐟
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-8 w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-700 ease-out"
                                                        style={{ width: `${(infoGenerationStep + 1) * 25}%` }}
                                                    ></div>
                                                </div>
                                                <span className="mt-2 text-[10px] font-black text-primary/40 uppercase tracking-widest">Generating {((infoGenerationStep + 1) * 25)}%</span>
                                            </div>
                                        )}

                                        {/* 실제 이미지 로드 */}
                                        <img
                                            src={infoUrl}
                                            alt="지니 쉪의 실시간 인포그래픽 레시피"
                                            className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${isGeneratingInfo || !infoUrl ? 'opacity-0' : 'opacity-100'}`}
                                            onLoad={() => setIsGeneratingInfo(false)}
                                            onError={() => {
                                                console.error("인포그래픽 로드에 실패했습니다.");
                                                setIsGeneratingInfo(false);
                                            }}
                                        />

                                        {!isGeneratingInfo && infoUrl && (
                                            <>
                                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                <a
                                                    href="https://notebooklm.google.com/notebook/1b602f6d-7188-4e1c-8b09-ac95a947490e"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-2xl text-[12px] font-black text-slate-800 shadow-2xl flex items-center gap-2 active:scale-90 hover:scale-105 transition-all z-30 border border-slate-200"
                                                >
                                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                    원본 크게 보기
                                                </a>
                                            </>
                                        )}
                                    </div>
                                    <p className="mt-8 text-[11px] text-slate-400 font-black bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                                        ※ 본 인포그래픽은 NotebookLM AI가 실시간으로 생성한 저작물입니다.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-6 py-10 bg-slate-50 border-t border-slate-100">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-slate-800 flex items-center gap-3 tracking-tight">
                                <div className="bg-primary/10 p-2 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">analytics</span>
                                </div>
                                스마트 영양 레포트
                            </h3>
                        </div>

                        <div className="flex items-center gap-10 mb-10">
                            <div className="relative shrink-0">
                                <div className="size-28 rounded-full flex items-center justify-center p-1 bg-slate-100" style={{ background: `conic-gradient(#4ADE80 ${recipeDetail ? (recipeDetail.nutrition.calories / 10) : 0}deg, #F1F5F9 0deg)` }}>
                                    <div className="size-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                        <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{recipeDetail ? recipeDetail.nutrition.calories : '-'}</span>
                                        <span className="text-[11px] text-slate-400 font-black tracking-widest mt-1">KCAL</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full border-2 border-white shadow-lg">
                                    ENERGY
                                </div>
                            </div>

                            <div className="flex-1 space-y-5">
                                {[
                                    { label: 'Tanchul', key: 'carbs', color: 'bg-carb', text: 'text-carb' },
                                    { label: 'Protein', key: 'protein', color: 'bg-protein', text: 'text-protein' },
                                    { label: 'Fat', key: 'fat', color: 'bg-fat', text: 'text-fat' }
                                ].map((n) => (
                                    <div key={n.key} className="space-y-1.5">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{n.label}</span>
                                            <span className={`text-sm font-black ${n.text}`}>{recipeDetail ? recipeDetail.nutrition[n.key] : 0}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                            <div className={`h-full ${n.color} transition-all duration-1000 ease-out rounded-full`} style={{ width: `${recipeDetail ? recipeDetail.nutrition[n.key] : 0}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50">
                            {[
                                { label: 'Sodium', val: recipeDetail?.nutrition.sodium, icon: 'salt' },
                                { label: 'Sugar', val: recipeDetail?.nutrition.sugar, icon: 'ice_cream' },
                                { label: 'Fiber', val: recipeDetail?.nutrition.fiber, icon: 'energy_savings_leaf' }
                            ].map((item, idx) => (
                                <div key={item.label} className={`text-center py-2 ${idx === 1 ? 'border-x border-slate-100' : ''}`}>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">{item.label}</p>
                                    <div className="flex flex-col items-center">
                                        <span className="text-base font-black text-slate-700">{item.val || '-'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-6 py-10 mb-20">
                    <div className="p-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl shadow-youtube/20 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 group-hover:scale-125 transition-all">
                            <span className="material-symbols-outlined text-8xl">video_library</span>
                        </div>
                        <div className="size-20 rounded-[2rem] bg-youtube flex items-center justify-center mb-8 shadow-2xl shadow-red-500/40 relative z-10">
                            <span className="material-symbols-outlined text-white text-5xl">play_arrow</span>
                        </div>
                        <div className="relative z-10 space-y-3">
                            <h4 className="text-2xl font-black tracking-tight leading-none">실력파 지니 쉪의 요리 쇼</h4>
                            <p className="text-slate-400 text-sm font-bold opacity-80 mb-8">영상을 보면서 차근차근 따라 해보세요!<br />맛의 차이가 느껴지실 겁니다. 🐟</p>
                            <button onClick={handleYouTubeLink} className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-slate-50">
                                <span className="material-symbols-outlined text-youtube">ondemand_video</span>
                                유튜브 마스터 레시피 시청
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* 고정 타이머 UI */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] z-50">
                {isTimerActive ? (
                    <div className="w-full py-6 bg-slate-900/90 backdrop-blur-2xl border border-white/20 text-white font-black rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-between px-10">
                        <div className="flex items-center gap-5">
                            <div className="size-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                <span className="material-symbols-outlined text-amber-500 text-3xl animate-spin-slow">timer</span>
                            </div>
                            <span className="text-5xl font-mono tracking-tighter text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">{formatTime(timeLeft)}</span>
                        </div>
                        <button onClick={() => setIsTimerActive(false)} className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-black px-6 py-3 rounded-2xl transition-all border border-white/10 uppercase tracking-widest shadow-xl">
                            Pause
                        </button>
                    </div>
                ) : (
                    <div className="bg-white/95 backdrop-blur-3xl rounded-[3rem] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.25)] border border-white p-6 w-full flex flex-col gap-5 transform transition-all group hover:-translate-y-2">
                        <div className="flex items-center justify-between px-3">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-2xl group-hover:bg-primary/20 transition-colors">
                                    <span className="material-symbols-outlined text-primary text-2xl font-bold">timer</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-black text-slate-800 tracking-tight leading-none">스마트 타이머</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Smart Countdown</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                <button onClick={() => setTimeLeft(prev => Math.max(60, prev - 60))} className="size-12 flex items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm border border-slate-100 hover:text-primary active:scale-90 transition-all">
                                    <span className="material-symbols-outlined text-xl">remove</span>
                                </button>
                                <span className="text-3xl font-black font-mono tracking-tighter text-slate-900 w-20 text-center">{formatTime(timeLeft)}</span>
                                <button onClick={() => setTimeLeft(prev => prev + 60)} className="size-12 flex items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm border border-slate-100 hover:text-primary active:scale-90 transition-all">
                                    <span className="material-symbols-outlined text-xl">add</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {[15, 10, 5].map(m => (
                                <button key={m} onClick={() => setTimeLeft(m * 60)} className="flex-1 py-4 rounded-2xl bg-white text-slate-600 text-sm font-black hover:bg-primary/5 hover:text-primary hover:border-primary/50 border border-slate-100 transition-all shadow-sm">
                                    {m}분
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsTimerActive(true)}
                            className="w-full py-6 bg-primary text-white font-black rounded-[2rem] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 active:scale-[0.98] hover:bg-primary/95 transition-all text-xl tracking-tight relative overflow-hidden group/btn">
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                            <span className="material-symbols-outlined">play_arrow</span>
                            조리 시작하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recipe;
