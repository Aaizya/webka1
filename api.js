const API_KEY = 'bec183b3de66138109976f0a98c14e93';
const movieId = '897087';

fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`)
  .then(response => response.json())
  .then(data => {
    // Обработка полученных данных о фильме
    console.log(data);
    // Пример: вывод названия фильма в консоль
    console.log('Фриланс', data.title);
  })
  .catch(error => {
    console.error('Ошибка при загрузке данных:', error);
  });
