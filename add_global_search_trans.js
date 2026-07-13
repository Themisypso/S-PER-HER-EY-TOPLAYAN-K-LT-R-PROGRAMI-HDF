const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json'));
const tr = JSON.parse(fs.readFileSync('src/messages/tr.json'));

if (!en.GlobalSearch) en.GlobalSearch = {};
if (!tr.GlobalSearch) tr.GlobalSearch = {};

Object.assign(en.GlobalSearch, {
  placeholder: 'Search movies, TV shows, anime, games... (Ctrl+K)',
  view_all: 'View all results for "{query}"',
  no_results: 'No results found. Try a different term.'
});

Object.assign(tr.GlobalSearch, {
  placeholder: 'Film, dizi, anime, oyun ara... (Ctrl+K)',
  view_all: '"{query}" için tüm sonuçları gör',
  no_results: 'Sonuç bulunamadı. Farklı bir terim dene.'
});

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/messages/tr.json', JSON.stringify(tr, null, 2));
