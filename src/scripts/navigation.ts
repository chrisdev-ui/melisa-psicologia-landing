const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const header = document.querySelector<HTMLElement>('[data-site-header]');
const mobileMenuButton = document.querySelector<HTMLButtonElement>('[data-mobile-menu-button]');
const mobileMenu = document.querySelector<HTMLElement>('[data-mobile-menu]');
const openIcon = document.querySelector<HTMLElement>('[data-menu-open-icon]');
const closeIcon = document.querySelector<HTMLElement>('[data-menu-close-icon]');

const allSectionLinks = Array.from(
  document.querySelectorAll<HTMLAnchorElement>('a[data-section-link]')
);

const closeMobileMenu = () => {
  if (!mobileMenu || !mobileMenuButton) return;
  mobileMenu.classList.add('hidden');
  mobileMenuButton.setAttribute('aria-expanded', 'false');
  mobileMenuButton.setAttribute('aria-label', 'Abrir menú');
  openIcon?.classList.remove('hidden');
  closeIcon?.classList.add('hidden');
};

const openMobileMenu = () => {
  if (!mobileMenu || !mobileMenuButton) return;
  mobileMenu.classList.remove('hidden');
  mobileMenuButton.setAttribute('aria-expanded', 'true');
  mobileMenuButton.setAttribute('aria-label', 'Cerrar menú');
  openIcon?.classList.add('hidden');
  closeIcon?.classList.remove('hidden');
};

mobileMenuButton?.addEventListener('click', () => {
  if (!mobileMenu) return;
  const isOpen = !mobileMenu.classList.contains('hidden');
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});


document.addEventListener('click', (event) => {
  if (!mobileMenu || !mobileMenuButton) return;
  if (mobileMenu.classList.contains('hidden')) return;

  const target = event.target;
  if (!(target instanceof Node)) return;

  const clickedInsideMenu = mobileMenu.contains(target);
  const clickedButton = mobileMenuButton.contains(target);

  if (!clickedInsideMenu && !clickedButton) {
    closeMobileMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMobileMenu();
  }
});

const sectionIds = Array.from(
  new Set(
    allSectionLinks
      .map((link) => link.getAttribute('href') || '')
      .filter((href) => href.startsWith('#') && href.length > 1)
      .map((href) => href.replace('#', ''))
  )
);

const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter((section): section is HTMLElement => Boolean(section));

const setActiveLink = (activeId: string) => {
  allSectionLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isActive = href === `#${activeId}`;
    link.classList.toggle('nav-link-active', isActive);
    link.classList.toggle('mobile-nav-link-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

const scrollToSection = (targetId: string) => {
  const target = document.getElementById(targetId);
  if (!target) return;

  const offset = (header?.offsetHeight || 0) + 12;
  const y = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: y,
    behavior: reduceMotion ? 'auto' : 'smooth',
  });
};

allSectionLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) return;

    event.preventDefault();
    const targetId = href.replace('#', '');
    scrollToSection(targetId);
    if (window.location.hash !== href) {
      history.replaceState(null, '', href);
    }
    closeMobileMenu();
  });
});

const updateActiveSection = () => {
  if (!sections.length) return;

  const checkpoint = window.scrollY + (header?.offsetHeight || 0) + 40;
  let activeId = sections[0].id;

  sections.forEach((section) => {
    if (section.offsetTop <= checkpoint) {
      activeId = section.id;
    }
  });

  setActiveLink(activeId);
};

window.addEventListener('scroll', updateActiveSection, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) closeMobileMenu();
  updateActiveSection();
});

if (window.location.hash) {
  const hashTarget = window.location.hash.replace('#', '');
  setTimeout(() => scrollToSection(hashTarget), 0);
}

updateActiveSection();
