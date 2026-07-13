const fs = require('fs');
const path = require('path');

const files = [
  'details/[id]/route.ts',
  'discover/route.ts',
  'trending/route.ts',
  'search/route.ts',
  'person/[id]/route.ts',
  'people/popular/route.ts',
  'seasons/[id]/route.ts'
];

files.forEach(f => {
  const p = path.join('src/app/api/tmdb', f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    
    if (!content.includes('getTmdbLang')) {
      content = content.replace(/import \{ NextResponse \} from 'next\/server'/, "import { NextResponse } from 'next/server'\nimport { getTmdbLang } from '@/lib/tmdb-lang'");
      
      content = content.replace(/(export async function GET\([^)]*\)\s*\{)/, "$1\n    const tmdbLang = getTmdbLang();\n");

      content = content.replace(/language=en-US/g, 'language=${tmdbLang}');
      
      content = content.replace(/cacheKey = `([^`]+)`/, 'cacheKey = `$1:${tmdbLang}`');

      fs.writeFileSync(p, content);
      console.log('Updated', f);
    }
  }
});
