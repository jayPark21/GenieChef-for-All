import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="font-display text-slate-900 min-h-screen flex flex-col pb-24">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden border-2 border-primary/30">
            <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwwHUaIvM1TqTIYKKCd9wJSMao2ojAqyZWJH4DiUJH989IRh1BanwX5koQ3vv9VcA0iD-oj3oBn5N-Zb1b_u9kU3XQK43_k6dU-sspps5ROoMkx5dX1KYp_bYmzTeSRFv8AQqls-6TKeDiUda5SYJb6ydEzXXT1bVklf-XgTcUYQSKYWu8XlVdiMRcsZodq6K-SjOIoN4BVHQjIz65g8Izoy8Z0OJ4oAxUo2R89aJyEE8TUHP5PB8CAGS2bTNJnae4CkDaQBcH398" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 leading-none mb-1 uppercase tracking-wider">My Kitchen</p>
            <h1 className="text-base font-bold text-slate-800">제이미님의 주방</h1>
          </div>
        </div>
        <button className="size-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
          <span className="material-symbols-outlined text-slate-600">notifications</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <section className="px-5 py-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">restaurant_menu</span>
            오늘 어떤 식사를 할까요?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-primary shadow-sm shadow-primary/10">
              <span className="material-symbols-outlined text-primary text-2xl">set_meal</span>
              <span className="font-bold text-slate-800">든든한 한끼</span>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100">
              <span className="material-symbols-outlined text-amber-400 text-2xl">timer</span>
              <span className="font-bold text-slate-600">간단식</span>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100">
              <span className="material-symbols-outlined text-indigo-400 text-2xl">dark_mode</span>
              <span className="font-bold text-slate-600">야식</span>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100">
              <span className="material-symbols-outlined text-rose-400 text-2xl">liquor</span>
              <span className="font-bold text-slate-600">술안주</span>
            </button>
          </div>
        </section>

        <section className="px-5 py-4 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">kitchen</span>
                마이 냉장고
              </h2>
              <button onClick={() => navigate('/refrigerator')} className="text-xs font-semibold text-slate-400 flex items-center gap-1 py-1 px-2 bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined text-[14px]">sync</span>
                동기화됨
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">info</span>
              '냉장고' 탭의 식재료가 자동으로 반영됩니다. 요리할 재료를 선택하세요.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-blue-500 flex items-center gap-1.5 px-1 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 냉장
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="ingredient-tag bg-white border-slate-200 selected">
                <span className="text-base">🥚</span> <span className="text-sm font-medium">계란</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200 selected">
                <span className="text-base">🧊</span> <span className="text-sm font-medium">두부</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-base">🥓</span> <span className="text-sm font-medium">햄/소시지</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-base">🥛</span> <span className="text-sm font-medium">우유</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200 selected">
                <span className="text-base">🥬</span> <span className="text-sm font-medium">대파</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-base">🧅</span> <span className="text-sm font-medium">양파</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-base">🥕</span> <span className="text-sm font-medium">당근</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-base">🌶️</span> <span className="text-sm font-medium">김치</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-base">🍦</span> <span className="text-sm font-medium">요거트</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-cyan-500 flex items-center gap-1.5 px-1 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> 냉동
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-base">🥟</span> <span className="text-sm font-medium">냉동 만두</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-base">🥦</span> <span className="text-sm font-medium">냉동 채소</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-orange-500 flex items-center gap-1.5 px-1 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> 양념 및 소스
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-sm font-medium">간장</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-sm font-medium">고추장</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-sm font-medium">된장</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-sm font-medium">다진마늘</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-sm font-medium">소금</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-sm font-medium">설탕</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-sm font-medium">후추</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-sm font-medium">식용유</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-sm font-medium">참기름</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-sm font-medium">케첩</span>
              </div>
              <div className="ingredient-tag bg-white border-slate-200">
                <span className="text-sm font-medium">마요네즈</span>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button onClick={() => navigate('/refrigerator')} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm font-medium bg-slate-50/50">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              재료 편집은 '냉장고' 탭에서 가능합니다
            </button>
          </div>
        </section>

        <section className="px-5 py-8 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-1">
              <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">🤖</div>
            </div>
            <h2 className="text-lg font-bold">AI가 추천하는 오늘의 메뉴</h2>
          </div>

          <div onClick={() => navigate('/recipe')} className="cursor-pointer relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 group">
            <div className="aspect-[16/10] w-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCk-jlvRf36zw9T3Z-W68qPBOErC2FAs45bXt9qgZtwfW2hLbhMjlZUS2wS1Lkta6wfjD2mZlIed4KT7VQ73054ELVw_bR45BNVn5C08dMPsJQvJx6oW3WIYOWQT__9wQ8L5OQV6G910LkEkYCsqbcQX8cW63CRCrhR8e31FnBYBrAHsksZR6p4zXu29LO703ohAo9bcbINYEGhzjpQpWhUpi9TKhDxS_rKOtCqdEb9uidGLAADiQ6TLXgmymDyCiGRwra1W5708HY")' }}></div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md border border-primary/20">든든한 한끼 맞춤</span>
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">식재료 7개 활용</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">백종원표 계란 두부 조림</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                냉장고에 있는 <span className="text-slate-800 font-bold">계란</span>, <span className="text-slate-800 font-bold">두부</span>, <span className="text-slate-800 font-bold">대파</span>를 활용해 따뜻하고 든든한 밥도둑을 만들어보세요.
              </p>
              <button onClick={(e) => { e.stopPropagation(); navigate('/recipe'); }} className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all">
                <span className="material-symbols-outlined font-bold">chef_hat</span>
                레시피 바로보기
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <div className="size-12 rounded-xl bg-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-200">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600">이 메뉴로 식비 절약!</p>
              <p className="text-sm font-medium text-slate-700">외식 대비 약 <span className="font-bold text-slate-900 underline decoration-amber-300">12,000원</span>을 아낄 수 있어요.</p>
            </div>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 pt-3 pb-8">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <p className="text-[10px] font-bold">홈</p>
          </button>
          <button onClick={() => navigate('/refrigerator')} className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined">kitchen</span>
            <p className="text-[10px] font-medium">냉장고</p>
          </button>
          <button onClick={() => navigate('/shopping-list')} className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined">shopping_basket</span>
            <p className="text-[10px] font-medium">쇼핑</p>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined">person</span>
            <p className="text-[10px] font-medium">내 정보</p>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Home;
