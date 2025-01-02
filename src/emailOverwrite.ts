
document.addEventListener('DOMContentLoaded', () => {
  const email = document.getElementsByClassName('email')[0];

  if('href' in email) {
    const addr = `${email.getAttribute("data-user")}@${email.getAttribute("data-domain")}`;
  
    email.innerHTML = addr;
    email.href = `mailto:${addr}`;
    email.classList.remove("email");
  }
})