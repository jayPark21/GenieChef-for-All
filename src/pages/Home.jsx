import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { recommendRecipes, generateRecipeImage } from '../aiService';
import { initialIngredients } from '../data/ingredients';
import { useAuth } from '../contexts/AuthContext';

const dietModes = [
  { id: '든든 한끼', icon: 'set_meal', color: 'text-primary' },
  { id: '간단식', icon: 'timer', color: 'text-amber-400' },
  { id: '야식', icon: 'dark_mode', color: 'text-indigo-400' },
  { id: '술안주', icon: 'liquor', color: 'text-rose-400' },
];

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dietMode, setDietMode] = useState('든든 한끼');
  const [dietGoal, setDietGoal] = useState(() => localStorage.getItem('dietGoal') || '');
  const [ownedIngredients, setOwnedIngredients] = useState([]);
  const [customIngredients, setCustomIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const skipSaveRef = useRef(true);

  // Firestore 사용자 문서 참조
  const userRef = doc(db, 'users', currentUser?.uid || 'guest_user');

  // 첫 마운트 시 Firestore에서 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedStr = localStorage.getItem('geniechef_user_data');
        const now = Date.now();
        let needsDbSync = true;

        // 1. 로컬 캐시 우선 렌더링
        if (cachedStr) {
          const data = JSON.parse(cachedStr);
          if (data.dietMode) setDietMode(data.dietMode);
          if (data.dietGoal) setDietGoal(data.dietGoal);

          let currentOwned = initialIngredients.map(item => item.id);
          if (data.ownedIngredients) currentOwned = data.ownedIngredients;
          setOwnedIngredients(currentOwned);

          if (data.customIngredients) setCustomIngredients(data.customIngredients);

          if (data.selectedIngredients) {
            setSelectedIngredients(data.selectedIngredients.filter(id => currentOwned.includes(id)));
          } else {
            setSelectedIngredients(currentOwned);
          }

          setIsInitializing(false);

          // 2. 동기화 필요 여부 판단 (하루 1회 동기화)
          const lastSync = data.lastSyncTime || 0;
          if (now - lastSync < 24 * 60 * 60 * 1000) {
            needsDbSync = false;
          }
        }

        // 3. 백그라운드 DB 동기화
        if (needsDbSync) {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.dietMode) setDietMode(data.dietMode);
            if (data.dietGoal) setDietGoal(data.dietGoal);

            let currentOwned = initialIngredients.map(item => item.id);
            if (data.ownedIngredients) currentOwned = data.ownedIngredients;
            setOwnedIngredients(currentOwned);

            if (data.customIngredients) setCustomIngredients(data.customIngredients);

            if (data.selectedIngredients) {
              setSelectedIngredients(data.selectedIngredients.filter(id => currentOwned.includes(id)));
            } else {
              setSelectedIngredients(currentOwned);
            }

            // 로컬 스토리지 갱신
            localStorage.setItem('geniechef_user_data', JSON.stringify({
              ...data,
              ownedIngredients: currentOwned,
              lastSyncTime: now
            }));
          } else {
            // 문서 완전 없음 기본값
            const allIds = initialIngredients.map(item => item.id);
            setOwnedIngredients(allIds);
            setSelectedIngredients(allIds);
            localStorage.setItem('geniechef_user_data', JSON.stringify({
              dietMode: '든든 한끼',
              ownedIngredients: allIds,
              customIngredients: [],
              selectedIngredients: allIds,
              lastSyncTime: now
            }));
          }
        }
      } catch (error) {
        console.error("Firestore 로드 에러:", error);
        if (!localStorage.getItem('geniechef_user_data')) {
          const allIds = initialIngredients.map(item => item.id);
          setOwnedIngredients(allIds);
          setSelectedIngredients(allIds);
        }
      } finally {
        setIsInitializing(false);
      }
    };
    fetchData();
  }, []);

  // 상태가 변경될 때마다 캐시에 저장 & Firestore에 저장
  useEffect(() => {
    if (isInitializing) return;
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }

    const saveData = async () => {
      // 1. 로컬 스토리지 즉시 갱신
      const cachedStr = localStorage.getItem('geniechef_user_data');
      const cachedData = cachedStr ? JSON.parse(cachedStr) : {};
      const newData = {
        ...cachedData,
        dietMode,
        dietGoal,
        selectedIngredients,
        ownedIngredients,
        customIngredients,
        lastSyncTime: Date.now()
      };
      localStorage.setItem('geniechef_user_data', JSON.stringify(newData));

      // 2. DB 저장
      try {
        await setDoc(userRef, {
          dietMode,
          dietGoal,
          selectedIngredients,
          ownedIngredients,
          customIngredients,
          updatedAt: new Date()
        }, { merge: true });
      } catch (error) {
        if (error.code === 'unavailable' || error.message.includes('offline')) {
          console.warn("Firestore 저장 실패 (오프라인 상테): 로컬 모드로 동작합니다. 🫡");
        } else {
          console.error("Firestore 저장 에러:", error);
        }
      }
    };
    saveData();
  }, [dietMode, dietGoal, selectedIngredients, ownedIngredients, customIngredients, isInitializing]);

  const toggleIngredient = (id) => {
    setSelectedIngredients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const allIngredients = [...initialIngredients, ...customIngredients];

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.dietMode) setDietMode(data.dietMode);
        if (data.dietGoal) setDietGoal(data.dietGoal);

        let currentOwned = initialIngredients.map(item => item.id);
        if (data.ownedIngredients) currentOwned = data.ownedIngredients;
        setOwnedIngredients(currentOwned);

        if (data.customIngredients) setCustomIngredients(data.customIngredients);

        if (data.selectedIngredients) {
          setSelectedIngredients(data.selectedIngredients.filter(id => currentOwned.includes(id)));
        } else {
          setSelectedIngredients(currentOwned);
        }

        const cachedStr = localStorage.getItem('geniechef_user_data');
        const cachedData = cachedStr ? JSON.parse(cachedStr) : {};
        localStorage.setItem('geniechef_user_data', JSON.stringify({
          ...cachedData,
          ...data,
          ownedIngredients: currentOwned,
          lastSyncTime: Date.now()
        }));
      }
    } catch (error) {
      console.error("Firestore 동기화 에러:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRecommend = async () => {
    setIsLoading(true);
    setRecommendations(null);
    setSelectedRecipeId(null);

    try {
      const ingredientNames = selectedIngredients.map(
        id => allIngredients.find(item => item.id === id)?.name
      ).filter(Boolean);

      const recipes = await recommendRecipes(ingredientNames, dietMode, dietGoal);
      setRecommendations(recipes);

      // [땡칠이 팀장 스마트 로딩] 텍스트가 뜨면 메뉴별 사진은 백그라운드에서 실시간 생성합니다! ⚡️
      recipes.forEach((recipe, index) => {
        generateRecipeImage(recipe.title).then(img => {
          if (img) {
            setRecommendations(prev => {
              if (!prev) return prev;
              const next = [...prev];
              next[index] = { ...next[index], img };
              return next;
            });
          }
        });
      });

    } catch (error) {
      alert("AI 레시피 생성 중 오류가 발생했습니다. (API 키를 확인해주세요)\n" + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderIngredientGroup = (categoryName, titleColorClass, dotColorClass) => {
    // 필터링: ownedIngredients에 있는 항목들만 렌더링
    const items = allIngredients.filter(item => item.category === categoryName && ownedIngredients.includes(item.id));
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
            {currentUser?.photoURL ? (
              <img alt="Profile" className="w-full h-full object-cover" src={currentUser.photoURL} />
            ) : (
              <span className="material-symbols-outlined text-2xl">person</span>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 leading-none mb-1 uppercase tracking-wider">My Kitchen</p>
            <h1 className="text-base font-bold text-slate-800">{currentUser?.displayName ? `${currentUser.displayName}님의 주방` : '게스트님의 주방'}</h1>
          </div>
        </div>
        <button className="size-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
          <span className="material-symbols-outlined text-slate-600">notifications</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-48">
        <section className="px-5 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">restaurant_menu</span>
              어떤 스타일의 식사를 원하시나요?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
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
          <button onClick={() => navigate('/guide')} className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${dietGoal ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
            <span className="material-symbols-outlined text-lg">{dietGoal ? 'flag' : 'lightbulb'}</span>
            {dietGoal ? `현재 목표: ${dietGoal} (변경하기)` : '나에게 맞는 최적의 탄단지 비율 찾기'}
          </button>
        </section>

        <section className="px-5 py-4 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">kitchen</span>
                내 냉장고 식재료 ({ownedIngredients.length})
              </h2>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="text-xs font-semibold text-slate-400 flex items-center gap-1 py-1 px-2 bg-slate-100 rounded-lg transition-transform active:scale-95"
              >
                <span className={`material-symbols-outlined text-[14px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                {isSyncing ? '동기화 중...' : '식재료 확인'}
              </button>
            </div>
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
              <div className="flex items-center gap-3">
                <div className="relative size-8 rounded-full bg-white/20 flex items-center justify-center text-xl shadow-sm border border-slate-300">
                  <span className="animate-bounce block">👨‍🍳</span>
                  <span className="absolute top-0 right-0 -mr-2 -mt-1 material-symbols-outlined text-amber-200 text-sm animate-ping">emoji_objects</span>
                </div>
                <span>지니 쉪이 식단 고민 중...</span>
              </div>
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
                <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">👨‍🍳</div>
                <h2 className="text-lg font-bold text-slate-800">지니 쉪 맞춤 추천 식단</h2>
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
                  <div className="flex items-stretch h-28 relative">
                    {meal.img ? (
                      <div
                        className="w-1/3 bg-cover bg-center shrink-0 border-r border-slate-100 transition-opacity duration-500"
                        style={{ backgroundImage: `url("${meal.img}")` }}
                      ></div>
                    ) : (
                      <div className="w-1/3 bg-slate-100 shrink-0 border-r border-slate-200 flex flex-col items-center justify-center gap-2">
                        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        <span className="text-[10px] font-bold text-slate-400">조리 중...</span>
                      </div>
                    )}
                    <div className="p-4 flex flex-col justify-center flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{meal.title}</h3>
                        {selectedRecipeId === meal.id && (
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-1.5">
                        {meal.desc}
                      </p>
                      {meal.calories && (
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{meal.calories}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="font-medium text-slate-600">탄</span> {meal.carbs}
                            <span className="w-0.5 h-2 bg-slate-200"></span>
                            <span className="font-medium text-blue-600">단</span> {meal.protein}
                            <span className="w-0.5 h-2 bg-slate-200"></span>
                            <span className="font-medium text-rose-500">지</span> {meal.fat}
                          </div>
                        </div>
                      )}
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
              const selectedRecipe = recommendations.find(r => r.id === selectedRecipeId);
              const ingredientNames = selectedIngredients.map(
                id => allIngredients.find(item => item.id === id)?.name
              ).filter(Boolean);

              navigate('/recipe', {
                state: {
                  recipe: selectedRecipe,
                  ingredients: ingredientNames,
                  dietMode,
                  dietGoal
                }
              });
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
            <p className="text-[10px] font-bold">추천식단</p>
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
          <button onClick={() => navigate('/nutrient-converter')} className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined">calculate</span>
            <p className="text-[10px] font-medium">영양소환산</p>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Home;
