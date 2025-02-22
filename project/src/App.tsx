import React, { useState, useEffect } from 'react';
import { Play, LogIn, Book } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import RoleSelection from './components/RoleSelection';
import confetti from 'canvas-confetti';
import { supabase } from './lib/supabase';
import type { Database } from './lib/database.types';

type Tables = Database['public']['Tables'];
type Training = Tables['trainings']['Row'];
type Course = Tables['courses']['Row'];
type CompletedLesson = Tables['completed_lessons']['Row'];
type Profile = Tables['profiles']['Row'];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'student' | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setCurrentUser(session.user.id);
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setCurrentUser(session.user.id);
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentUser('');
        setUserProfile(null);
        setIsAdmin(false);
        setSelectedRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses();
      fetchTrainings();
      fetchCompletedLessons();
    }
  }, [isAuthenticated, currentUser]);

  const fetchUserProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }

    setUserProfile(profile);
    setIsAdmin(profile.role === 'admin');
    
    // Verify role matches selection
    if (selectedRole && profile.role !== selectedRole) {
      await handleLogout();
      alert('Credenciais inválidas. Verifique com o administrador da aplicação.');
      return;
    }
  };

  const fetchCompletedLessons = async () => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('completed_lessons')
      .select('*')
      .eq('user_id', currentUser);

    if (error) {
      console.error('Error fetching completed lessons:', error);
      return;
    }

    setCompletedLessons(data || []);
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) {
      console.error('Error fetching courses:', error);
      return;
    }
    setCourses(data);
  };

  const fetchTrainings = async () => {
    const { data, error } = await supabase.from('trainings').select('*');
    if (error) {
      console.error('Error fetching trainings:', error);
      return;
    }
    setTrainings(data);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile && profile.role !== selectedRole) {
          await handleLogout();
          alert('Credenciais inválidas. Verifique com o administrador da aplicação.');
          return;
        }

        setIsAuthenticated(true);
        setCurrentUser(data.user.id);
        setIsAdmin(profile?.role === 'admin');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Credenciais inválidas');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setSelectedRole(null);
    setCurrentUser('');
    setIsAdmin(false);
    setSelectedCourse(null);
    setUserProfile(null);
  };

  const handleRoleSelect = (role: 'admin' | 'student') => {
    setSelectedRole(role);
  };

  const handleCompleteLesson = async (trainingId: string) => {
    const { error } = await supabase.from('completed_lessons').insert([
      { training_id: trainingId, user_id: currentUser }
    ]);

    if (error) {
      console.error('Error completing lesson:', error);
      return;
    }

    await fetchCompletedLessons();
  };

  const isLessonCompleted = (trainingId: string) => {
    return completedLessons.some(
      lesson => lesson.training_id === trainingId && lesson.user_id === currentUser
    );
  };

  const isCourseCompleted = (courseId: string) => {
    const courseTrainings = trainings.filter(t => t.course_id === courseId);
    return courseTrainings.every(training => isLessonCompleted(training.id));
  };

  const handleFinishCourse = () => {
    if (selectedCourse && isCourseCompleted(selectedCourse)) {
      setShowCompletion(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  if (!selectedRole) {
    return <RoleSelection onSelect={handleRoleSelect} />;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} role={selectedRole} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-orange-500 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://i.ibb.co/7tcFgh25/image-removebg-preview.png" 
                alt="Olá Telecom Logo" 
                className="h-12 w-auto"
              />
              <h1 className="text-2xl font-bold text-white">Treinamentos Olá Telecom</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminPanel 
            trainings={trainings}
            onAddTraining={async (training) => {
              const { error } = await supabase.from('trainings').insert([training]);
              if (error) {
                console.error('Error adding training:', error);
                alert('Erro ao adicionar treinamento');
                return;
              }
              fetchTrainings();
            }}
            onUpdateTraining={async (training) => {
              const { error } = await supabase
                .from('trainings')
                .update({
                  title: training.title,
                  video_url: training.video_url,
                  order_number: training.order_number,
                  course_id: training.course_id
                })
                .eq('id', training.id);

              if (error) {
                console.error('Error updating training:', error);
                alert('Erro ao atualizar treinamento');
                return;
              }
              fetchTrainings();
            }}
            onDeleteTraining={async (trainingId) => {
              if (window.confirm('Tem certeza que deseja excluir esta aula?')) {
                const { error } = await supabase
                  .from('trainings')
                  .delete()
                  .eq('id', trainingId);

                if (error) {
                  console.error('Error deleting training:', error);
                  alert('Erro ao excluir treinamento');
                  return;
                }
                fetchTrainings();
              }
            }}
          />
        ) : (
          <div className="space-y-8">
            {showCompletion && selectedCourse && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
                  <img 
                    src="https://olanet.com.br/wp-content/uploads/2021/03/cropped-ola-icone520-1.png" 
                    alt="Ola Telecom Logo" 
                    className="h-16 w-auto mx-auto mb-4"
                  />
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Parabéns!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Você concluiu o {courses.find(c => c.id === selectedCourse)?.title} com sucesso!
                  </p>
                  <button
                    onClick={() => {
                      setShowCompletion(false);
                      setSelectedCourse(null);
                    }}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Voltar aos Treinamentos
                  </button>
                </div>
              </div>
            )}
            {!selectedCourse ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800">Treinamentos Disponíveis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course) => {
                    const isCompleted = isCourseCompleted(course.id);
                    return (
                      <div
                        key={course.id}
                        className="bg-white rounded-lg shadow-lg p-6"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <Book className="w-8 h-8 text-orange-500" />
                          <h3 className="text-xl font-semibold text-gray-800">{course.title}</h3>
                        </div>
                        <p className="text-gray-600">{course.description}</p>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {trainings.filter(t => t.course_id === course.id).length} aulas
                          </span>
                          <div className="flex items-center space-x-2">
                            {isCompleted && (
                              <span className="text-green-500 font-medium">Concluído</span>
                            )}
                            <button 
                              onClick={() => setSelectedCourse(course.id)}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                isCompleted
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-orange-500 text-white hover:bg-orange-600'
                              }`}
                            >
                              {isCompleted ? 'Rever Treinamento' : 'Iniciar Treinamento'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {courses.find(c => c.id === selectedCourse)?.title}
                  </h2>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    Voltar aos Treinamentos
                  </button>
                </div>
                <div className="space-y-6">
                  {trainings
                    .filter(training => training.course_id === selectedCourse)
                    .sort((a, b) => a.order_number - b.order_number)
                    .map((training) => (
                      <div key={training.id} className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-800">
                            Aula {training.order_number}: {training.title}
                          </h3>
                          <button
                            onClick={() => handleCompleteLesson(training.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                              isLessonCompleted(training.id)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <span>{isLessonCompleted(training.id) ? 'Concluído' : 'Marcar como concluído'}</span>
                          </button>
                        </div>
                        <VideoPlayer url={training.video_url} />
                      </div>
                    ))}
                  {isCourseCompleted(selectedCourse) && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleFinishCourse}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Finalizar Treinamento
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;