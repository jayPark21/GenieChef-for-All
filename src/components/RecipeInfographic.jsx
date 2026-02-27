import React from 'react';
import { motion } from 'framer-motion';

/**
 * [자체 제작 인포그래픽 컴포넌트]
 * 대표님! 외부 서비스를 대신해 우리 앱의 디자인 시스템을 100% 반영한 
 * '진짜' 인포그래픽을 실시간으로 그려냅니다. 🫡
 */
const RecipeInfographic = ({ recipe, infoUrl, onStartCooking }) => {
    // [땡칠이 팀장 방어 코드] recipe가 없을 경우를 대비한 가드
    if (!recipe) {
        return (
            <div className="w-full bg-[#111111] rounded-3xl p-12 text-center text-white/40 border border-white/10">
                <span className="material-symbols-outlined text-4xl mb-4">error</span>
                <p>레시피 정보를 불러올 수 없습니다. 🫡</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        >
            {/* 1. 비주얼 헤더 (AI 생성 이미지) - 텍스트 없이 전체 이미지로 노출 */}
            <div className="relative w-full bg-slate-800 rounded-3xl">
                {infoUrl ? (
                    <img
                        src={infoUrl}
                        alt={recipe.title || "레시피"}
                        className="w-full h-auto object-cover rounded-3xl block"
                    />
                ) : (
                    <div className="w-full h-80 flex items-center justify-center text-white/20">
                        <span className="material-symbols-outlined text-6xl">image</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default RecipeInfographic;
