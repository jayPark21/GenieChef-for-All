import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { specialMeals } from '../data/specialMeals';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ShoppingList = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // 상태 관리
    const [shoppingItems, setShoppingItems] = useState([]);
    const [isInitializing, setIsInitializing] = useState(true);
    const skipSaveRef = useRef(true);

    const [activeTab, setActiveTab] = useState('전체');
    const [selectedSpecialMeal, setSelectedSpecialMeal] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [mealIngredientsCheck, setMealIngredientsCheck] = useState({});

    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('냉장');

    const userRef = doc(db, 'users', currentUser?.uid || 'guest_user');

    // Firestore 데이터 로드
    useEffect(() => {
        const fetchShoppingList = async () => {
            try {
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.shoppingList) {
                        setShoppingItems(data.shoppingList);
                    }
                }
            } catch (error) {
                console.error("쇼핑리스트 로드 에러:", error);
            } finally {
                setIsInitializing(false);
            }
        };
        fetchShoppingList();
    }, [userRef]);

    // Firestore 데이터 저장 (자동 동기화)
    useEffect(() => {
        if (isInitializing) return;
        if (skipSaveRef.current) {
            skipSaveRef.current = false;
            return;
        }
        const saveShoppingList = async () => {
            try {
                await setDoc(userRef, { shoppingList: shoppingItems }, { merge: true });
            } catch (error) {
                console.warn("쇼핑리스트 저장 실패:", error);
            }
        };
        saveShoppingList();
    }, [shoppingItems, isInitializing, userRef]);

    // 수동 식재료 추가 핸들러
    const addManualItem = (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        const newItem = {
            id: `manual_${Date.now()}`,
            name: newItemName.trim(),
            category: newItemCategory,
            amount: 1,
            checked: false
        };

        setShoppingItems(prev => [newItem, ...prev]);
        setNewItemName('');
    };

    // 수량 조절 핸들러 (0이 되면 삭제)
    const updateAmount = (id, delta) => {
        setShoppingItems(prev => prev.map(item => {
            if (item.id === id) {
                const newAmount = Math.max(0, item.amount + delta);
                if (newAmount === 0) return null;
                return { ...item, amount: newAmount };
            }
            return item;
        }).filter(Boolean));
    };

    // 체크박스 토글
    const toggleCheck = (id) => {
        setShoppingItems(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    // 특별식 시트 열기
    const openSpecialMealSheet = (meal) => {
        setSelectedSpecialMeal(meal);
        const initialChecks = {};
        meal.defaultIngredients.forEach(ing => {
            initialChecks[ing.name] = true; // 기본적으로 모두 체크
        });
        setMealIngredientsCheck(initialChecks);
        setIsSheetOpen(true);
    };

    // 특별식 재료를 쇼핑리스트에 일괄 추가
    const addSpecialIngredientsToList = () => {
        if (!selectedSpecialMeal) return;

        const newItems = selectedSpecialMeal.defaultIngredients
            .filter(ing => mealIngredientsCheck[ing.name])
            .map(ing => ({
                id: `sp_add_${Date.now()}_${ing.name}`,
                name: ing.name,
                category: ing.category,
                amount: ing.amount,
                checked: false
            }));

        // 기존 아이템 목록과 병합 (이름이 같은 건 수량 증가 로직도 가능하지만 일단 단순 추가)
        setShoppingItems(prev => [...newItems, ...prev]);
        setIsSheetOpen(false);
    };

    // 필터링된 아이템
    const filteredItems = activeTab === '전체'
        ? shoppingItems
        : shoppingItems.filter(item => item.category === activeTab);

    // 구역별 그룹핑
    const categories = [...new Set(filteredItems.map(item => item.category))];

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-primary/10">
                <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold tracking-tight">쇼핑 리스트</h1>
                <button className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto pb-32">
                {/* 특별식 추가 섹션 */}
                <div className="pt-6 pb-2">
                    <div className="px-4 mb-3 flex items-center justify-between">
                        <h2 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <span className="text-xl">🍝</span> 특별식 고민 중이신가요?
                        </h2>
                    </div>

                    <div className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x hide-scrollbar">
                        {specialMeals.map(meal => (
                            <div
                                key={meal.id}
                                onClick={() => openSpecialMealSheet(meal)}
                                className="snap-start shrink-0 w-36 h-40 rounded-2xl relative overflow-hidden shadow-lg border border-slate-100 flex flex-col justify-end p-3 active:scale-95 transition-transform"
                            >
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${meal.image})` }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="relative z-10">
                                    <p className="text-white font-black text-sm">{meal.name}</p>
                                    <p className="text-white/80 font-bold text-[10px] mt-0.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px] text-primary">add_circle</span> 담기
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 탭 필터 */}
                <div className="px-4 mb-6 sticky top-[72px] z-10 py-2 bg-slate-50/90 backdrop-blur-md">
                    <div className="flex gap-2 p-1 bg-white rounded-full shadow-sm border border-slate-200 hide-scrollbar overflow-x-auto">
                        {['전체', '냉장', '냉동', '상온', '양념 및 소스'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`shrink-0 py-2 px-4 rounded-full font-bold text-xs transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 수동 식재료 추가 폼 */}
                <div className="px-4 mb-6">
                    <form onSubmit={addManualItem} className="flex items-center gap-2">
                        <select
                            value={newItemCategory}
                            onChange={(e) => setNewItemCategory(e.target.value)}
                            className="h-12 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-primary shrink-0"
                        >
                            <option value="냉장">냉장</option>
                            <option value="냉동">냉동</option>
                            <option value="상온">상온</option>
                            <option value="양념 및 소스">양념/소스</option>
                        </select>
                        <input
                            type="text"
                            placeholder="추가할 품목 (예: 우유)"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="h-12 flex-1 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-primary"
                        />
                        <button type="submit" className="h-12 w-12 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform shrink-0">
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </form>
                </div>

                {/* 쇼핑 아이템 리스트 */}
                <div className="px-4 space-y-6">
                    {categories.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center opacity-50">
                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-400">shopping_basket</span>
                            <p className="font-bold text-slate-500">리스트가 텅 비었어요!</p>
                        </div>
                    ) : (
                        categories.map(category => (
                            <div key={category}>
                                <h3 className="text-xs font-black text-primary uppercase tracking-wider ml-1 mb-3">{category}</h3>
                                <div className="space-y-3">
                                    {filteredItems.filter(i => i.category === category).map(item => (
                                        <div key={item.id} className={`bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border ${item.checked ? 'border-slate-200 opacity-60' : 'border-primary/10'}`}>
                                            <div className="flex items-center justify-center">
                                                <input
                                                    checked={item.checked}
                                                    onChange={() => toggleCheck(item.id)}
                                                    className="size-6 rounded border-slate-300 text-primary focus:ring-primary w-6 h-6"
                                                    type="checkbox"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0" onClick={() => toggleCheck(item.id)}>
                                                <p className={`font-bold text-sm truncate ${item.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-slate-50 rounded-full p-1 border border-slate-100 shrink-0">
                                                <button onClick={() => updateAmount(item.id, -1)} className="size-7 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-600 hover:text-primary border border-slate-200">
                                                    <span className="material-symbols-outlined text-sm">remove</span>
                                                </button>
                                                <span className="text-sm font-black w-5 text-center text-slate-700">{item.amount}</span>
                                                <button onClick={() => updateAmount(item.id, 1)} className="size-7 flex items-center justify-center rounded-full bg-primary shadow-sm text-white border border-primary">
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
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
            {/* 하단 공통 네비게이션 바 */}
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
                    <button onClick={() => navigate('/shopping-list')} className="flex flex-col items-center gap-1 text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_basket</span>
                        <p className="text-[10px] font-bold">쇼핑</p>
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
            {/* 특별식 재료 추가 Bottom Sheet */}
            <AnimatePresence>
                {isSheetOpen && selectedSpecialMeal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSheetOpen(false)}
                            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed bottom-0 left-0 w-full bg-white rounded-t-3xl z-50 shadow-2xl flex flex-col max-h-[85vh]"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-sm">restaurant</span>
                                        </div>
                                        {selectedSpecialMeal.name} 재료 세트
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1 font-medium">필요한 재료만 쇼핑리스트에 담아보세요</p>
                                </div>
                                <button onClick={() => setIsSheetOpen(false)} className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-4">
                                {selectedSpecialMeal.defaultIngredients.map(ing => (
                                    <label key={ing.name} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 shadow-sm active:bg-slate-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={mealIngredientsCheck[ing.name] || false}
                                            onChange={(e) => setMealIngredientsCheck(prev => ({ ...prev, [ing.name]: e.target.checked }))}
                                            className="size-6 rounded border-slate-300 text-primary focus:ring-primary w-6 h-6 border-2"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold tracking-tight text-slate-800">{ing.name}</p>
                                            <p className="text-xs text-slate-400 font-bold">{ing.category}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="p-6 pt-2 border-t border-slate-100 bg-white shrink-0 mb-6">
                                <button
                                    onClick={addSpecialIngredientsToList}
                                    className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                >
                                    <span className="material-symbols-outlined">add_shopping_cart</span>
                                    {Object.values(mealIngredientsCheck).filter(Boolean).length}개 재료 쇼핑리스트 담기
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShoppingList;
