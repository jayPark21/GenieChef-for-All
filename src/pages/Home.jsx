import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialIngredients = [
  { id: 1, name: '계란', icon: '🥚', category: '냉장' },
  { id: 2, name: '두부', icon: '🧊', category: '냉장' },
  { id: 3, name: '햄/소시지', icon: '🥓', category: '냉장' },
  { id: 4, name: '우유', icon: '🥛', category: '냉장' },
  { id: 5, name: '대파', icon: '🥬', category: '냉장' },
  { id: 6, name: '양파', icon: '🧅', category: '냉장' },
  { id: 7, name: '당근', icon: '🥕', category: '냉장' },
  { id: 8, name: '김치', icon: '🌶️', category: '냉장' },
  { id: 9, name: '요거트', icon: '🍦', category: '냉장' },
  { id: 10, name: '냉동 만두', icon: '🥟', category: '냉동' },
  { id: 11, name: '냉동 채소', icon: '🥦', category: '냉동' },
  { id: 12, name: '간장', icon: '', category: '양념 및 소스' },
  { id: 13, name: '고추장', icon: '', category: '양념 및 소스' },
  { id: 14, name: '된장', icon: '', category: '양념 및 소스' },
  { id: 15, name: '다진마늘', icon: '', category: '양념 및 소스' },
  { id: 16, name: '소금', icon: '', category: '양념 및 소스' },
  { id: 17, name: '설탕', icon: '', category: '양념 및 소스' },
  { id: 18, name: '후추', icon: '', category: '양념 및 소스' },
  { id: 19, name: '식용유', icon: '', category: '양념 및 소스' },
  { id: 20, name: '참기름', icon: '', category: '양념 및 소스' },
  { id: 21, name: '케첩', icon: '', category: '양념 및 소스' },
  { id: 22, name: '마요네즈', icon: '', category: '양념 및 소스' },
];

const dietModes = [
  { id: '든든 한끼', icon: 'set_meal', color: 'text-primary' },
  { id: '간단식', icon: 'timer', color: 'text-amber-400' },
  { id: '야식', icon: 'dark_mode', color: 'text-indigo-400' },
  { id: '술안주', icon: 'liquor', color: 'text-rose-400' },
];

