# Blackjack Game

This is a **Blackjack Game** built with **React**, **TypeScript**, **Supabase**, **GSAP**, and **Tailwind CSS**. The game allows users to log in, play Blackjack, and manage their game state dynamically.

---

## Features

- **Authentication**: User login and signup powered by Supabase.
- **Blackjack Gameplay**:
  - Hit, Stand, Split, and Insurance options.
  - Dealer AI logic.
  - Split hands support.
- **Dynamic Animations**: Smooth animations using GSAP.
- **Responsive Design**: Styled with Tailwind CSS for a modern and responsive UI.
- **Persistent State**: Game state is managed dynamically with React.

---

## Installation

### Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** or **yarn**
- A Supabase project with the required database schema.

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/blackjack-game.git
   cd blackjack-game

   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Supabase:

Create a Supabase project.
Add the required database schema (see Database Setup).
Copy your Supabase URL and anon key into src/utils/supabase.ts:

```bash
    const supabaseUrl = 'https://your-project-ref.supabase.co';
    const supabaseKey = 'your-anon-key';
    export const supabase = createClient(supabaseUrl, supabaseKey);
```

4. Start the development server:

   ```bash
   npm start
   ```

5. Open your browser and navigate to http://localhost:5173 to play the Blackjack game.

Database Setup
Run the following SQL script in your Supabase SQL editor to set up the required database schema:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  money integer DEFAULT 500,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profiles_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

Project Structure

```
project
├─ .bolt
│  ├─ config.json
│  └─ prompt
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ README.md
├─ src
│  ├─ App.tsx
│  ├─ components
│  │  ├─ Auth.tsx
│  │  └─ Login.tsx
│  ├─ index.css
│  ├─ main.tsx
│  ├─ utils
│  │  ├─ blackjack.ts
│  │  └─ supabase.ts
│  └─ vite-env.d.ts
├─ supabase
│  ├─ .temp
│  │  ├─ cli-latest
│  │  ├─ gotrue-version
│  │  ├─ pooler-url
│  │  ├─ postgres-version
│  │  ├─ project-ref
│  │  └─ rest-version
│  └─ migrations
│     └─ 20250410171520_turquoise_firefly.sql
├─ tailwind.config.js
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```

Scripts
npm start: Start the development server.
npm run build: Build the project for production.
npm run preview: Preview the production build.

Technologies Used
![Supabase](https://img.shields.io/badge/Supabase)
![GSAP](https://img.shields.io/badge/GSAP)
![TailwindCSS](https://img.shields.io/badge/tailwindcss)
![JSON](https://img.shields.io/badge/JSON-red)
![Npm](https://img.shields.io/badge/npm-red)
![Autoprefixer](https://img.shields.io/badge/Autoprefixer-orange)
![PostCSS](https://img.shields.io/badge/PostCSS-orange)
![Esbuild](https://img.shields.io/badge/esbuild-yellow)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow)
![React](https://img.shields.io/badge/React-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Vite](https://img.shields.io/badge/Vite-purple)
![CSS](https://img.shields.io/badge/CSS-purple)
![HTML](https://img.shields.io/badge/HTML-red)

## This project is licensed under the MIT License.

License

Copyright (c) 2025 amine harrabi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
klem s3ib aabathou w rigel jawek amel li theb

---
