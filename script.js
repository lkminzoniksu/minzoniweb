$(document).ready(function() {
  const $header = $('header');
  const $mainContainer = $('#content'); // main container
  const $navLinks = $('#navbar a[data-page]');
  const articleModal = new bootstrap.Modal($('#article-modal')[0]);

  function clearHeaderUpdate() { $('.header-update').remove(); }
  function clearMainContent() { $mainContainer.empty(); }

  // Fetch page HTML
  function fetchPage(page) {
    return $.get(`${page}.html`).fail(() => $.Deferred().reject("Page not found"));
  }

  // Load home cards (with modal)
  function loadHomeCards(jsonFile, containerSelector) {
    $.getJSON(jsonFile, function(data) {
      const $container = $(containerSelector);
      if (!$container.length) return;
      $container.empty();

      $.each(data.cards, function(index, card) {
        const $cardEl = $(`
          <article class="card-article">
            <img src="${card.image}" alt="${card.title}">
            <div class="card-data">
              <span class="card-description">${card.description}</span>
              <h2 class="card-title">${card.title}</h2>
              <button class="card-btn read-more-btn">Know More</button>
            </div>
          </article>
        `).appendTo($container);

        setTimeout(() => $cardEl.addClass("visible"), index * 150);

        // Show modal on click
        $cardEl.find(".read-more-btn").on("click", function() {
          $("#modal-title").text(card["article-title"]);
          $("#modal-text").html(card["article-text"].replace(/\n/g, "<br>"));
          articleModal.show();
        });
      });
    });
  }

  // Load portfolio cards (open link in new tab)
  function loadPortfolioCards(jsonFile, containerSelector) {
    $.getJSON(jsonFile, function(data) {
      const $container = $(containerSelector);
      if (!$container.length) return;
      $container.empty();

      $.each(data.projects, function(index, project) {
        const $cardEl = $(`
          <article class="card-article">
            <img src="${project.image}" alt="${project.title}">
            <div class="card-data">
              <span class="card-description">${project.description}</span>
              <h2 class="card-title">${project.title}</h2>
              <a href="${project.link}" target="_blank" class="card-btn">Know More</a>
            </div>
          </article>
        `).appendTo($container);

        setTimeout(() => $cardEl.addClass("visible"), index * 150);
      });
    });
  }

  // Load a page
  function loadPage(page) {
    // Update nav active state
    $navLinks.each(function() {
      $(this).toggleClass('active', $(this).data('page') === page);
    });
    window.location.hash = page;

    fetchPage(page)
      .done(function(html) {
        clearHeaderUpdate();
        clearMainContent();

        const $wrapper = $('<div>').html($.trim(html));

        // Append header updates
        const $headerBlock = $wrapper.find('.header-update'); 
        if ($headerBlock.length) $header.append($headerBlock);

        // Append content updates
        const $contentBlock = $wrapper.find(`.container-content.${page}-content`);
        if ($contentBlock.length) $mainContainer.append($contentBlock);

        // Load cards for specific pages
        if (page === 'home') loadHomeCards('cards.json', '#home-cards');
        if (page === 'portfolio') loadPortfolioCards('portfolio.json', '#portfolio-cards');
      })
      .fail(function() {
        clearHeaderUpdate();
        clearMainContent();

        $.get('404.html')
          .done(function(html404) {
            const $wrapper404 = $('<div>').html($.trim(html404));
            const $headerBlock404 = $wrapper404.find('.header-update'); 
            if ($headerBlock404.length) $header.append($headerBlock404);
            const $contentBlock404 = $wrapper404.find('.container-content'); 
            if ($contentBlock404.length) $mainContainer.append($contentBlock404);
          })
          .fail(function() {
            $header.append('<div class="header-update"><h1>Page not found...</h1></div>');
          });
      });
  }

  // Navbar click
  $(document).on('click touchstart', '#navbar a[data-page]', function(e) {
    e.preventDefault();
    loadPage($(this).data('page'));
  });

  // Hash change
  $(window).on('hashchange', function() {
    loadPage(window.location.hash.replace('#',''));
  });

  // Initial load
  loadPage(window.location.hash.replace('#','') || 'home');
});
