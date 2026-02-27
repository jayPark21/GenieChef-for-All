import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Recipe = () => {
    const navigate = useNavigate();
    const [isInfographicLoaded, setIsInfographicLoaded] = useState(false);

    useEffect(() => {
        // 모의 로딩 지연 (예: 3초 후 인포그래픽 로드 완료)
        const timer = setTimeout(() => {
            setIsInfographicLoaded(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="font-display text-slate-900 min-h-screen flex flex-col pb-24 bg-white">
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
                        <img alt="15분 완성 계란 두부 조림" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk-jlvRf36zw9T3Z-W68qPBOErC2FAs45bXt9qgZtwfW2hLbhMjlZUS2wS1Lkta6wfjD2mZlIed4KT7VQ73054ELVw_bR45BNVn5C08dMPsJQvJx6oW3WIYOWQT__9wQ8L5OQV6G910LkEkYCsqbcQX8cW63CRCrhR8e31FnBYBrAHsksZR6p4zXu29LO703ohAo9bcbINYEGhzjpQpWhUpi9TKhDxS_rKOtCqdEb9uidGLAADiQ6TLXgmymDyCiGRwra1W5708HY" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                        <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full mb-2">AI 추천 메뉴</span>
                        <h2 className="text-2xl font-bold text-white leading-tight">15분 완성 계란 두부 조림</h2>
                        <div className="flex items-center gap-3 mt-2 text-white/90 text-sm">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 15분</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">star</span> 쉬움</span>
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
                    <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border bg-white border-primary/30 text-primary">
                            <span className="mr-1">🥚</span> 계란
                        </div>
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border bg-white border-primary/30 text-primary">
                            <span className="mr-1">🧊</span> 두부
                        </div>
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border bg-white border-primary/30 text-primary">
                            <span className="mr-1">🥬</span> 대파
                        </div>
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border bg-slate-100 border-slate-200 text-slate-400">
                            <span className="mr-1">🧂</span> 간장
                        </div>
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border bg-slate-100 border-slate-200 text-slate-400">
                            <span className="mr-1">🌶️</span> 고춧가루
                        </div>
                    </div>
                </section>

                <section className="px-6 py-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">요리 과정 인포그래픽</h3>

                    {/* NotebookLM Infographic Loading Area */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[300px] flex flex-col items-center justify-center">
                        {!isInfographicLoaded ? (
                            <div className="flex flex-col items-center justify-center space-y-6 animate-pulse">
                                {/* AI 쉐프 애니메이션 아이콘 */}
                                <div className="relative">
                                    <div className="size-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-5xl relative z-10 animate-bounce">
                                        👨‍🍳
                                    </div>
                                    <div className="absolute top-0 right-0 -mr-4 -mt-2">
                                        <span className="material-symbols-outlined text-amber-400 text-3xl animate-ping">emoji_objects</span>
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-200 rounded-[100%] blur-sm"></div>
                                </div>

                                <div className="text-center space-y-2">
                                    <p className="text-primary font-bold text-lg">AI 쉐프가 요리 과정을<br />인포그래픽으로 예쁘게 굽는 중...</p>
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
                                <div className="flex items-center gap-2 mb-4 justify-center">
                                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                    <span className="text-sm font-bold text-slate-700">AI 인포그래픽 생성 완료!</span>
                                </div>
                                <img
                                    src="https://lh3.googleusercontent.com/notebooklm/ANHLwAzv388nZSA8SWLQVmdeqm8SHOEBwZH12hx66t9Lw6Pd_sYys08yJ9B4NsvJohcPfjakpD5vxKz8UYtI7-9HBFX25-0HuN8vPAXvJdVeBBRx0H_l-aAlcDaOO1vIUWYN6PBhaANqqyCCVEvImlGg9TA4mpea=w1536-d-h2752-mp2"
                                    alt="요리 과정 인포그래픽"
                                    className="w-full h-auto rounded-2xl shadow-md border border-slate-200"
                                    onLoad={() => console.log('Infographic fully loaded')}
                                />
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
                                        <span className="text-lg font-bold text-slate-900 leading-none">385</span>
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
                                        <span className="text-[11px] font-bold text-carb">32%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-carb rounded-full" style={{ width: '32%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[11px] font-bold text-slate-600">단백질 (Protein)</span>
                                        <span className="text-[11px] font-bold text-protein">45%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-protein rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[11px] font-bold text-slate-600">지방 (Fat)</span>
                                        <span className="text-[11px] font-bold text-fat">23%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-fat rounded-full" style={{ width: '23%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 border-t border-slate-50 pt-5">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-medium mb-1">나트륨</p>
                                <p className="text-xs font-bold text-slate-700">420mg</p>
                            </div>
                            <div className="text-center border-x border-slate-100">
                                <p className="text-[10px] text-slate-400 font-medium mb-1">당류</p>
                                <p className="text-xs font-bold text-slate-700">4.5g</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-medium mb-1">식이섬유</p>
                                <p className="text-xs font-bold text-slate-700">2.1g</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-8 border-t border-slate-100 bg-slate-50/50">
                    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center">
                        <div className="size-14 rounded-full bg-youtube/10 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-youtube" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"></path>
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">영상을 보며 함께 요리해요</h4>
                        <p className="text-sm text-slate-500 mb-6">원본 레시피 가이드를<br />유튜브 영상으로 확인해보세요.</p>
                        <button className="w-full py-4 bg-youtube text-white font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-youtube/20">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                            </svg>
                            레시피 영상 보기
                        </button>
                    </div>
                </section>
            </main>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50">
                <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">timer</span>
                    타이머 시작하기
                </button>
            </div>
        </div>
    );
};

export default Recipe;
