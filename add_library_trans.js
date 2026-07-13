const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json'));
const tr = JSON.parse(fs.readFileSync('src/messages/tr.json'));

if (!en.Library) en.Library = {};
if (!tr.Library) tr.Library = {};

Object.assign(en.Library, {
  title: 'Library',
  favorites_count: '{count} favorites',
  items_count: '{count} items',
  tabs: {
    ALL: 'All',
    ANIME: 'Anime',
    MOVIE: 'Movies',
    TVSHOW: 'TV Shows',
    GAME: 'Games',
    BOOK: 'Books',
    PEOPLE: 'People'
  },
  status: {
    ALL: 'All',
    WATCHING: 'In Progress',
    COMPLETED: 'Completed',
    PLANNED: 'Planned',
    DROPPED: 'Dropped'
  },
  filter_titles: 'Filter titles...',
  sort: {
    createdAt: 'Date added',
    rating: 'Highest rated',
    title: 'Alphabetical'
  },
  overview: 'Library Overview',
  my_favorites: 'My Favorites',
  show_all: 'Show All ({count})',
  show_less: 'Show Less',
  browse_people: 'Browse the People page and click ♥ to add favorites.',
  popular_actors: 'Popular Actors',
  no_actors: 'No actors loaded.',
  popular_directors: 'Popular Directors',
  no_directors: 'No directors loaded.',
  loading: 'Loading...',
  load_more: 'Load More',
  no_items: 'No items found',
  update_filters: 'Update your filters or add some new titles to your library.'
});

Object.assign(tr.Library, {
  title: 'Kütüphane',
  favorites_count: '{count} favori',
  items_count: '{count} öğe',
  tabs: {
    ALL: 'Tümü',
    ANIME: 'Anime',
    MOVIE: 'Filmler',
    TVSHOW: 'Diziler',
    GAME: 'Oyunlar',
    BOOK: 'Kitaplar',
    PEOPLE: 'Kişiler'
  },
  status: {
    ALL: 'Tümü',
    WATCHING: 'İzleniyor',
    COMPLETED: 'Tamamlandı',
    PLANNED: 'Planlanan',
    DROPPED: 'Bırakıldı'
  },
  filter_titles: 'Başlıkları filtrele...',
  sort: {
    createdAt: 'Eklenme Tarihi',
    rating: 'En Yüksek Puan',
    title: 'Alfabetik'
  },
  overview: 'Kütüphane Özeti',
  my_favorites: 'Favorilerim',
  show_all: 'Tümünü Göster ({count})',
  show_less: 'Daha Az Göster',
  browse_people: 'Favori eklemek için Kişiler sayfasına göz at ve ♥ simgesine tıkla.',
  popular_actors: 'Popüler Oyuncular',
  no_actors: 'Oyuncu yüklenemedi.',
  popular_directors: 'Popüler Yönetmenler',
  no_directors: 'Yönetmen yüklenemedi.',
  loading: 'Yükleniyor...',
  load_more: 'Daha Fazla Yükle',
  no_items: 'Öğe bulunamadı',
  update_filters: 'Filtrelerini güncelle veya kütüphanene yeni başlıklar ekle.'
});

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/messages/tr.json', JSON.stringify(tr, null, 2));
