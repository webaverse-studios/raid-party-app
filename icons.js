const _svg2Url = s =>
  `data:image/svg+xml;base64,${btoa(s.replace(/currentColor/g, '#000'))}`;

export const code = _svg2Url(
  `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="code" class="svg-inline--fa fa-code fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M234.8 511.7L196 500.4c-4.2-1.2-6.7-5.7-5.5-9.9L331.3 5.8c1.2-4.2 5.7-6.7 9.9-5.5L380 11.6c4.2 1.2 6.7 5.7 5.5 9.9L244.7 506.2c-1.2 4.3-5.6 6.7-9.9 5.5zm-83.2-121.1l27.2-29c3.1-3.3 2.8-8.5-.5-11.5L72.2 256l106.1-94.1c3.4-3 3.6-8.2.5-11.5l-27.2-29c-3-3.2-8.1-3.4-11.3-.4L2.5 250.2c-3.4 3.2-3.4 8.5 0 11.7L140.3 391c3.2 3 8.2 2.8 11.3-.4zm284.1.4l137.7-129.1c3.4-3.2 3.4-8.5 0-11.7L435.7 121c-3.2-3-8.3-2.9-11.3.4l-27.2 29c-3.1 3.3-2.8 8.5.5 11.5L503.8 256l-106.1 94.1c-3.4 3-3.6 8.2-.5 11.5l27.2 29c3.1 3.2 8.1 3.4 11.3.4z"></path></svg>`,
);
export const boxOpen = _svg2Url(
  `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="box-open" class="svg-inline--fa fa-box-open fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M425.7 256c-16.9 0-32.8-9-41.4-23.4L320 126l-64.2 106.6c-8.7 14.5-24.6 23.5-41.5 23.5-4.5 0-9-.6-13.3-1.9L64 215v178c0 14.7 10 27.5 24.2 31l216.2 54.1c10.2 2.5 20.9 2.5 31 0L551.8 424c14.2-3.6 24.2-16.4 24.2-31V215l-137 39.1c-4.3 1.3-8.8 1.9-13.3 1.9zm212.6-112.2L586.8 41c-3.1-6.2-9.8-9.8-16.7-8.9L320 64l91.7 152.1c3.8 6.3 11.4 9.3 18.5 7.3l197.9-56.5c9.9-2.9 14.7-13.9 10.2-23.1zM53.2 41L1.7 143.8c-4.6 9.2.3 20.2 10.1 23l197.9 56.5c7.1 2 14.7-1 18.5-7.3L320 64 69.8 32.1c-6.9-.8-13.5 2.7-16.6 8.9z"></path></svg>`,
);
export const waveform = _svg2Url(
  `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="waveform" class="svg-inline--fa fa-waveform fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M328 0h-16a16 16 0 0 0-16 16v480a16 16 0 0 0 16 16h16a16 16 0 0 0 16-16V16a16 16 0 0 0-16-16zm-96 96h-16a16 16 0 0 0-16 16v288a16 16 0 0 0 16 16h16a16 16 0 0 0 16-16V112a16 16 0 0 0-16-16zm192 32h-16a16 16 0 0 0-16 16v224a16 16 0 0 0 16 16h16a16 16 0 0 0 16-16V144a16 16 0 0 0-16-16zm96-64h-16a16 16 0 0 0-16 16v352a16 16 0 0 0 16 16h16a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zM136 192h-16a16 16 0 0 0-16 16v96a16 16 0 0 0 16 16h16a16 16 0 0 0 16-16v-96a16 16 0 0 0-16-16zm-96 32H24a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h16a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm576 0h-16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h16a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"></path></svg>`,
);
export const vrCardboard = _svg2Url(
  `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="vr-cardboard" class="svg-inline--fa fa-vr-cardboard fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M608 64H32C14.33 64 0 78.33 0 96v320c0 17.67 14.33 32 32 32h160.22c25.19 0 48.03-14.77 58.36-37.74l27.74-61.64C286.21 331.08 302.35 320 320 320s33.79 11.08 41.68 28.62l27.74 61.64C399.75 433.23 422.6 448 447.78 448H608c17.67 0 32-14.33 32-32V96c0-17.67-14.33-32-32-32zM160 304c-35.35 0-64-28.65-64-64s28.65-64 64-64 64 28.65 64 64-28.65 64-64 64zm320 0c-35.35 0-64-28.65-64-64s28.65-64 64-64 64 28.65 64 64-28.65 64-64 64z"></path></svg>`,
);
export const tShirt = _svg2Url(
  `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="tshirt" class="svg-inline--fa fa-tshirt fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M638 121c-3.3-9.8-10.2-17.8-19.5-22.4L420.2 0c-9.5 13.2-28.4 50.3-100.2 50.3-72.4 0-91.1-37.7-100.2-50.3L21.6 98.6C12.3 103.2 5.3 111.2 2 121c-3.3 9.9-2.6 20.4 2.1 29.7l53 106.2c9.6 19.2 33 27 51.6 17.7l24-11.3c5.3-2.5 11.4 1.4 11.4 7.2v185.3c0 31 25.1 56.2 56 56.2h240c30.9 0 56-25.2 56-56.2V270.6c0-5.9 6.1-9.7 11.4-7.2l23.5 11.1c19.1 9.7 42.5 1.8 52.1-17.4l53-106.2c4.4-9.5 5.2-20 1.9-29.9zm-94 106.4l-73.2-34.6c-10.6-5-22.8 2.7-22.8 14.5v248.6c0 4.4-3.6 8-8 8H200c-4.4 0-8-3.6-8-8V207.3c0-11.7-12.2-19.5-22.8-14.5L96 227.4l-44.8-89.9 155.5-77.3c26.4 24 67.8 38.3 113.3 38.3s86.9-14.3 113.2-38.2l155.5 77.3-44.7 89.8z"></path></svg>`,
);
export const cube = _svg2Url(
  `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="cube" class="svg-inline--fa fa-cube fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M239.1 7.5l-208 78c-18.7 7-31.1 25-31.1 45v225.1c0 18.2 10.3 34.8 26.5 42.9l208 104c13.5 6.8 29.4 6.8 42.9 0l208-104c16.3-8.1 26.5-24.8 26.5-42.9V130.5c0-20-12.4-37.9-31.1-44.9l-208-78C262 3.4 250 3.4 239.1 7.5zm16.9 45l208 78v.3l-208 84.5-208-84.5v-.3l208-78zM48 182.6l184 74.8v190.2l-184-92v-173zm232 264.9V257.4l184-74.8v172.9l-184 92z"></path></svg>`,
);
