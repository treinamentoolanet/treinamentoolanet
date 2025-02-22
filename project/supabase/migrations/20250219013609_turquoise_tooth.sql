/*
  # Criação das tabelas do sistema de treinamento

  1. Novas Tabelas
    - `users`
      - `id` (uuid, chave primária)
      - `email` (text, único)
      - `role` (text, 'admin' ou 'student')
      - `created_at` (timestamp)
    
    - `courses`
      - `id` (uuid, chave primária)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `trainings`
      - `id` (uuid, chave primária)
      - `title` (text)
      - `video_url` (text)
      - `order` (integer)
      - `course_id` (uuid, referência a courses)
      - `created_at` (timestamp)
    
    - `completed_lessons`
      - `id` (uuid, chave primária)
      - `user_id` (uuid, referência a users)
      - `training_id` (uuid, referência a trainings)
      - `completed_at` (timestamp)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas específicas para cada tabela
*/

-- Criação da tabela de usuários
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'student')),
  created_at timestamptz DEFAULT now()
);

-- Criação da tabela de cursos
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Criação da tabela de treinamentos
CREATE TABLE trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  video_url text NOT NULL,
  order_number integer NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Criação da tabela de lições completadas
CREATE TABLE completed_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  training_id uuid REFERENCES trainings(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, training_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_lessons ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Políticas para courses
CREATE POLICY "Anyone can view courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify courses"
  ON courses
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Políticas para trainings
CREATE POLICY "Anyone can view trainings"
  ON trainings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify trainings"
  ON trainings
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Políticas para completed_lessons
CREATE POLICY "Users can view their completed lessons"
  ON completed_lessons
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their own lessons as completed"
  ON completed_lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);