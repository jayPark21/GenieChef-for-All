import React from 'react';
import { useNavigate } from 'react-router-dom';

const ShoppingList = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-primary/10">
                <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold tracking-tight">식재료 쇼핑 리스트</h1>
                <button className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="p-4">
                    <div className="relative overflow-hidden rounded-xl h-48 flex flex-col justify-end p-6 bg-primary/20" style={{ backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent), url("https://lh3.googleusercontent.com/aida-public/AB6AXuD1cgmLAgLUa5TyBqC8sVvIYFeLmCIwfS0vO2lQsxUAnpRcKvgb8k62nhApPZRHVO2y23WhsbmWSZ7Oicn6Vx3u8mH9iuZQASor_4Fmr9M5FEEHSsdOpCIlTZttJhqAeGnOZnsZ-POga89pkCq6Ki2U61Iqp4eGcFZYp8arTfb3T2xuRVqUwodZSM5UUz9BNM3C1pTh97URcxmLwlt_J7WaofCGZ67tcrdfUupJHF9_-EbcBAJgGDX3ijoxDhfiXVaQxmWZdi1qrEs")', backgroundSize: 'cover', backgroundPosition: 'center center' }}>
                        <h2 className="text-white text-2xl font-bold leading-tight">다음 요리를 위해<br />부족한 재료들이에요!</h2>
                    </div>
                </div>

                <div className="px-4 mb-6">
                    <div className="flex gap-2 p-1 bg-white rounded-full shadow-sm border border-primary/5">
                        <button className="flex-1 py-2 px-4 bg-primary text-white rounded-full font-semibold text-sm transition-all">식재료</button>
                        <button className="flex-1 py-2 px-4 text-slate-500 font-semibold text-sm hover:bg-primary/5 rounded-full transition-all">냉동</button>
                        <button className="flex-1 py-2 px-4 text-slate-500 font-semibold text-sm hover:bg-primary/5 rounded-full transition-all">양념/소스</button>
                    </div>
                </div>

                <div className="px-4 space-y-4 pb-32">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider ml-1">신선 식품</h3>

                    <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-primary/5">
                        <div className="flex items-center justify-center">
                            <input className="size-6 rounded border-primary/30 text-primary focus:ring-primary bg-slate-50" type="checkbox" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-slate-900">신선 시금치</p>
                            <p className="text-xs text-slate-500">파스타 필수 재료</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-full p-1 border border-slate-100">
                            <button className="size-7 flex items-center justify-center rounded-full bg-white shadow-sm text-primary border border-slate-200">
                                <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="text-sm font-bold w-4 text-center">2</span>
                            <button className="size-7 flex items-center justify-center rounded-full bg-primary shadow-sm text-white border border-primary">
                                <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-primary/5">
                        <div className="flex items-center justify-center">
                            <input className="size-6 rounded border-primary/30 text-primary focus:ring-primary bg-slate-50" type="checkbox" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-slate-900">방울토마토</p>
                            <p className="text-xs text-slate-500">1팩 (250g)</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-full p-1 border border-slate-100">
                            <button className="size-7 flex items-center justify-center rounded-full bg-white shadow-sm text-primary border border-slate-200">
                                <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="text-sm font-bold w-4 text-center">1</span>
                            <button className="size-7 flex items-center justify-center rounded-full bg-primary shadow-sm text-white border border-primary">
                                <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-primary/5 opacity-60">
                        <div className="flex items-center justify-center">
                            <input defaultChecked className="size-6 rounded border-primary/30 text-primary focus:ring-primary bg-slate-50" type="checkbox" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-slate-900 line-through">우유 (1L)</p>
                            <p className="text-xs text-slate-500">1팩</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-full p-1 border border-slate-100">
                            <button className="size-7 flex items-center justify-center rounded-full bg-white shadow-sm text-primary border border-slate-200">
                                <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="text-sm font-bold w-4 text-center">1</span>
                            <button className="size-7 flex items-center justify-center rounded-full bg-primary shadow-sm text-white border border-primary">
                                <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider ml-1 mt-6">양념 및 기타</h3>

                    <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-primary/5">
                        <div className="flex items-center justify-center">
                            <input className="size-6 rounded border-primary/30 text-primary focus:ring-primary bg-slate-50" type="checkbox" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-slate-900">올리브유</p>
                            <p className="text-xs text-slate-500">엑스트라 버진</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-full p-1 border border-slate-100">
                            <button className="size-7 flex items-center justify-center rounded-full bg-white shadow-sm text-primary border border-slate-200">
                                <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="text-sm font-bold w-4 text-center">1</span>
                            <button className="size-7 flex items-center justify-center rounded-full bg-primary shadow-sm text-white border border-primary">
                                <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <div className="fixed bottom-24 left-0 w-full px-6 z-20 pointer-events-none">
                <div className="flex gap-3 pointer-events-auto">
                    <button className="flex-1 h-14 bg-white border-2 border-primary/20 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg text-primary active:scale-[0.97] transition-all">
                        <span className="material-symbols-outlined">content_copy</span>
                        복사하기
                    </button>
                    <button className="flex-[2] h-14 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/30 active:scale-[0.97] transition-all">
                        <span className="material-symbols-outlined">shopping_cart_checkout</span>
                        마트로 전송
                    </button>
                </div>
            </div>

            <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 pb-8 pt-2 flex justify-around items-center z-50">
                <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">home</span>
                    <p className="text-[10px] font-medium">홈</p>
                </button>
                <button onClick={() => navigate('/refrigerator')} className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">kitchen</span>
                    <p className="text-[10px] font-medium">냉장고</p>
                </button>
                <button onClick={() => navigate('/shopping-list')} className="flex flex-col items-center gap-1 text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_basket</span>
                    <p className="text-[10px] font-bold">쇼핑</p>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">person</span>
                    <p className="text-[10px] font-medium">내 정보</p>
                </button>
            </nav>
        </div>
    );
};

export default ShoppingList;
