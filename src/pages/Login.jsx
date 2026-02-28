import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Login() {
    const { loginWithGoogle, loginAnonymously } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleGoogleLogin() {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('구글 로그인에 실패했습니다. (' + err.message + ')');
        } finally {
            setLoading(false);
        }
    }

    async function handleGuestLogin() {
        try {
            setError('');
            setLoading(true);
            await loginAnonymously();
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('게스트 로그인에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring' }}
                    className="flex justify-center"
                >
                    <div className="text-7xl mb-4 drop-shadow-md">👨‍🍳</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
                        냉장고 속 레시피<br /><span className="text-blue-600">GenieChef</span>
                    </h2>
                    <p className="mt-3 text-center text-lg text-gray-600 font-medium">
                        상하기 직전의 재료도 최고급 요리로!
                    </p>
                </motion.div>
            </div>

            <motion.div
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 mx-4">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-center text-sm font-semibold border border-red-100"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    <path fill="none" d="M1 1h22v22H1z" />
                                </svg>
                                Google 계정으로 시작하기
                            </span>
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-400 font-medium">
                                    또는
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleGuestLogin}
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border-2 border-gray-200 rounded-xl shadow-sm text-base font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                        >
                            게스트로 맛보기
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
