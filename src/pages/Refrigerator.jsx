import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { initialIngredients } from '../data/ingredients';

const Refrigerator = () => {
    const navigate = useNavigate();
    const [ownedIngredients, setOwnedIngredients] = useState([]);
    const [customIngredients, setCustomIngredients] = useState([]);
    const [isInitializing, setIsInitializing] = useState(true);
    const [addingCategory, setAddingCategory] = useState(null);
    const [newIngredientName, setNewIngredientName] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const skipSaveRef = useRef(true);

    const userRef = doc(db, 'users', 'guest_user');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cachedStr = localStorage.getItem('geniechef_user_data');
                const now = Date.now();
                let needsDbSync = true;

                if (cachedStr) {
                    const data = JSON.parse(cachedStr);
                    if (data.ownedIngredients) setOwnedIngredients(data.ownedIngredients);
                    if (data.customIngredients) setCustomIngredients(data.customIngredients);
                    setIsInitializing(false);

                    const lastSync = data.lastSyncTime || 0;
                    if (now - lastSync < 24 * 60 * 60 * 1000) {
                        needsDbSync = false;
                        return; // 로컬 캐시 우선 적용시 Firestore 로컬 호출 생략
                    }
                }

                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.ownedIngredients) setOwnedIngredients(data.ownedIngredients);
                    if (data.customIngredients) setCustomIngredients(data.customIngredients);
                    // 최초 데이터 병합 저장
                    localStorage.setItem('geniechef_user_data', JSON.stringify({
                        ...data,
                        ownedIngredients: data.ownedIngredients || initialIngredients.map(item => item.id),
                        customIngredients: data.customIngredients || []
                    }));
                } else {
                    // 기본값: 모든 재료 보유
                    const allIds = initialIngredients.map(item => item.id);
                    setOwnedIngredients(allIds);
                    localStorage.setItem('geniechef_user_data', JSON.stringify({ ownedIngredients: allIds, customIngredients: [], selectedIngredients: allIds }));
                }
            } catch (error) {
                console.error("Firestore 로드 에러:", error);
                setOwnedIngredients(initialIngredients.map(item => item.id));
            } finally {
                setIsInitializing(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (isInitializing) return;
        if (skipSaveRef.current) {
            skipSaveRef.current = false;
            return;
        }

        const saveData = async () => {
            // 화면 전환 속도를 향상시키기 위해 무조건 로컬 캐시 덮어쓰기
            const cached = JSON.parse(localStorage.getItem('geniechef_user_data') || '{}');
            const newData = { ...cached, ownedIngredients, customIngredients };
            // 변경된 ownedIngredients에 맞춰 selectedIngredients도 필터링
            if (newData.selectedIngredients) {
                newData.selectedIngredients = newData.selectedIngredients.filter(id => ownedIngredients.includes(id));
            }
            localStorage.setItem('geniechef_user_data', JSON.stringify(newData));

            try {
                await setDoc(userRef, { ownedIngredients, customIngredients, updatedAt: new Date() }, { merge: true });
            } catch (error) {
                console.warn("Firestore 저장 실패 (오프라인 상태)");
            }
        };
        saveData();
    }, [ownedIngredients, customIngredients, isInitializing]);

    const toggleIngredient = (id) => {
        setOwnedIngredients(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.ownedIngredients) setOwnedIngredients(data.ownedIngredients);
                if (data.customIngredients) setCustomIngredients(data.customIngredients);

                // 로컬 스토리지 갱신 (마지막 동기화 시간도 업데이트)
                const cachedStr = localStorage.getItem('geniechef_user_data');
                const cachedData = cachedStr ? JSON.parse(cachedStr) : {};
                localStorage.setItem('geniechef_user_data', JSON.stringify({
                    ...cachedData,
                    ...data,
                    lastSyncTime: Date.now()
                }));
            }
        } catch (error) {
            console.error("Firestore 수동 동기화 에러:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const selectAllIngredients = () => {
        const allIngredients = [...initialIngredients, ...customIngredients];
        const allIds = allIngredients.map(item => item.id);
        setOwnedIngredients(allIds);
    };

    const handleAddCustom = (categoryName) => {
        if (!newIngredientName.trim()) {
            setAddingCategory(null);
            return;
        }
        const newIngredient = {
            id: `custom_${Date.now()}`,
            name: newIngredientName.trim(),
            category: categoryName,
            icon: '🛒'
        };
        setCustomIngredients(prev => [...prev, newIngredient]);
        setOwnedIngredients(prev => [...prev, newIngredient.id]);
        setAddingCategory(null);
        setNewIngredientName('');
    };

    const allIngredients = [...initialIngredients, ...customIngredients];

    const groupedIngredients = allIngredients.reduce((acc, current) => {
        if (!acc[current.category]) acc[current.category] = [];
        acc[current.category].push(current);
        return acc;
    }, {});

    const categories = [
        { name: '냉장', icon: 'kitchen', colorClass: 'text-primary', borderClass: 'border-primary/20 bg-white text-slate-900', selectedIconColor: 'text-primary' },
        { name: '냉동', icon: 'ac_unit', colorClass: 'text-blue-400', borderClass: 'border-blue-100 bg-white text-slate-900', selectedIconColor: 'text-blue-400' },
        { name: '양념 및 소스', icon: 'liquor', colorClass: 'text-orange-400', borderClass: 'border-orange-100 bg-white text-slate-900', selectedIconColor: 'text-orange-400' },
    ];

    const lackCount = allIngredients.length - ownedIngredients.length;
    const isLack = lackCount > 0;

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-primary/10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-900">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold tracking-tight text-center flex-1">냉장고 관리</h1>
                <button onClick={handleSync} disabled={isSyncing} className="flex items-center gap-1 text-primary active:scale-95 transition-transform disabled:opacity-50">
                    <span className={`material-symbols-outlined font-bold text-xl ${isSyncing ? 'animate-spin cursor-not-allowed' : ''}`}>sync</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pb-48">
                <div className="mt-4">
                    <div onClick={() => navigate('/shopping-list')} className="cursor-pointer flex items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-orange-50/50 p-4 shadow-sm transition-transform active:scale-95">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500 text-xl font-bold">shopping_cart</span>
                                <p className="text-slate-900 text-base font-bold leading-tight">
                                    {isLack ? `식재료 ${lackCount}개 부족` : '모든 식재료 구비 완료'}
                                </p>
                            </div>
                            <p className="text-slate-500 text-xs font-normal">
                                {isLack ? '부족한 재료를 터치해 쇼핑 리스트에 담으세요.' : '냉장고가 꽉 차 있습니다! 든든하네요.'}
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </div>
                </div>

                <div className="mt-4 flex justify-end px-1">
                    <button
                        onClick={selectAllIngredients}
                        disabled={!isLack}
                        className={`text-sm font-bold flex items-center gap-1 px-4 py-2 rounded-xl transition-all shadow-sm ${isLack
                            ? 'text-primary bg-primary/10 active:scale-95 cursor-pointer'
                            : 'text-slate-400 bg-slate-100 opacity-70 cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">done_all</span> 전체 선택
                    </button>
                </div>

                {categories.map(cat => {
                    const items = groupedIngredients[cat.name] || [];
                    const ownedCount = items.filter(item => ownedIngredients.includes(item.id)).length;

                    return (
                        <section className="mt-8" key={cat.name}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className={`material-symbols-outlined ${cat.colorClass}`}>{cat.icon}</span>
                                    {cat.name} <span className="text-sm font-normal text-slate-400">({ownedCount})</span>
                                </h2>
                                <button onClick={() => setAddingCategory(cat.name)} className="text-primary active:scale-95 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">add_circle</span>
                                </button>
                            </div>

                            {addingCategory === cat.name && (
                                <div className="flex items-center gap-2 mb-3 bg-white p-2 rounded-xl shadow-sm border border-primary/30">
                                    <span className="text-lg">🛒</span>
                                    <input
                                        type="text"
                                        value={newIngredientName}
                                        onChange={(e) => setNewIngredientName(e.target.value)}
                                        placeholder="직접 입력 (예: 트러플 오일)"
                                        className="flex-1 bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddCustom(cat.name);
                                            if (e.key === 'Escape') setAddingCategory(null);
                                        }}
                                    />
                                    <button onClick={() => handleAddCustom(cat.name)} className="text-white bg-primary rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm active:scale-95 transition-transform">
                                        추가
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {items.map(item => {
                                    const isOwned = ownedIngredients.includes(item.id);
                                    const isCustom = typeof item.id === 'string' && item.id.startsWith('custom_');

                                    return (
                                        <div key={item.id} className="relative group flex items-center">
                                            <button
                                                onClick={() => toggleIngredient(item.id)}
                                                className={`flex h-10 items-center justify-center gap-x-2 rounded-full px-4 active:scale-95 transition-all shadow-sm ${isOwned
                                                    ? `border ${cat.borderClass} opacity-100`
                                                    : 'border border-dashed border-slate-300 bg-slate-200/50 text-slate-400 opacity-70 grayscale'
                                                    }`}
                                            >
                                                <span className="text-base">{item.icon || '🍽️'}</span>
                                                <p className={`text-sm ${isOwned ? 'font-bold' : 'font-medium'}`}>{item.name}</p>
                                            </button>

                                            {/* 커스텀 식재료 삭제 버튼 (우상단 플로팅 아이콘) */}
                                            {isCustom && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`'${item.name}' 식재료를 삭제하시겠습니까?`)) {
                                                            setCustomIngredients(prev => prev.filter(c => c.id !== item.id));
                                                            setOwnedIngredients(prev => prev.filter(id => id !== item.id));
                                                        }
                                                    }}
                                                    className="absolute -top-1 -right-1 size-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors active:scale-90 opacity-80 z-10"
                                                >
                                                    <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}

                <div className="mt-10 p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2 text-sm">
                        <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                        AI 식재료 팁
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        현재 냉장고에 <span className="font-bold text-primary">{ownedIngredients.length}개</span>의 식재료가 있습니다.
                        신선도를 위해 유통기한이 짧은 재료부터 먼저 사용하시는 것을 권장합니다!
                    </p>
                </div>
            </main>

            <div className="fixed bottom-24 left-0 w-full px-6 pointer-events-none">
                <button onClick={() => navigate('/shopping-list')} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl pointer-events-auto active:scale-[0.97] transition-all">
                    <span className="material-symbols-outlined">receipt_long</span>
                    쇼핑 리스트 생성하기
                </button>
            </div>
            {/* 하단 공통 네비게이션 바 */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 pt-3 pb-8">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined">home</span>
                        <p className="text-[10px] font-medium">추천식단</p>
                    </button>
                    <button onClick={() => navigate('/refrigerator')} className="flex flex-col items-center gap-1 text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>kitchen</span>
                        <p className="text-[10px] font-bold">냉장고</p>
                    </button>
                    <button onClick={() => navigate('/shopping-list')} className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined">shopping_basket</span>
                        <p className="text-[10px] font-medium">쇼핑</p>
                    </button>
                    <button onClick={() => navigate('/history')} className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined">history</span>
                        <p className="text-[10px] font-medium">히스토리</p>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Refrigerator;
