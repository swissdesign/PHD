/* =====================================
   CMS INTEGRATION UTILITIES
   Loads settings, projects, and handles
   contact form submissions via Apps Script.
   ===================================== */
(function () {
  'use strict';

  if (typeof CMS_API_BASE === 'undefined') {
    console.warn('[CMS] Missing CMS_API_BASE configuration.');
    return;
  }

  const SELECTORS = {
    setting: '[data-cms-setting]',
    projectsContainer: '#projects-list',
    contactForm: '[data-contact-form]',
    contactStatus: '[data-contact-status]'
  };

  async function fetchJson(url) {
    const response = await fetch(url, { credentials: 'omit' });
    if (!response.ok) {
      throw new Error(`CMS request failed: ${response.status}`);
    }
    return response.json();
  }

  function applySetting(element, value) {
    const text = value != null ? String(value) : '';

    if (element.tagName === 'TITLE') {
      document.title = text;
      element.textContent = text;
      return;
    }

    if (element.tagName === 'A' && element.classList.contains('hero-contact')) {
      element.textContent = text;
      element.href = text ? `mailto:${text}` : element.getAttribute('href');
      return;
    }

    element.textContent = text;
  }

  async function loadSettings() {
    const nodes = document.querySelectorAll(SELECTORS.setting);
    if (!nodes.length) return;

    const data = await fetchJson(`${CMS_API_BASE}?type=settings`);
    const map = Object.create(null);

    (data.items || []).forEach(item => {
      if (item.key) {
        map[String(item.key).trim()] = item.value;
      }
    });

    nodes.forEach(node => {
      const key = node.getAttribute('data-cms-setting');
      if (!key) return;
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        applySetting(node, map[key]);
      }
    });
  }

  function createProjectCard(project) {
    const card = document.createElement('article');
    card.className = 'project-card';

    const tags = project.tags
      ? String(project.tags).split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const thumbWrapper = document.createElement('div');
    thumbWrapper.className = 'project-thumb';

    if (project.thumbnail_url) {
      const image = document.createElement('img');
      image.src = String(project.thumbnail_url);
      image.alt = project.title ? String(project.title) : '';
      thumbWrapper.appendChild(image);
    }

    const body = document.createElement('div');
    body.className = 'project-body';

    const heading = document.createElement('h3');
    heading.textContent = project.title ? String(project.title) : '';
    body.appendChild(heading);

    const description = document.createElement('p');
    description.textContent = project.short_description
      ? String(project.short_description)
      : '';
    body.appendChild(description);

    if (tags.length) {
      const tagLine = document.createElement('p');
      tagLine.className = 'project-tags';
      tagLine.textContent = tags.map(tag => `#${tag}`).join(' ');
      body.appendChild(tagLine);
    }

    card.append(thumbWrapper, body);

    return card;
  }

  async function loadProjects() {
    const container = document.querySelector(SELECTORS.projectsContainer);
    if (!container) return;

    container.innerHTML = '<p class="projects-loading">Loading projects…</p>';

    try {
      const data = await fetchJson(`${CMS_API_BASE}?type=projects`);
      const items = Array.isArray(data.items) ? data.items : [];

      if (!items.length) {
        container.innerHTML = '<p class="projects-empty">Projects coming soon.</p>';
        return;
      }

      container.innerHTML = '';
      items.forEach(project => {
        container.appendChild(createProjectCard(project));
      });
    } catch (error) {
      console.error('[CMS] Failed to load projects', error);
      container.innerHTML = '<p class="projects-error">Unable to load projects right now.</p>';
    }
  }

  function encodeFormData(data) {
    return Object.keys(data)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');
  }

  function initContactForm() {
    const form = document.querySelector(SELECTORS.contactForm);
    if (!form) return;

    const statusNode = document.querySelector(SELECTORS.contactStatus);

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = {
        form_type: 'contact',
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        message: formData.get('message') || '',
        source_page: form.dataset.source || window.location.pathname
      };

      const body = encodeFormData(payload);

      setStatus('Sending…');
      form.classList.add('is-submitting');

      try {
        const response = await fetch(CMS_API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });

        const result = await response.json();
        if (result && result.success) {
          setStatus('Thanks! Your message is on its way.');
          form.reset();
        } else {
          throw new Error(result && result.error ? result.error : 'Unknown error');
        }
      } catch (error) {
        console.error('[CMS] Contact form error', error);
        setStatus('Something went wrong. Please try again in a moment.', true);
      } finally {
        form.classList.remove('is-submitting');
      }
    });

    function setStatus(message, isError = false) {
      if (!statusNode) return;
      statusNode.textContent = message;
      statusNode.classList.toggle('is-error', Boolean(isError));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadSettings().catch(error => console.error('[CMS] Settings error', error));
    loadProjects().catch(error => console.error('[CMS] Projects error', error));
    initContactForm();
  });
})();
