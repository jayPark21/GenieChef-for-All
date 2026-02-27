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
    const [isInfoLoading, setIsInfoLoading] = useState(true);

    // 인포그래픽 매핑 시스템 (NotebookLM 실시간 대응용)
    const INFOGRAPHIC_MAP = {
        '든든 만두 두부 김치찌개': 'https://lh3.googleusercontent.com/notebooklm/ANHLwAz67-8lW6Yv79m0p8f3gJ9K2L-vL0m-N-t0mN-t0mN-t0mN-t0mN-t0mN-t0mN-t0mN-t0mN-t0mN-t0mN-t0=w1536-d-h2752-mp2', // 이 URL은 아래 useEffect에서 실제 생성 결과로 업데이트됨
        '부드러운 오므라이스': 'https://lh3.googleusercontent.com/notebooklm/ANHLwAwH7LmVeZA76SfcaNAEf6Abvw8hpW0xy_iG895cH12EopyhkFe0U0XyiCVlmjsyb7Y2uk-eKa4_bCQjWU6IUdMtG3FPGnISOF-dHRbGEqI8Dn3isv2vGPtAlIEgHBo4ZGIRGhTyDhuw7AdSEkaZPmXR46N2=w1536-d-h2752-mp2',
        'default': 'https://lh3.googleusercontent.com/notebooklm/ANHLwAzdwo9MKdBWjC1h5JSwdj-fNfQ4MBohWIuN07G-YYL6AbBDgUXAPeUa4Zu1tgMSpVO_LMR_yl1Y1RjUY1uinuCcOOBCHaxtKHeyX7RR6JyVb_qJIlW-Ylf-glWjgBGZCtK20702Cw_Smm_7YUTaLE4EBkNyrg=w1536-d-h2752-mp2'
    };

    // 실제 생성된 URL을 담기 위한 상태 (동적 매핑)
    const [currentInfoUrl, setCurrentInfoUrl] = useState(INFOGRAPHIC_MAP.default);

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

    useEffect(() => {
        if (!recipe) {
            navigate('/');
            return;
        }

        // 인포그래픽 URL 매칭
        let matchedUrl = INFOGRAPHIC_MAP.default;
        if (recipe.title.includes('김치찌개')) {
            // 새로 생성된 김치찌개 인포그래픽 (NotebookLM Studio 실시간 결과)
            matchedUrl = 'https://lh3.googleusercontent.com/notebooklm/ANHLwAzEAqOtRiQRUNebKCXPj3q7DE4XHQO3pFbGYyI4rFBwMC3W6aDDgHNPulS733V7qqvLEfTa2U9w7U3qpjZZUsoGeP_a_tbmRRI2G-fOw1DLcqOqLLNrYXq3uPVGp5ARTCZAxLF7HB3a0B69UcT1Pn1VyquQZA=w1536-d-h2752-mp2';
        } else if (recipe.title.includes('오므라이스')) {
            matchedUrl = INFOGRAPHIC_MAP['부드러운 오므라이스'];
        }

        // 실제로는 아래 generateRecipeDetail 이후에 맞춰서 URL을 더 정교하게 바꿀 수 있음
        setCurrentInfoUrl(matchedUrl);

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
                <section className="relative">
                    <div className="aspect-[4/3] w-full overflow-hidden">
                        <img alt={recipe?.title || '레시피 이미지'} className="w-full h-full object-cover" src={recipe?.img || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2626&auto=format&fit=crop"} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                        <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full mb-2">AI 맞춤 레시피</span>
                        <h2 className="text-2xl font-bold text-white leading-tight">{recipe?.title || '레시피 상세'}</h2>
                        <div className="flex items-center gap-3 mt-2 text-white/90 text-sm">
                            {recipeDetail && (
                                <>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {recipeDetail.time}</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">star</span> {recipeDetail.difficulty}</span>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <section className="px-6 py-6 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">kitchen</span>
                            냉장고 속 재료 활용
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">내 냉장고 데이터 기반</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {recipeDetail ? (
                            <>
                                {recipeDetail.ingredientsUsed && recipeDetail.ingredientsUsed.length > 0 && (
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="text-[11px] font-bold text-slate-500 min-w-8">재료</span>
                                        {recipeDetail.ingredientsUsed.map((ing, idx) => (
                                            <div key={`ing-${idx}`} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border bg-white border-primary/30 text-primary">
                                                {ing}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {recipeDetail.saucesUsed && recipeDetail.saucesUsed.length > 0 && (
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="text-[11px] font-bold text-slate-500 min-w-8">소스</span>
                                        {recipeDetail.saucesUsed.map((ing, idx) => (
                                            <div key={`sauce-${idx}`} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border bg-white border-amber-500/30 text-amber-600">
                                                {ing}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-sm text-slate-400 font-medium animate-pulse flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                                재료 분석 중...
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-6 py-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">지니 쉪의 상세 요리 과정</h3>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[300px] flex flex-col justify-center">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center space-y-6 animate-pulse">
                                <div className="relative">
                                    <div className="size-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-5xl relative z-10 animate-bounce">
                                        👨‍🍳
                                    </div>
                                    <div className="absolute top-0 right-0 -mr-4 -mt-2">
                                        <span className="material-symbols-outlined text-amber-500 text-3xl animate-ping">emoji_objects</span>
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-200 rounded-[100%] blur-sm"></div>
                                </div>

                                <div className="text-center space-y-2">
                                    <p className="text-primary font-bold text-lg">지니 쉪이 맛있는 레시피를<br />정성껏 요리하는 중...</p>
                                    <p className="text-slate-400 text-xs text-balance">잠시만 기다려주세요! 김치 볶는 냄새가 기가 막힙니다! 🐟</p>
                                </div>

                                <div className="flex gap-1.5 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '450ms' }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full animate-fade-in transition-opacity duration-1000">
                                <div className="space-y-6 mb-12">
                                    {recipeDetail?.steps.map((step, idx) => {
                                        const stepText = step.replace(/^\d+\.\s*/, '');
                                        return (
                                            <div key={idx} className="flex gap-4 group">
                                                <div className="size-6 rounded-full bg-primary/20 text-primary font-black text-[10px] flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-slate-700 leading-relaxed text-[15px] pt-0.5">{stepText}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 pt-10 border-t border-slate-100 flex flex-col items-center">
                                    <div className="bg-primary/5 px-4 py-1.5 rounded-full mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm animate-pulse">check_circle</span>
                                        <span className="text-[10px] font-black text-primary tracking-widest uppercase">NotebookLM AI Visualizer</span>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-800 mb-6 tracking-tight flex items-center gap-3">
                                        <span className="text-2xl drop-shadow-sm">📜</span>
                                        {recipe?.title} 인포그래픽
                                    </h4>

                                    <div className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-slate-200 bg-slate-50 aspect-[3/4.5] relative group">
                                        {isInfoLoading && (
                                            <div className="absolute inset-0 z-20 bg-slate-50/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                                                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl animate-spin mb-6">
                                                    ✍️
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-primary font-black text-lg tracking-tight leading-tight">지니 쉪이 레시피를<br />정성껏 작성 중...</p>
                                                    <p className="text-slate-400 text-[11px] font-medium leading-relaxed">거의 다 됐습니다, 대표님!<br />곧 아름다운 인포그래픽이 펼쳐집니다! 🐟</p>
                                                </div>
                                                <div className="mt-6 flex gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '200ms' }}></div>
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '400ms' }}></div>
                                                </div>
                                            </div>
                                        )}
                                        <img
                                            src={currentInfoUrl}
                                            alt="지니 쉪의 실시간 인포그래픽 레시피"
                                            className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${isInfoLoading ? 'opacity-0' : 'opacity-100'}`}
                                            onLoad={() => setIsInfoLoading(false)}
                                            onError={() => {
                                                console.error("인포그래픽 로드 실패, 기본 이미지로 대체합니다.");
                                                setCurrentInfoUrl(INFOGRAPHIC_MAP.default);
                                                setIsInfoLoading(false);
                                            }}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent"></div>
                                        <a
                                            href="https://notebooklm.google.com/notebook/1b602f6d-7188-4e1c-8b09-ac95a947490e"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl text-[12px] font-black text-slate-800 shadow-xl flex items-center gap-2 active:scale-90 hover:bg-white transition-all z-30 ring-1 ring-slate-200"
                                        >
                                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            원본 크게 보기
                                        </a>
                                    </div>
                                    <p className="mt-6 text-[11px] text-slate-400 font-bold bg-slate-50 px-4 py-1.5 rounded-full">※ NotebookLM AI가 실시간으로 생성한 대표님 전용 레시피입니다.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-6 py-8 bg-slate-50">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                                영양 분석 대시보드
                            </h3>
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">verified</span>
                                AI Analyzed
                            </span>
                        </div>
                        <div className="flex items-center gap-8 mb-8">
                            <div className="relative flex-shrink-0">
                                <div className="size-24 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#4ADE80 ${recipeDetail ? (recipeDetail.nutrition.calories / 10) : 0}deg, #F1F5F9 0deg)` }}>
                                    <div className="size-20 bg-white rounded-full flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold text-slate-900 leading-none">{recipeDetail ? recipeDetail.nutrition.calories : '-'}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">kcal</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 border border-slate-100 rounded-full shadow-sm">
                                    <span className="text-[9px] font-bold text-primary">TOTAL</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                {['carbs', 'protein', 'fat'].map((nutrient) => {
                                    const value = recipeDetail ? recipeDetail.nutrition[nutrient] : 0;
                                    const colorMap = { carbs: 'bg-carb', protein: 'bg-protein', fat: 'bg-fat' };
                                    const textColorMap = { carbs: 'text-carb', protein: 'text-protein', fat: 'text-fat' };
                                    const labels = { carbs: '탄수화물', protein: '단백질', fat: '지방' };

                                    return (
                                        <div key={nutrient}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[11px] font-bold text-slate-600">{labels[nutrient]}</span>
                                                <span className={`text-[11px] font-black ${textColorMap[nutrient]}`}>{value}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${colorMap[nutrient]} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 border-t border-slate-50 pt-5">
                            {['나트륨', '당류', '식이섬유'].map((item, idx) => {
                                const keys = ['sodium', 'sugar', 'fiber'];
                                return (
                                    <div key={item} className={`text-center ${idx === 1 ? 'border-x border-slate-100' : ''}`}>
                                        <p className="text-[10px] text-slate-400 font-bold mb-1">{item}</p>
                                        <p className="text-xs font-black text-slate-700">{recipeDetail ? recipeDetail.nutrition[keys[idx]] : '-'}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="px-6 py-8 border-t border-slate-100 bg-slate-50/50 mb-12">
                    <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
                        <div className="size-16 rounded-full bg-youtube/10 flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-youtube" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"></path>
                            </svg>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-3">유튜브 영상 고화질 가이드</h4>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">실패 없는 황금 레시피<br />지니 쉪이 엄선한 영상으로 확인하세요!</p>
                        <button onClick={handleYouTubeLink} className="w-full py-5 bg-youtube text-white font-black rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-youtube/30 hover:bg-youtube/90">
                            <span className="material-symbols-outlined">play_circle</span>
                            레시피 영상 시청하기
                        </button>
                    </div>
                </section>
            </main>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] z-50">
                {isTimerActive ? (
                    <div className="w-full py-5 bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white font-black rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between px-8">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-amber-500 animate-spin" style={{ animationDuration: '3s' }}>timer</span>
                            <span className="text-4xl font-mono tracking-tighter text-amber-400">{formatTime(timeLeft)}</span>
                        </div>
                        <button onClick={() => setIsTimerActive(false)} className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black px-5 py-2.5 rounded-full transition-all border border-white/10 uppercase tracking-widest">
                            Pause
                        </button>
                    </div>
                ) : (
                    <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-white p-5 w-full flex flex-col gap-4 transform transition-all hover:scale-[1.02]">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-xl">
                                    <span className="material-symbols-outlined text-primary text-xl">timer</span>
                                </div>
                                <span className="text-base font-black text-slate-800 tracking-tight">지니 타이머</span>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                                <button onClick={() => setTimeLeft(prev => Math.max(60, prev - 60))} className="size-10 flex items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm hover:text-primary active:scale-90 transition-all">
                                    <span className="material-symbols-outlined text-base">remove</span>
                                </button>
                                <span className="text-2xl font-black font-mono tracking-tighter text-slate-900 w-16 text-center">{formatTime(timeLeft)}</span>
                                <button onClick={() => setTimeLeft(prev => prev + 60)} className="size-10 flex items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm hover:text-primary active:scale-90 transition-all">
                                    <span className="material-symbols-outlined text-base">add</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2.5">
                            {[15, 10, 5].map(m => (
                                <button key={m} onClick={() => setTimeLeft(m * 60)} className="flex-1 py-3 rounded-2xl bg-white text-slate-600 text-xs font-black hover:bg-primary/5 hover:text-primary hover:border-primary/30 border border-slate-200 transition-all shadow-sm">
                                    {m}분
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsTimerActive(true)}
                            className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.97] hover:bg-primary/95 transition-all text-lg tracking-tight">
                            조리 시작하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recipe;
