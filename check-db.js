import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqckjyrvwdwxgdombwct.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxY2tqeXJ2d2R3eGdkb21id2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQxMjIwNCwiZXhwIjoyMDk0OTg4MjA0fQ.pKxKvJdCmoBXYGYp-mGLPl8-rpwB8p0rFxlRTKtL3GU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
  console.log('--- Checking automation_logs ---');
  const { data: logs, error: logError } = await supabase
    .from('automation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (logError) console.error('Error fetching logs:', logError);
  else console.log(JSON.stringify(logs, null, 2));

  console.log('\n--- Checking messages ---');
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (msgError) console.error('Error fetching messages:', msgError);
  else console.log(JSON.stringify(messages, null, 2));
}

checkLogs();
