import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query, doc } from 'firebase/firestore';
import { db } from '../firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../contexts/AuthContext';

const History = () => {
    const navigate = useNavigate();
    const [historyList, setHistoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const { currentUser } = useAuth();

    // 로그인이 구현되지 않았으므로 임시로 하드코딩된 guest_user 아이디를 사용
    const historyRef = collection(doc(db, 'users', currentUser?.uid || 'guest_user'), 'history');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const q = query(historyRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);

                const histories = [];
                let indexCounter = querySnapshot.docs.length; // 최신순이므로 역방향 인덱스 지정

                querySnapshot.forEach((doc) => {
                    histories.push({
                        id: doc.id,
                        index: indexCounter--,
                        ...doc.data(),
                    });
                });

                setHistoryList(histories);
            } catch (error) {
                console.error("히스토리 불러오기 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleItemClick = (historyItem) => {
        setSelectedHistory(historyItem);
    };

    const closeDetail = () => {
        setSelectedHistory(null);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
    };

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
            {/* 헤더 영역 */}
            <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md px-4 py-4 flex items-center shadow-sm border-b border-primary/10">
                <h1 className="text-xl font-bold tracking-tight px-2 flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-2xl font-bold text-primary">history</span>
                    레시피 히스토리
                </h1>
            </header>

            {/* 메인 리스트 영역 */}
            <main className="flex-1 overflow-y-auto px-4 pt-6 pb-28">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
                        <p className="text-slate-500 font-medium">히스토리를 불러오는 중입니다...</p>
                    </div>
                ) : historyList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">description</span>
                        <p className="text-slate-500 font-medium">아직 저장된 레시피 히스토리가 없습니다.</p>
                        <p className="text-slate-400 text-sm mt-1">추천받은 레시피에서 '히스토리 저장하기'를 눌러보세요!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {historyList.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                        No.{item.index}
                                    </div>
                                    <div className="flex flex-col gap-1 overflow-hidden">
                                        <h3 className="font-bold text-slate-900 text-lg truncate pr-2">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">
                                                {item.dietMode}
                                            </span>
                                            <span className="text-slate-400 font-medium">{formatDate(item.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 shrink-0">chevron_right</span>
                            </div>
                        ))}
                    </div>
                )}
            </main>

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
                    <button onClick={() => navigate('/shopping-list')} className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined">shopping_basket</span>
                        <p className="text-[10px] font-medium">쇼핑</p>
                    </button>
                    <button onClick={() => navigate('/history')} className="flex flex-col items-center gap-1 text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                        <p className="text-[10px] font-bold">히스토리</p>
                    </button>
                </div>
            </nav>

            {/* 인포그래픽 상세 모달창 */}
            {selectedHistory && (
                <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center transition-opacity">
                    <div className="bg-white w-full sm:w-[95%] sm:max-w-md h-[90vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up sm:animate-fade-in overflow-hidden">
                        {/* 모달 헤더 */}
                        <div className="sticky top-0 bg-white z-10 px-4 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h2 className="text-lg font-bold text-slate-900 truncate pr-4 flex-1">
                                {selectedHistory.title}
                            </h2>
                            <button
                                onClick={closeDetail}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 transition-all shrink-0"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* 모달 렌더링 영역 (이미지 우선, 없을 시 마크다운) */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar recipe-markdown">
                            {selectedHistory.imageUrl ? (
                                <img
                                    src={selectedHistory.imageUrl}
                                    alt={selectedHistory.title}
                                    className="w-full h-auto rounded-xl shadow-md"
                                />
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {selectedHistory.markdown}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
