import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
} from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('#search-form');
const input = form.querySelector('input[name="searchQuery"]');
const loadingMessage = document.querySelector('#loading-message');

form.addEventListener('submit', e => {
  e.preventDefault();

  const query = input.value.trim();
  if (!query) {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search term!',
      position: 'topRight',
    });
    return;
  }

  clearGallery();
  showLoader();
  loadingMessage.classList.add('visible');

  getImagesByQuery(query)
    .then(data => {
      if (!data.hits.length) {
        iziToast.info({
          title: 'No Results',
          message:
            'Sorry, there are no images matching your search query. Please try again!',
          position: 'topRight',
        });
      } else {
        createGallery(data.hits);
      }
    })
    .catch(() => {
      iziToast.error({
        title: 'Error',
        message: 'Failed to fetch images. Try again later.',
        position: 'topRight',
      });
    })
    .finally(() => {
      hideLoader();
      loadingMessage.classList.remove('visible');
    });
});
