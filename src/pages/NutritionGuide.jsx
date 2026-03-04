import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const NutritionGuide = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const handleSetGoal = async (goal) => {
        try {
            // 1. dietGoal 단독 키 저장
            localStorage.setItem('dietGoal', goal);

            // 2. geniechef_user_data 캐시도 함께 업데이트 → 홈 화면에 즉시 반영
            const cachedStr = localStorage.getItem('geniechef_user_data');
            if (cachedStr) {
                try {
                    const cached = JSON.parse(cachedStr);
                    cached.dietGoal = goal;
                    localStorage.setItem('geniechef_user_data', JSON.stringify(cached));
                } catch (_) { /* 캐시 파싱 실패 시 무시 */ }
            }

            // 3. Firebase 동기화
            if (currentUser) {
                await setDoc(doc(db, 'users', currentUser.uid), { dietGoal: goal }, { merge: true });
            }
            alert(`'${goal}' 목표가 땡칠이 팀장에게 접수되었습니다! 🫡 홈 화면에서 맞춰서 추천해드릴게요!`);
            navigate('/');
        } catch (error) {
            console.error('목표 설정 실패:', error);
            alert('목표 설정 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="font-display text-slate-900 min-h-screen flex flex-col bg-slate-50 pb-24">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="size-10 rounded-full flex items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="text-base font-bold text-slate-800 tracking-tight">식단 목적별 영양 가이드</h1>
                <div className="size-10"></div> {/* Spacer for centering */}
            </header>

            <main className="flex-1 overflow-y-auto px-5 py-6">
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3 leading-tight">
                        나에게 맞는 <span className="text-primary">탄단지 비율</span>은?
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        탄수화물, 단백질, 지방의 가장 이상적인 배합은 개인의 건강 상태와 목표에 따라 달라집니다. 아래 가이드를 참고하여 나만의 최적 비율을 찾아보세요.
                    </p>
                </section>

                <div className="space-y-5">
                    {/* 1. 일반적인 권장 비율 */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <span className="material-symbols-outlined text-8xl">balance</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs">1</span>
                                <h3 className="text-base font-bold text-slate-800">일반적인 권장 비율 (유지 및 균형)</h3>
                            </div>
                            <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">
                                보건복지부와 영양학계에서 권장하는 한국인 영양소 섭취기준의 기본 비율입니다. 가장 지속 가능하며, 일상적인 활동에 필요한 에너지를 안정적으로 공급합니다.
                            </p>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-700">추천 비율</span>
                                    <span className="text-sm font-bold text-primary">5 : 2 : 3</span>
                                </div>
                                <div className="flex h-3 rounded-full overflow-hidden">
                                    <div className="bg-carb h-full" style={{ width: '50%' }}></div>
                                    <div className="bg-protein h-full" style={{ width: '20%' }}></div>
                                    <div className="bg-fat h-full" style={{ width: '30%' }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold mt-1.5 px-1">
                                    <span className="text-carb">탄수화물 50%</span>
                                    <span className="text-protein">단백질 20%</span>
                                    <span className="text-fat">지방 30%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. 다이어트 목적 */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <span className="material-symbols-outlined text-8xl">monitor_weight</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 font-bold text-xs">2</span>
                                <h3 className="text-base font-bold text-slate-800">다이어트 및 체중 감량</h3>
                            </div>
                            <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">
                                지방 연소를 돕고 근육량을 보존하기 위해 단백질 비중을 높입니다. 단백질 섭취를 늘리면 포만감이 오래 유지되어 식단 관리에 유리합니다.
                            </p>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-700">타이트한 관리</span>
                                    <span className="text-sm font-bold text-amber-500">3 : 4 : 3</span>
                                </div>
                                <div className="flex h-3 rounded-full overflow-hidden mb-3">
                                    <div className="bg-carb h-full" style={{ width: '30%' }}></div>
                                    <div className="bg-protein h-full" style={{ width: '40%' }}></div>
                                    <div className="bg-fat h-full" style={{ width: '30%' }}></div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-700">완만한 감량</span>
                                    <span className="text-sm font-bold text-amber-500">4 : 4 : 2</span>
                                </div>
                                <div className="flex h-3 rounded-full overflow-hidden">
                                    <div className="bg-carb h-full" style={{ width: '40%' }}></div>
                                    <div className="bg-protein h-full" style={{ width: '40%' }}></div>
                                    <div className="bg-fat h-full" style={{ width: '20%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. 벌크업 목적 */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <span className="material-symbols-outlined text-8xl">fitness_center</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 font-bold text-xs">3</span>
                                <h3 className="text-base font-bold text-slate-800">근육 증대 (벌크업)</h3>
                            </div>
                            <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">
                                강도 높은 운동 에너지를 위해 탄수화물과 단백질을 충분히 섭취합니다. 운동 후 근육 회복을 위해 양질의 탄수화물을 섭취하는 것이 핵심입니다.
                            </p>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-700">추천 비율</span>
                                    <span className="text-sm font-bold text-blue-500">5 : 3 : 2</span>
                                </div>
                                <div className="flex h-3 rounded-full overflow-hidden">
                                    <div className="bg-carb h-full" style={{ width: '50%' }}></div>
                                    <div className="bg-protein h-full" style={{ width: '30%' }}></div>
                                    <div className="bg-fat h-full" style={{ width: '20%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 팁 영역 */}
                <section className="mt-8 bg-blue-50/50 rounded-3xl p-5 border border-blue-100">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-4">
                        <span className="material-symbols-outlined text-blue-500">lightbulb</span>
                        팁: 비율만큼 중요한 '질'
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-carb/20 text-carb flex items-center justify-center font-bold text-sm shrink-0">탄</div>
                            <div>
                                <h5 className="text-xs font-bold text-slate-800 mb-0.5">양질의 탄수화물</h5>
                                <p className="text-[11px] text-slate-500">정제된 밀가루보다는 현미, 고구마 등 복합 탄수화물을 선택하세요.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-protein/20 text-protein flex items-center justify-center font-bold text-sm shrink-0">단</div>
                            <div>
                                <h5 className="text-xs font-bold text-slate-800 mb-0.5">다양한 단백질 급원</h5>
                                <p className="text-[11px] text-slate-500">닭가슴살, 계란 외에도 생선, 콩류 등 다양한 급원을 활용하세요.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-fat/20 text-fat flex items-center justify-center font-bold text-sm shrink-0">지</div>
                            <div>
                                <h5 className="text-xs font-bold text-slate-800 mb-0.5">착한 불포화 지방</h5>
                                <p className="text-[11px] text-slate-500">오메가-3가 풍부한 견과류, 아보카도, 올리브유 등 불포화 지방산 위주로 구성하세요.</p>
                            </div>
                        </li>
                    </ul>
                </section>

                <section className="mt-8 text-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">psychology_alt</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-2">어떤 목적을 가지고 계신가요?</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed mb-6">
                        현재 체중 감량이 목적이신가요, 아니면 근육량 증가가 목적이신가요? 목적에 맞춰 더 구체적인 식단 예시를 준비해 드릴게요.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => handleSetGoal('체중 감량')} className="py-3 px-2 rounded-xl bg-amber-50 text-amber-600 font-bold text-[13px] hover:bg-amber-100 transition-colors">체중 감량</button>
                        <button onClick={() => handleSetGoal('체중 유지')} className="py-3 px-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-[13px] hover:bg-emerald-100 transition-colors">체중 유지</button>
                        <button onClick={() => handleSetGoal('근육 성장')} className="py-3 px-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-[13px] hover:bg-blue-100 transition-colors">근육 성장</button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default NutritionGuide;
