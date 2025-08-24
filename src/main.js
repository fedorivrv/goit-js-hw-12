import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('#search-form');
const input = form.querySelector('input[name="searchQuery"]');
const loadingMessage = document.querySelector('#loading-message');
const loadMoreBtn = document.querySelector('#load-more');

let currentQuery = '';
let currentPage = 1;
let totalHits = 0;
let loadedImages = 0;

form.addEventListener('submit', async e => {
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

  currentQuery = query;
  currentPage = 1;
  loadedImages = 0;
  clearGallery();
  hideLoadMoreButton();

  showLoader();
  loadingMessage.classList.add('visible');

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    totalHits = data.totalHits;

    if (!data.hits.length) {
      iziToast.warning({
        title: 'No Results',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
    } else {
      createGallery(data.hits);
      loadedImages += data.hits.length;

      if (loadedImages < totalHits) {
        showLoadMoreButton();
      }
    }
  } catch {
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images. Try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
    loadingMessage.classList.remove('visible');
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    createGallery(data.hits);
    loadedImages += data.hits.length;

    smoothScroll(data.hits.length);

    if (loadedImages >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        title: 'End of Results',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }
  } catch {
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch more images.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
});

function smoothScroll(newItemsCount) {
  const gallery = document.querySelector('.gallery');
  const items = gallery.querySelectorAll('.gallery-item');
  if (items.length > 0 && newItemsCount > 0) {
    const firstNewItem = items[items.length - newItemsCount];
    if (firstNewItem) {
      firstNewItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
