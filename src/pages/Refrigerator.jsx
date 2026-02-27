import React from 'react';
import { useNavigate } from 'react-router-dom';

const Refrigerator = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-primary/10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-900">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold tracking-tight text-center flex-1 pr-6">냉장고 관리</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pb-48">
                <div className="mt-4">
                    <div onClick={() => navigate('/shopping-list')} className="cursor-pointer flex items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-orange-50/50 p-4 shadow-sm transition-transform active:scale-95">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500 text-xl font-bold">shopping_cart</span>
                                <p className="text-slate-900 text-base font-bold leading-tight">식재료 3개 부족</p>
                            </div>
                            <p className="text-slate-500 text-xs font-normal">부족한 재료를 터치해 쇼핑 리스트에 담으세요.</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </div>
                </div>

                <section className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">kitchen</span>
                            냉장 <span className="text-sm font-normal text-slate-400">(6)</span>
                        </h2>
                        <button className="text-primary">
                            <span className="material-symbols-outlined text-2xl">add_circle</span>
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full border border-primary/20 bg-white text-slate-900 px-4 shadow-sm">
                            <span className="material-symbols-outlined text-primary text-lg">egg</span>
                            <p className="text-sm font-medium">달걀</p>
                        </div>
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full border border-primary/20 bg-white text-slate-900 px-4 shadow-sm">
                            <span className="material-symbols-outlined text-primary text-lg">local_cafe</span>
                            <p className="text-sm font-medium">우유</p>
                        </div>
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full border border-primary/20 bg-white text-slate-900 px-4 shadow-sm">
                            <span className="material-symbols-outlined text-primary text-lg">set_meal</span>
                            <p className="text-sm font-medium">두부</p>
                        </div>
                        <button className="flex h-10 items-center justify-center gap-x-2 rounded-full border border-dashed border-slate-300 bg-slate-100 text-slate-400 px-4 active:scale-95 transition-transform group">
                            <span className="material-symbols-outlined text-lg">eco</span>
                            <p className="text-sm font-medium">샐러드 채소</p>
                        </button>
                        <button className="flex h-10 items-center justify-center gap-x-2 rounded-full border border-dashed border-slate-300 bg-slate-100 text-slate-400 px-4 active:scale-95 transition-transform">
                            <span className="material-symbols-outlined text-lg">restaurant</span>
                            <p className="text-sm font-medium">닭가슴살</p>
                        </button>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-400">ac_unit</span>
                            냉동 <span className="text-sm font-normal text-slate-400">(3)</span>
                        </h2>
                        <button className="text-primary">
                            <span className="material-symbols-outlined text-2xl">add_circle</span>
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full bg-white border border-blue-100 px-4 shadow-sm">
                            <span className="material-symbols-outlined text-blue-400 text-lg">lunch_dining</span>
                            <p className="text-sm font-medium">냉동 만두</p>
                        </div>
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full bg-white border border-blue-100 px-4 shadow-sm">
                            <span className="material-symbols-outlined text-blue-400 text-lg">icecream</span>
                            <p className="text-sm font-medium">아이스크림</p>
                        </div>
                        <button className="flex h-10 items-center justify-center gap-x-2 rounded-full border border-dashed border-slate-300 bg-slate-100 text-slate-400 px-4 active:scale-95 transition-transform">
                            <span className="material-symbols-outlined text-lg">flatware</span>
                            <p className="text-sm font-medium">볶음밥</p>
                        </button>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-400">liquor</span>
                            양념/소스 <span className="text-sm font-normal text-slate-400">(4)</span>
                        </h2>
                        <button className="text-primary">
                            <span className="material-symbols-outlined text-2xl">add_circle</span>
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full bg-white border border-orange-100 px-4 shadow-sm">
                            <span className="material-symbols-outlined text-orange-400 text-lg">opacity</span>
                            <p className="text-sm font-medium">진간장</p>
                        </div>
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full bg-white border border-orange-100 px-4 shadow-sm">
                            <span className="material-symbols-outlined text-orange-400 text-lg">oil_barrel</span>
                            <p className="text-sm font-medium">참기름</p>
                        </div>
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full bg-white border border-orange-100 px-4 shadow-sm">
                            <span className="material-symbols-outlined text-orange-400 text-lg">grain</span>
                            <p className="text-sm font-medium">설탕</p>
                        </div>
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full bg-white border border-orange-100 px-4 shadow-sm">
                            <span className="material-symbols-outlined text-orange-400 text-lg">science</span>
                            <p className="text-sm font-medium">올리브유</p>
                        </div>
                    </div>
                </section>

                <div className="mt-10 p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2 text-sm">
                        <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                        AI 식재료 팁
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        현재 <span className="font-bold text-primary">달걀</span>의 유통기한이 3일 남았습니다. 달걀말이나 스크램블 에그를 추천드려요!
                    </p>
                </div>
            </main>

            <div className="fixed bottom-24 left-0 w-full px-6 pointer-events-none">
                <button onClick={() => navigate('/shopping-list')} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl pointer-events-auto active:scale-[0.97] transition-all">
                    <span className="material-symbols-outlined">receipt_long</span>
                    쇼핑 리스트 생성하기
                </button>
            </div>

            <nav className="fixed bottom-0 w-full bg-white border-t border-slate-100 px-4 pb-8 pt-2 flex justify-around items-center z-50">
                <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">home</span>
                    <p className="text-[10px] font-medium">홈</p>
                </button>
                <button onClick={() => navigate('/refrigerator')} className="flex flex-col items-center gap-1 text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>kitchen</span>
                    <p className="text-[10px] font-bold">냉장고</p>
                </button>
                <button onClick={() => navigate('/shopping-list')} className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">shopping_basket</span>
                    <p className="text-[10px] font-medium">쇼핑</p>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">person</span>
                    <p className="text-[10px] font-medium">내 정보</p>
                </button>
            </nav>
        </div>
    );
};

export default Refrigerator;
