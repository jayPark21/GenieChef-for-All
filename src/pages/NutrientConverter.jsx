import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getNutrientInfo } from '../aiService';

const NutrientConverter = () => {
    const navigate = useNavigate();
    const [ingredient, setIngredient] = useState('');
    const [amount, setAmount] = useState('100');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleConvert = async (e) => {
        e.preventDefault();
        if (!ingredient || !amount) return;

        setIsLoading(true);
        setResult(null);
        try {
            const data = await getNutrientInfo(ingredient, amount);
            setResult(data);
        } catch (error) {
            alert("영양 정보를 가져오는 중 오류가 발생했습니다. 🫡");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="font-display text-slate-900 min-h-screen flex flex-col bg-white">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                    </button>
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 leading-none mb-1 uppercase tracking-wider">Kitchen Tools</p>
                        <h1 className="text-base font-bold text-slate-800">영양소 환산기</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-48 px-5 py-6">
                <section className="mb-8">
                    <div className="bg-gradient-to-br from-primary/10 to-blue-50 p-6 rounded-3xl border border-primary/10 relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-lg font-black text-slate-800 mb-1">식재료 영양 계산기 🧮</h2>
                            <p className="text-sm text-slate-500 font-medium">재료 이름과 무게를 입력하면<br />탄단지 비율을 즉시 계산해 드립니다!</p>
                        </div>
                        <span className="absolute -right-4 -bottom-4 material-symbols-outlined text-8xl text-primary/5 select-none pointer-events-none">calculate</span>
                    </div>
                </section>

                <form onSubmit={handleConvert} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 ml-1">식재료 이름</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="예: 햇반, 닭가슴살, 우유 등"
                                value={ingredient}
                                onChange={(e) => setIngredient(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold focus:border-primary focus:bg-white outline-none transition-all pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300">restaurant</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 ml-1">중량 (g 또는 ml)</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="100"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold focus:border-primary focus:bg-white outline-none transition-all pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">g</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !ingredient || !amount}
                        className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isLoading
                                ? 'bg-slate-200 text-slate-400'
                                : 'bg-slate-900 text-white shadow-slate-200'
                            }`}
                    >
                        {isLoading ? (
                            <div className="size-6 rounded-full border-3 border-white/30 border-t-white animate-spin"></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">analytics</span>
                                지금 영양소 확인하기
                            </>
                        )}
                    </button>
                </form>

                <AnimatePresence>
                    {result && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-10 space-y-6"
                        >
                            <div className="flex items-center justify-between px-1">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                                    분석 결과
                                </h3>
                                <span className="text-xs font-bold text-slate-400">{result.ingredient} {result.amount}g 기준</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
                                    <p className="text-[10px] font-bold text-amber-500 uppercase mb-1">Carbs</p>
                                    <p className="text-xl font-black text-amber-600">{result.carbs}<span className="text-[10px] ml-0.5">g</span></p>
                                </div>
                                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
                                    <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Protein</p>
                                    <p className="text-xl font-black text-blue-600">{result.protein}<span className="text-[10px] ml-0.5">g</span></p>
                                </div>
                                <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 text-center">
                                    <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">Fat</p>
                                    <p className="text-xl font-black text-rose-600">{result.fat}<span className="text-[10px] ml-0.5">g</span></p>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Calories</p>
                                    <p className="text-3xl font-black">{result.calories}<span className="text-sm ml-1 font-bold text-slate-400">kcal</span></p>
                                </div>
                                <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl">bolt</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[11px] text-slate-400 font-bold mb-2">💡 땡칠이 팀장의 지식 한스푼</p>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    {result.ingredient}은(는) {result.carbs > result.protein ? '탄수화물' : '단백질'} 함량이 높은 편이네요! 대표님의 오늘 식단 목표에 맞춰 중량을 조절해 보세요. 🫡
                                </p>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 pt-3 pb-8">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined">home</span>
                        <p className="text-[10px] font-medium">추천식단</p>
                    </button>
                    <button onClick={() => navigate('/refrigerator')} className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined">kitchen</span>
                        <p className="text-[10px] font-medium">냉장고</p>
                    </button>
                    <button onClick={() => navigate('/shopping-list')} className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined">shopping_basket</span>
                        <p className="text-[10px] font-medium">쇼핑</p>
                    </button>
                    <button onClick={() => navigate('/history')} className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined">history</span>
                        <p className="text-[10px] font-medium">히스토리</p>
                    </button>
                    <button onClick={() => navigate('/nutrient-converter')} className="flex flex-col items-center gap-1 text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
                        <p className="text-[10px] font-bold">영양소환산</p>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default NutrientConverter;
