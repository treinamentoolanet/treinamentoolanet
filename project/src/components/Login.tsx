import React, { useState } from 'react';
import { LogIn, UserCog, GraduationCap, Mail, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  role: 'admin' | 'student';
}

function Login({ onLogin, role }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            {role === 'admin' ? (
              <UserCog className="w-8 h-8 text-orange-500" />
            ) : (
              <GraduationCap className="w-8 h-8 text-orange-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {role === 'admin' ? 'Área Administrativa' : 'Portal do Aluno'}
          </h2>
          <p className="text-gray-500 mt-2 text-center">
            {role === 'admin' 
              ? 'Acesse o painel de gerenciamento de treinamentos' 
              : 'Bem-vindo(a) à plataforma de treinamentos da Olá Telecom'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="seu.email@olatelecom.com.br"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Entrar</span>
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          {role === 'admin' 
            ? 'Área restrita aos administradores do sistema' 
            : 'Precisa de ajuda? Entre em contato com seu supervisor'}
        </p>
      </div>
    </div>
  );
}

export default Login;