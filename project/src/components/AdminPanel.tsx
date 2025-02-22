import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Save, Trash2, BookOpen, Video, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Tables = Database['public']['Tables'];
type Training = Tables['trainings']['Row'];
type Course = Tables['courses']['Row'];

interface AdminPanelProps {
  trainings: Training[];
  onAddTraining: (training: Omit<Training, 'id' | 'created_at'>) => void;
  onUpdateTraining: (training: Training) => void;
  onDeleteTraining: (id: string) => void;
}

function AdminPanel({ trainings, onAddTraining, onUpdateTraining, onDeleteTraining }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'trainings'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Course form state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Training form state
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [order, setOrder] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      return;
    }

    setCourses(data);
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCourseId) {
      const { error } = await supabase
        .from('courses')
        .update({
          title: courseTitle,
          description: courseDescription
        })
        .eq('id', editingCourseId);

      if (error) {
        console.error('Error updating course:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('courses')
        .insert([{
          title: courseTitle,
          description: courseDescription
        }]);

      if (error) {
        console.error('Error adding course:', error);
        return;
      }
    }

    setCourseTitle('');
    setCourseDescription('');
    setEditingCourseId(null);
    fetchCourses();
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setCourseTitle(course.title);
    setCourseDescription(course.description || '');
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este treinamento? Todas as aulas serão excluídas também.')) {
      return;
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error('Error deleting course:', error);
      return;
    }

    fetchCourses();
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(null);
    }
  };

  const handleTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      alert('Por favor, selecione um treinamento primeiro.');
      return;
    }

    if (editingId) {
      onUpdateTraining({
        id: editingId,
        title,
        video_url: videoUrl,
        order_number: parseInt(order),
        course_id: selectedCourse.id,
        created_at: new Date().toISOString()
      });
      setEditingId(null);
    } else {
      onAddTraining({
        title,
        video_url: videoUrl,
        order_number: parseInt(order),
        course_id: selectedCourse.id
      });
    }

    setTitle('');
    setVideoUrl('');
    setOrder('');
  };

  const handleEditTraining = (training: Training) => {
    setEditingId(training.id);
    setTitle(training.title);
    setVideoUrl(training.video_url);
    setOrder(training.order_number.toString());
    const course = courses.find(c => c.id === training.course_id);
    if (course) {
      setSelectedCourse(course);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <img 
            src="https://olanet.com.br/wp-content/uploads/2021/03/cropped-ola-icone520-1.png"
            alt="Olá Telecom Logo" 
            className="h-12 w-auto mx-auto mb-6"
          />
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center space-x-2 px-4 py-3 text-left ${
              activeTab === 'courses' 
                ? 'bg-orange-50 text-orange-500 border-r-4 border-orange-500' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Treinamentos</span>
          </button>
          <button
            onClick={() => setActiveTab('trainings')}
            className={`w-full flex items-center space-x-2 px-4 py-3 text-left ${
              activeTab === 'trainings' 
                ? 'bg-orange-50 text-orange-500 border-r-4 border-orange-500' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Video className="w-5 h-5" />
            <span>Aulas</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'courses' ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingCourseId ? 'Editar Treinamento' : 'Adicionar Novo Treinamento'}
                </h2>
                <form onSubmit={handleCourseSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Treinamento
                    </label>
                    <input
                      id="courseTitle"
                      type="text"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      id="courseDescription"
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={4}
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {editingCourseId ? (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Salvar Alterações</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Adicionar Treinamento</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Treinamentos Cadastrados</h2>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">{course.title}</h3>
                        <p className="text-sm text-gray-500">{course.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Última alteração: {new Date(course.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="flex items-center space-x-2 px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Course Selection */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Selecione um Treinamento</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedCourse?.id === course.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">{course.title}</h3>
                        <ChevronRight className={`w-5 h-5 ${
                          selectedCourse?.id === course.id ? 'text-orange-500' : 'text-gray-400'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCourse && (
                <>
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      {editingId ? 'Editar Aula' : 'Adicionar Nova Aula'}
                    </h2>
                    <form onSubmit={handleTrainingSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Título da Aula
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                          Link do Vídeo (YouTube)
                        </label>
                        <input
                          id="videoUrl"
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                          Ordem da Aula
                        </label>
                        <input
                          id="order"
                          type="number"
                          value={order}
                          onChange={(e) => setOrder(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                          min="1"
                        />
                      </div>
                      <button
                        type="submit"
                        className="flex items-center justify-center space-x-2 w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        {editingId ? (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Salvar Alterações</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            <span>Adicionar Aula</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      Aulas de {selectedCourse.title}
                    </h2>
                    <div className="space-y-4">
                      {trainings
                        .filter(training => training.course_id === selectedCourse.id)
                        .sort((a, b) => a.order_number - b.order_number)
                        .map((training) => (
                          <div
                            key={training.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                          >
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                Aula {training.order_number}: {training.title}
                              </h3>
                              <p className="text-sm text-gray-500">{training.video_url}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Última alteração: {new Date(training.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditTraining(training)}
                                className="flex items-center space-x-2 px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-5 h-5" />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={() => onDeleteTraining(training.id)}
                                className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                                <span>Excluir</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;