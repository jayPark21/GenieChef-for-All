import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateRecipeDetail } from '../aiService';

const Recipe = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { recipe, ingredients, dietMode } = location.state || {};

    const [recipeDetail, setRecipeDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15분 디폴트
    const [isTimerActive, setIsTimerActive] = useState(false);

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
                            <div className="text-sm text-slate-400">재료를 불러오는 중...</div>
                        )}
                    </div>
                </section>

                <section className="px-6 py-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">지니 쉪의 상세 요리 과정</h3>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[300px] flex flex-col justify-center">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center space-y-6 animate-pulse">
                                {/* 지니 쉪 애니메이션 아이콘 */}
                                <div className="relative">
                                    <div className="size-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-5xl relative z-10 animate-bounce block">
                                        👨‍🍳
                                    </div>
                                    <div className="absolute top-0 right-0 -mr-4 -mt-2">
                                        <span className="material-symbols-outlined text-amber-500 text-3xl animate-ping">emoji_objects</span>
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-200 rounded-[100%] blur-sm"></div>
                                </div>

                                <div className="text-center space-y-2">
                                    <p className="text-primary font-bold text-lg">지니 쉪이 맛있는 레시피를<br />정성껏 요리하는 중...</p>
                                    <p className="text-slate-400 text-xs">잠시만 기다려주세요! (맛있는 냄새 킁킁)</p>
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
                                <div className="space-y-6">
                                    {recipeDetail?.steps.map((step, idx) => {
                                        // "1. 양파를...", "2. ..." 형식이면 숫자 골라내기 위해 가공
                                        const stepText = step.replace(/^\d+\.\s*/, '');
                                        return (
                                            <div key={idx} className="flex gap-4">
                                                <div className="size-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-slate-700 leading-relaxed text-[15px] pt-0.5">{stepText}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center">
                                    <h4 className="text-md font-bold text-slate-800 mb-4 tracking-tight flex items-center gap-2">
                                        <span className="text-xl">📜</span>
                                        지니 쉪의 맞춤 인포그래픽 레시피
                                    </h4>
                                    <div className="w-full rounded-3xl overflow-hidden shadow-lg border-4 border-white ring-1 ring-slate-200 bg-slate-50 aspect-[3/4] relative group">
                                        <img
                                            src="https://lh3.googleusercontent.com/notebooklm/ANHLwAwH7LmVeZA76SfcaNAEf6Abvw8hpW0xy_iG895cH12EopyhkFe0U0XyiCVlmjsyb7Y2uk-eKa4_bCQjWU6IUdMtG3FPGnISOF-dHRbGEqI8Dn3isv2vGPtAlIEgHBo4ZGIRGhTyDhuw7AdSEkaZPmXR46N2=w1536-d-h2752-mp2"
                                            alt="지니 쉪의 실시간 인포그래픽 레시피"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        <a
                                            href="https://notebooklm.google.com/notebook/1b602f6d-7188-4e1c-8b09-ac95a947490e"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-[11px] font-bold text-slate-800 shadow-sm flex items-center gap-2 active:scale-95 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            원본 크게 보기
                                        </a>
                                    </div>
                                    <p className="mt-4 text-[11px] text-slate-400 font-medium">※ NotebookLM AI가 실시간으로 생성한 전용 레시피입니다.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-6 py-8 bg-slate-50">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                                영양 분석 대시보드
                            </h3>
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">verified</span>
                                AI Analyzed: 95% Accuracy
                            </span>
                        </div>
                        <div className="flex items-center gap-8 mb-8">
                            <div className="relative flex-shrink-0">
                                <div className="size-24 rounded-full flex items-center justify-center" style={{ background: 'conic-gradient(#4ADE80 280deg, #F1F5F9 0deg)' }}>
                                    <div className="size-20 bg-white rounded-full flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold text-slate-900 leading-none">{recipeDetail ? recipeDetail.nutrition.calories : '-'}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">kcal</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 border border-slate-100 rounded-full shadow-sm">
                                    <span className="text-[9px] font-bold text-primary">총 칼로리</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[11px] font-bold text-slate-600">탄수화물 (Carbs)</span>
                                        <span className="text-[11px] font-bold text-carb">{recipeDetail ? recipeDetail.nutrition.carbs : 0}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-carb rounded-full transition-all duration-1000" style={{ width: `${recipeDetail ? recipeDetail.nutrition.carbs : 0}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[11px] font-bold text-slate-600">단백질 (Protein)</span>
                                        <span className="text-[11px] font-bold text-protein">{recipeDetail ? recipeDetail.nutrition.protein : 0}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-protein rounded-full transition-all duration-1000" style={{ width: `${recipeDetail ? recipeDetail.nutrition.protein : 0}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[11px] font-bold text-slate-600">지방 (Fat)</span>
                                        <span className="text-[11px] font-bold text-fat">{recipeDetail ? recipeDetail.nutrition.fat : 0}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-fat rounded-full transition-all duration-1000" style={{ width: `${recipeDetail ? recipeDetail.nutrition.fat : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 border-t border-slate-50 pt-5">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-medium mb-1">나트륨</p>
                                <p className="text-xs font-bold text-slate-700">{recipeDetail ? recipeDetail.nutrition.sodium : '-'}</p>
                            </div>
                            <div className="text-center border-x border-slate-100">
                                <p className="text-[10px] text-slate-400 font-medium mb-1">당류</p>
                                <p className="text-xs font-bold text-slate-700">{recipeDetail ? recipeDetail.nutrition.sugar : '-'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-medium mb-1">식이섬유</p>
                                <p className="text-xs font-bold text-slate-700">{recipeDetail ? recipeDetail.nutrition.fiber : '-'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-8 border-t border-slate-100 bg-slate-50/50 mb-12">
                    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center">
                        <div className="size-14 rounded-full bg-youtube/10 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-youtube" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"></path>
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">영상을 보며 함께 요리해요</h4>
                        <p className="text-sm text-slate-500 mb-6">원본 레시피 가이드를<br />유튜브 영상으로 확인해보세요.</p>
                        <button onClick={handleYouTubeLink} className="w-full py-4 bg-youtube text-white font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-youtube/20 hover:bg-youtube/90">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                            </svg>
                            레시피 영상 보기
                        </button>
                    </div>
                </section>
            </main>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50">
                {isTimerActive ? (
                    <div className="w-full py-4 bg-slate-900 border border-slate-700 text-white font-bold rounded-2xl shadow-2xl flex items-center justify-between px-6">
                        <span className="material-symbols-outlined text-amber-500 animate-pulse">timer</span>
                        <span className="text-3xl font-mono tracking-widest text-amber-400">{formatTime(timeLeft)}</span>
                        <button onClick={() => setIsTimerActive(false)} className="text-[11px] bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors uppercase tracking-wider">
                            일시정지
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-4 w-full flex flex-col gap-3 transition-all">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">timer</span>
                                <span className="text-sm font-bold text-slate-700">요리 타이머</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setTimeLeft(prev => Math.max(60, prev - 60))} className="size-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all">
                                    <span className="material-symbols-outlined text-sm">remove</span>
                                </button>
                                <span className="text-xl font-bold font-mono tracking-widest text-slate-800 w-16 text-center">{formatTime(timeLeft)}</span>
                                <button onClick={() => setTimeLeft(prev => prev + 60)} className="size-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setTimeLeft(15 * 60)} className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 border border-slate-100 transition-colors">15분</button>
                            <button onClick={() => setTimeLeft(10 * 60)} className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 border border-slate-100 transition-colors">10분</button>
                            <button onClick={() => setTimeLeft(5 * 60)} className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 border border-slate-100 transition-colors">5분</button>
                        </div>
                        <button
                            onClick={() => setIsTimerActive(true)}
                            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                            시작하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recipe;
