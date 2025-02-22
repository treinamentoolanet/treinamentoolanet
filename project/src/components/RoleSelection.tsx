import React from 'react';
import { UserCog, GraduationCap } from 'lucide-react';

interface RoleSelectionProps {
  onSelect: (role: 'admin' | 'student') => void;
}

function RoleSelection({ onSelect }: RoleSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://olanet.com.br/wp-content/uploads/2021/03/cropped-ola-icone520-1.png"
            alt="Olá Telecom Logo" 
            className="h-20 w-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Treinamentos Olá Telecom
          </h2>
          <p className="text-gray-500 text-center">
            Selecione seu tipo de acesso para continuar
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => onSelect('admin')}
            className="w-full p-6 bg-white border-2 border-orange-500 rounded-xl hover:bg-orange-50 transition-all transform hover:scale-[1.02] flex items-center space-x-4"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
              <UserCog className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-800">Área Administrativa</h3>
              <p className="text-sm text-gray-500">Acesso ao gerenciamento de treinamentos</p>
            </div>
          </button>
          <button
            onClick={() => onSelect('student')}
            className="w-full p-6 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all transform hover:scale-[1.02] flex items-center space-x-4"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold">Portal do Aluno</h3>
              <p className="text-sm text-white/80">Acesse seus treinamentos</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;