const Home = () => {
  const navigate = useNavigate();
  const [dietMode, setDietMode] = useState('든든한 한끼');
  const [selectedIngredients, setSelectedIngredients] = useState(
    initialIngredients.map(item => item.id)
  );
  const [recommendations, setRecommendations] = useState(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleIngredient = (id) => {
    setSelectedIngredients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleRecommend = () => {
    setIsLoading(true);
    setRecommendations(null);
    setSelectedRecipeId(null);

    // 모의 AI 추천 딜레이
    setTimeout(() => {
      const mockMeals = [
        {
          id: 1,
          title: '15분 완성 계란 두부 조림',
          desc: '선택하신 냉장고 재료를 활용해 따뜻하고 든든한 밥도둑을 만들어보세요.',
          img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk-jlvRf36zw9T3Z-W68qPBOErC2FAs45bXt9qgZtwfW2hLbhMjlZUS2wS1Lkta6wfjD2mZlIed4KT7VQ73054ELVw_bR45BNVn5C08dMPsJQvJx6oW3WIYOWQT__9wQ8L5OQV6G910LkEkYCsqbcQX8cW63CRCrhR8e31FnBYBrAHsksZR6p4zXu29LO703ohAo9bcbINYEGhzjpQpWhUpi9TKhDxS_rKOtCqdEb9uidGLAADiQ6TLXgmymDyCiGRwra1W5708HY',
        },
        {
          id: 2,
          title: '초간단 계란 마요 덮밥',
          desc: '마요네즈와 계란, 양파를 활용한 5분 컷 한끼 식사.',
          img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2626&auto=format&fit=crop',
        },
        {
          id: 3,
          title: '매콤달콤 소시지 야채 볶음',
          desc: '햄소시지, 양파, 당근에 케첩 고추장 소스를 곁들인 최고의 반찬.',
          img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=2672&auto=format&fit=crop',
        },
      ];
      // 1~3개의 식단 무작위로 추출
      const count = Math.floor(Math.random() * 3) + 1;
      setRecommendations(mockMeals.slice(0, count));
      setIsLoading(false);
    }, 1500);
  };

  const renderIngredientGroup = (categoryName, titleColorClass, dotColorClass) => {
    const items = initialIngredients.filter(item => item.category === categoryName);
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <p className={`text-xs font-bold ${titleColorClass} flex items-center gap-1.5 px-1 uppercase tracking-widest`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`}></span> {categoryName}
        </p>
        <div className="flex flex-wrap gap-2">
          {items.map(item => {
            const isSelected = selectedIngredients.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleIngredient(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer border ${isSelected
                  ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {item.icon && <span className="text-base">{item.icon}</span>}
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="font-display text-slate-900 min-h-screen flex flex-col bg-white">
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

      <main className="flex-1 overflow-y-auto pb-48">
        <section className="px-5 py-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">restaurant_menu</span>
            어떤 식단을 목표로 하시나요?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {dietModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setDietMode(mode.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${dietMode === mode.id
                  ? "bg-white border-primary shadow-sm shadow-primary/10"
                  : "bg-slate-50 border-transparent text-slate-500 opacity-70"
                  }`}
              >
                <span className={`material-symbols-outlined text-2xl ${dietMode === mode.id ? mode.color : 'text-slate-400'}`}>
                  {mode.icon}
                </span>
                <span className={`font-bold ${dietMode === mode.id ? 'text-slate-800' : 'text-slate-500'}`}>
                  {mode.id}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="px-5 py-4 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">kitchen</span>
                마이 냉장고 식재료
              </h2>
              <button onClick={() => navigate('/refrigerator')} className="text-xs font-semibold text-slate-400 flex items-center gap-1 py-1 px-2 bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined text-[14px]">edit</span>
                관리
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">info</span>
              요리에 사용할 식재료를 선택해주세요. (기본 전체 선택)
            </p>
          </div>

          {renderIngredientGroup('냉장', 'text-blue-500', 'bg-blue-500')}
          {renderIngredientGroup('냉동', 'text-cyan-500', 'bg-cyan-500')}
          {renderIngredientGroup('양념 및 소스', 'text-orange-500', 'bg-orange-500')}

        </section>

        {/* 식단 추천 버튼 */}
        <div className="px-5 py-4">
          <button
            onClick={handleRecommend}
            disabled={isLoading || selectedIngredients.length === 0}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${isLoading
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
              : selectedIngredients.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-primary text-white shadow-primary/30 active:scale-[0.98]'
              }`}
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin font-bold">sync</span>
                AI 식단 고민하는 중...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined font-bold">auto_awesome</span>
                선택한 식재료로 식단 추천받기
              </>
            )}
          </button>
        </div>

        {/* 추천 결과 영역 */}
        {recommendations && recommendations.length > 0 && (
          <section className="px-5 py-8 mt-4 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">🤖</div>
                <h2 className="text-lg font-bold text-slate-800">AI 맞춤 추천 식단</h2>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                {dietMode}
              </span>
            </div>

            <div className="space-y-4">
              {recommendations.map(meal => (
                <div
                  key={meal.id}
                  onClick={() => setSelectedRecipeId(meal.id)}
                  className={`cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${selectedRecipeId === meal.id
                    ? 'border-primary shadow-lg shadow-primary/20 bg-white ring-2 ring-primary/20'
                    : 'border-slate-200 bg-white shadow-sm hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-stretch h-28">
                    <div
                      className="w-1/3 bg-cover bg-center shrink-0 border-r border-slate-100"
                      style={{ backgroundImage: `url("${meal.img}")` }}
                    ></div>
                    <div className="p-4 flex flex-col justify-center flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{meal.title}</h3>
                        {selectedRecipeId === meal.id && (
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                        {meal.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </section>
        )}
      </main>

      {/* 액션 버튼 고정 영역 (레시피 이동) */}
      <div className="fixed bottom-24 left-0 right-0 px-5 pointer-events-none z-40">
        <button
          onClick={() => {
            if (selectedRecipeId) {
              navigate('/recipe');
            }
          }}
          disabled={!selectedRecipeId}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all pointer-events-auto shadow-2xl ${selectedRecipeId
            ? 'bg-slate-900 text-white active:scale-[0.98]'
            : 'bg-slate-200 text-slate-400 opacity-0 translate-y-4' // 숨김 처리 부드럽게
            }`}
          style={{
            opacity: selectedRecipeId ? 1 : 0,
            transform: selectedRecipeId ? 'translateY(0)' : 'translateY(1rem)'
          }}
        >
          <span className="material-symbols-outlined font-bold">chef_hat</span>
          레시피 바로보기
        </button>
      </div>

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
