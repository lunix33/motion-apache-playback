/** @type {HTMLVideoElement} */
let modal;

document.addEventListener('DOMContentLoaded', () => {
  modal = document.querySelector('.modal');

  initTableHeader();
  setupLiveURI();

  document.querySelectorAll('td a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openPlayback(a.href);
    })
  });

  modal.addEventListener('click', closeModal);
  modal.querySelector('.modal .content .close', closeModal);
});

/**
 * Add the relevent classes to the headers of the file table.
 */
function initTableHeader() {
  const queryString = location.search;
  let field = 'name';
  let asc = true;

  if (queryString !== '') {
    const urlParams = new Map(
      queryString
        .substring(1)
        .split(';')
        .map(v => v.split('=')));
    const column = urlParams.get('C') || 'N';
    const order = urlParams.get('O') || 'A';
    field =
      (column === 'M') ? 'lastmod' :
      (column === 'S') ? 'size' :
                        'name';
    asc = (order === 'A');
  }

  const headerColumn = document.querySelector(`tr.indexhead th.indexcol${field}`);
  headerColumn.classList.add((asc) ? 'asc' : 'desc');
}

/**
 * Setup the live page uri.
 */
function setupLiveURI() {
  const link = document.querySelector('.liveUri');

  // Assemble the URL of the Motion UI.
  const
    proto = location.protocol,
    host = location.hostname,
    port = parseInt(location.port, 10) - 2;
  const href = `${proto}//${host}:${port}`;
  
  link.innerText = href;

  // Open a modal with the live UI when link is clicked.
  link.addEventListener('click', (e) => {
    e.preventDefault();

    const frag = document.createDocumentFragment();
    const frame = document.createElement('iframe');
    frame.src = href;
    frag. append(frame);
    openModal('Live', null, frag, true);
  });
}

/**
 * Open a modal for file playback.
 * @param {string} uri The url of the element to display.
 * @returns {Promise}
 */
function openPlayback(uri) {
  return new Promise((resolve) => {
    const [cam, time, ext] = fileToData(uri);

    fetch(uri, {method: 'HEAD'}).then((r) => {
      const contentType = r.headers.get('content-type');
      const frag = document.createDocumentFragment();

      const vid = document.createElement('video');
      if (vid.canPlayType(contentType) !== '') {
        vid.src = uri;
        frag.append(vid);
      } else if (contentType.contains('image/')) {
        const img = document.createElement('img');
        img.src = uri;
        frag.append(img);
      } else {
        const p = document.createElement('p');
        p.innerText = 'The format of this file cannot be read.';
        frag.append(p);
      }

      const download = document.createElement('p');
      const a = document.createElement('a');
      a.innerText = 'Click here to download the file.';
      a.href = uri;
      a.target = '_blank';

      download.append(a);
      frag.append(download);
      
      openModal(cam, time, frag);
      return resolve();
    });
  });
}

/**
 * Extract data from a file URI.
 * @param {string} uri The URI from which data needs to be extracted.
 * @returns {[string, string, string]} An array with the camera name, the time, and the type of file (in order)
 */
function fileToData(uri) {
  const rtn = uri
    // Get the file name by stripping the origin and the extension of the file.
    .substring(
      location.origin.length + 1,
      uri.length - 4)
    // Split the camera name and time.
    .split('_');

  rtn[1] = new Date(
    // Replace the dashes in the time portion with columns to be able to parse the date.
    rtn[1].replace(
      /T(\d{2})-(\d{2})-(\d{2})/g,
      (f, h, m, s) => `T${h}:${m}:${s}`))
    // Get a english canadian string representation of the time (24h time).
    // Would yeild something like `2020/08/06, 19:16:43`.
    .toLocaleString('en-ca', {
      dateStyle: 'short',
      timeStyle: 'medium',
      hour12: false
    });

  // The file extension.
  rtn[2] = uri.substring(uri.length - 3);

  return rtn;
}

/**
 * Open the modal dialog.
 * @param {string} title The title to be displayed.
 * @param {string} sub The subtitle to be displayed.
 * @param {DocumentFragment} content The document to be displayed.
 * @param {boolean?} fullscreen True when the modal is fullscreen.
 */
function openModal(title, sub, content, fullscreen) {
  const titleEle = modal.querySelector('.title');
  titleEle.innerText = title;

  const subEle = modal.querySelector('.sub');
  if (sub) {
    subEle.classList.remove('hidden');
    subEle.innerText = sub;
  } else {
    subEle.classList.add('hidden');
  }

  const bodyEle = modal.querySelector('.body');
  bodyEle.append(content);

  modal.classList.remove('hidden');
}

/**
 * Close the modal
 * @param {Event?} event The event which fired the request to close the modal.
 */
function closeModal(event) {
  // If the event is present, it means an event closed the dialog and needs to be handled.
  // if the event is undefined, then it means the modal was manually closed.
  if (event) {
    event.preventDefault();

    /** @type {HTMLElement} */
    const target = event.target;

    // Only continue if backdrop or close button was clicked.
    if (target !== modal && target.classList.contains('close'))
      return;
  }

  // Hide the modal element.
  modal.classList.add('hidden');

  // Clean the body to make it ready for next modal.
  const bodyEle = modal.querySelector('.body');
  bodyEle.childNodes.forEach(v => bodyEle.removeChild(v));
}
