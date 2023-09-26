export default function stripHtml(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;

  return tmp.textContent || tmp.innerText || '';
}
