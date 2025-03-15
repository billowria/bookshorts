export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const sanitizeHTML = (html) => {
  // Simple sanitizer; for production consider using a library like DOMPurify.
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};
