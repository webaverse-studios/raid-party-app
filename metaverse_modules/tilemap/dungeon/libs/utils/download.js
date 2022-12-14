export function downloadJSON(data, fileName) {
  const element = document.createElement('a');
  const file = new Blob([JSON.stringify(data, null, 2)], {
    type: 'text/json',
  });
  element.href = URL.createObjectURL(file);
  element.download = fileName;
  const added = document.body.appendChild(element);
  element.click();
  added.remove();
}
