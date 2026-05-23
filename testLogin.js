import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log("Intentando login...");
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'cesarcalvo171@gmail.com',
    password: 'jobitx2026'
  });

  if (loginError) {
    console.error("Login falló:", loginError.message);
    if (loginError.message.includes('Invalid login credentials')) {
      console.log("Intentando registrar al usuario...");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'cesarcalvo171@gmail.com',
        password: 'jobitx2026',
        options: {
          data: {
            full_name: 'César Calvo',
            role: 'admin'
          }
        }
      });
      if (signUpError) {
        console.error("Error al registrar:", signUpError.message);
      } else {
        console.log("Usuario registrado con éxito. Ya puedes iniciar sesión.");
      }
    }
  } else {
    console.log("Login exitoso. Las credenciales son válidas.");
  }
}

main();
