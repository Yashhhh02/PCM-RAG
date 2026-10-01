const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value) acc[key] = value.join('=').replace(/"/g, '').trim();
  return acc;
}, {});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

supabase.from('chunks').select('page, content').ilike('content', '%inertia%').order('page').limit(10).then(({data}) => {
  console.log(data.map(d => ({page: d.page, content: d.content.substring(0, 150)})));
}).catch(console.error);
