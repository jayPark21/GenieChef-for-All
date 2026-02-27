import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateRecipeDetail, checkInfographicStatus, generateRecipeImage } from '../aiService';
import { motion } from 'framer-motion';

import RecipeInfographic from '../components/RecipeInfographic';

const Recipe = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { recipe, ingredients, dietMode } = location.state || {};

    const [recipeDetail, setRecipeDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isSavingHistory, setIsSavingHistory] = useState(false);

    // 헤더 이미지 상태 (초기값은 null로 두어 스피너가 먼저 돌게 함)
    const [headerImage, setHeaderImage] = useState(null);

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

    const handleSaveHistory = async () => {
        if (!recipeDetail) {
            alert("저장할 레시피 정보가 없습니다.");
            return;
        }

        setIsSavingHistory(true);
        try {
            const generatedMarkdown = `
## 👨‍🍳 요리 가이드 (${dietMode || '일반식'})

**소요 시간:** ${recipeDetail.time}
**난이도:** ${recipeDetail.difficulty}
**칼로리:** ${recipeDetail.nutrition?.calories || 'N/A'}

### 🥬 주재료
${(recipeDetail.ingredientsUsed || []).join(', ')}

### 🧂 양념 및 소스
${(recipeDetail.saucesUsed || []).join(', ')}

### 🍳 조리 순서
${(recipeDetail.steps || []).map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

### 💡 쉪의 꿀팁
> ${recipeDetail.tip}
`;

            // Canvas를 이용해 Base64 이미지를 압축하는 유틸리티 (Firestore 1MB 용량 제한 해결)
            const compressImage = (base64Str, maxWidth = 800) => {
                return new Promise((resolve) => {
                    if (!base64Str || !base64Str.startsWith('data:image')) {
                        resolve(base64Str);
                        return;
                    }
                    const img = new Image();
                    img.src = base64Str;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ratio = maxWidth / img.width;
                        canvas.width = maxWidth;
                        canvas.height = img.height * ratio;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/jpeg', 0.6)); // JPEG 포맷, 품질 60% 로 용량 대폭 축소
                    };
                    img.onerror = () => resolve(base64Str);
                });
            };

            const compressedImageUrl = infoUrl ? await compressImage(infoUrl) : null;

            // 사용자 인증 기능이 아직 없으므로 'guest_user'로 하드코딩
            const historyRef = collection(db, 'users', 'guest_user', 'history');

            await addDoc(historyRef, {
                title: recipe.title,
                dietMode: dietMode || '일반식',
                markdown: generatedMarkdown.trim(),
                imageUrl: compressedImageUrl, // 압축된 인포그래픽 이미지 URL 저장
                createdAt: new Date()
            });

            alert("레시피가 히스토리에 성공적으로 저장되었습니다!");
        } catch (error) {
            console.error("히스토리 저장 중 오류 발생:", error);
            alert("히스토리 저장에 실패했습니다. (용량 문제일 수 있습니다)");
        } finally {
            setIsSavingHistory(false);
        }
    };

    const handleYouTubeLink = () => {
        if (recipe?.title) {
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.title + ' 황금 레시피')}`, '_blank');
        }
    };

    // 1. 상세 레시피 텍스트 생성
    useEffect(() => {
        window.scrollTo(0, 0); // 화면 진입 시 최상단 고정

        if (!recipe) {
            navigate('/');
            return;
        }

        const fetchDetail = async () => {
            try {
                const detail = await generateRecipeDetail(recipe.title, ingredients, dietMode);
                setRecipeDetail(detail);

                // 조리 시간(문자열)을 파싱하여 초 단위로 변환 후 타이머에 동기화
                if (detail?.time) {
                    let totalSeconds = 0;
                    const timeString = detail.time;

                    const hMatch = timeString.match(/(\d+)\s*시간/);
                    if (hMatch) totalSeconds += parseInt(hMatch[1], 10) * 3600;

                    const mMatch = timeString.match(/(\d+)\s*분/);
                    if (mMatch) totalSeconds += parseInt(mMatch[1], 10) * 60;

                    if (totalSeconds > 0) {
                        setTimeLeft(totalSeconds);
                    }
                }
            } catch (error) {
                console.error(error);
                alert("상세 레시피를 불러오는데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchImage = async () => {
            const img = await generateRecipeImage(recipe.title);
            if (img) setHeaderImage(img);
        };

        fetchDetail();
        fetchImage();
    }, [recipe, ingredients, dietMode, navigate]);

    // 2. 인포그래픽 이미지 생성 및 자동 스크롤 (recipeDetail 완료 후 실행)
    useEffect(() => {
        if (!recipeDetail) return;

        let stepCount = 0;
        const pollInterval = setInterval(async () => {
            if (stepCount < 3) {
                setInfoGenerationStep(stepCount);
                stepCount++;
            }

            // 의도적인 상태 지연 이후 바로 생성 시작
            if (stepCount >= 1) {
                try {
                    const status = await checkInfographicStatus(recipe?.title, recipeDetail);
                    if (status.completed) {
                        setInfoUrl(status.url);
                        setInfoGenerationStep(3);
                        setIsGeneratingInfo(false);
                        clearInterval(pollInterval);
                        // 자동 스크롤 기능 삭제: 유저 자유 스크롤 보장
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [recipeDetail, recipe?.title]);

    const renderInfographicSection = () => {
        if (isGeneratingInfo) {
            return (
                <div className="bg-slate-900 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden min-h-[500px]">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(74,222,128,0.2),transparent_70%)] animate-pulse"></div>
                    </div>

                    <div className="relative z-10 size-32 mb-10">
                        <svg className="size-full animate-spin-slow" viewBox="0 0 100 100">
                            <circle className="text-slate-800" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="2" />
                            <circle className="text-primary" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * (infoGenerationStep + 1)) / 4} strokeLinecap="round" strokeWidth="4" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl animate-bounce">🎨</span>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-4 max-w-xs">
                        <h5 className="text-white text-xl font-black tracking-tight">{generationMessages[infoGenerationStep]}</h5>
                        <div className="flex justify-center gap-1.5">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className={`size-1.5 rounded-full transition-all duration-500 ${i <= infoGenerationStep ? 'bg-primary w-6' : 'bg-slate-700'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return <RecipeInfographic recipe={recipeDetail || recipe} infoUrl={infoUrl} onStartCooking={() => setIsTimerActive(true)} />;
    };

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
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200 relative">
                        {headerImage ? (
                            <img alt={recipe?.title || '레시피 이미지'} className="w-full h-full object-cover transition-opacity duration-500 ease-in-out" src={headerImage} />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100">
                                <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                                <span className="text-sm font-bold text-slate-400">사진 조리 중 🍳</span>
                            </div>
                        )}
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

                <section className="px-6 py-6 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 tracking-tight">
                            <div className="bg-primary/10 p-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-primary text-base">inventory_2</span>
                            </div>
                            냉장고 식재료 매칭 결과
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {recipeDetail ? (
                            <div className="flex flex-col gap-3">
                                {recipeDetail.ingredientsUsed?.length > 0 && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter w-8">Main</span>
                                        <div className="flex flex-wrap gap-2 flex-1">
                                            {recipeDetail.ingredientsUsed.map((ing, idx) => (
                                                <div key={idx} className="px-3 py-1.5 rounded-xl text-[12px] font-black bg-white border border-slate-200 text-slate-700">
                                                    {ing}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {recipeDetail.saucesUsed?.length > 0 && (
                                    <div className="flex items-start gap-3 mt-2">
                                        <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter w-8">Sauce</span>
                                        <div className="flex flex-wrap gap-2 flex-1">
                                            {recipeDetail.saucesUsed.map((sauce, idx) => (
                                                <div key={`sauce-${idx}`} className="px-3 py-1.5 rounded-xl text-[12px] font-black bg-orange-50 border border-orange-100 text-orange-700">
                                                    {sauce}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 animate-pulse px-2 py-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-ping"></div>
                                <span className="text-sm text-slate-400 font-bold">인벤토리 분석 중...</span>
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-6 py-12">
                    <div className="flex flex-col items-center mb-10">
                        <div className="bg-primary/5 px-4 py-1.5 rounded-full mb-3">
                            <span className="text-[10px] font-black text-primary tracking-widest uppercase">Recipe Guide</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Chef's Masterclass</h3>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 min-h-[400px]">
                        {isLoading || !recipeDetail ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-4xl mb-6">
                                    🍳
                                </motion.div>
                                <p className="text-slate-400 font-bold animate-pulse text-sm">지니 쉪이 레시피를 집필 중입니다...</p>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {recipeDetail.steps && recipeDetail.steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-6 items-start group">
                                        <div className="size-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-black shrink-0 relative group-hover:bg-primary transition-colors">
                                            {idx + 1}
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-slate-700 font-bold leading-relaxed">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-6 py-10 bg-slate-50 border-t border-slate-100">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                        <h3 className="font-black text-slate-800 flex items-center gap-3 tracking-tight mb-8">
                            <div className="bg-primary/10 p-2 rounded-xl">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                            </div>
                            스마트 영양 레포트
                        </h3>
                        {recipeDetail?.nutrition && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="size-24 rounded-full bg-slate-100 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-2xl font-black">{String(recipeDetail.nutrition.calories).replace(/kcal/i, '').trim()}</span>
                                        <span className="text-[10px] text-slate-400 font-black">KCAL</span>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        {['carbs', 'protein', 'fat'].map(key => {
                                            const val = recipeDetail.nutrition[key];
                                            const label = key === 'carbs' ? '탄수화물' : key === 'protein' ? '단백질' : '지방';

                                            let percent = 0;
                                            if (typeof val === 'number') {
                                                percent = val;
                                            } else {
                                                const match = String(val).match(/\((\d+)%\)/);
                                                percent = match ? Number(match[1]) : (parseInt(val) || 0);
                                            }

                                            return (
                                                <div key={key} className="space-y-1.5">
                                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                                        <span>{label}</span>
                                                        <span className="text-primary">{val}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, percent)}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <div id="infographic-section" className="px-6 py-12 flex flex-col items-center border-t border-slate-100 pb-32">
                    <h4 className="text-2xl font-black text-slate-800 mb-8 tracking-tighter flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow-md">🎨</span>
                        지니 쉪의 한장 레시피
                    </h4>
                    {renderInfographicSection()}

                    {/* 히스토리 저장 버튼 영역 (인포그래픽이 생성된 이후에만 노출) */}
                    {!isGeneratingInfo && recipeDetail && (
                        <div className="mt-8 w-full max-w-sm">
                            <button
                                onClick={handleSaveHistory}
                                disabled={isSavingHistory}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isSavingHistory
                                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20 active:scale-95'
                                    }`}
                            >
                                <span className="material-symbols-outlined">
                                    {isSavingHistory ? 'hourglass_empty' : 'bookmark'}
                                </span>
                                {isSavingHistory ? '저장 중...' : '히스토리에 저장하기'}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] z-50">
                {isTimerActive ? (
                    <div className="w-full py-6 bg-slate-900/90 backdrop-blur-2xl border border-white/20 text-white font-black rounded-[2.5rem] flex items-center justify-between px-10">
                        <span className="text-5xl font-mono tracking-tighter text-amber-400">{formatTime(timeLeft)}</span>
                        <button onClick={() => setIsTimerActive(false)} className="bg-white/10 px-6 py-3 rounded-2xl font-black">Pause</button>
                    </div>
                ) : (
                    <button onClick={() => setIsTimerActive(true)} className="w-full py-6 bg-primary text-white font-black rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 transition-all text-xl">
                        <span className="material-symbols-outlined">play_arrow</span>
                        조리 시작하기
                    </button>
                )}
            </div>
        </div>
    );
};

export default Recipe;
