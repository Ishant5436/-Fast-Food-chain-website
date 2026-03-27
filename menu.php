<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menu | CampusCrave</title>
  <meta name="description" content="Browse our full campus food menu. Filter by category, search items, and add to cart.">
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <div class="bg-glow bg-glow-one"></div>
  <div class="bg-glow bg-glow-two"></div>

  <?php include __DIR__ . '/includes/header.php'; ?>

  <div class="page">
    <section>
      <div class="section-title">
        <h1>Our Menu</h1>
        <p>Pick what you are craving right now</p>
      </div>

      <div style="display:grid; grid-template-columns:1fr auto; gap:10px; margin-bottom:14px; align-items:center;">
        <input id="searchInput" type="text" placeholder="Search: burger, wraps, coffee..." style="margin:0;">
        <button id="clearFiltersBtn" type="button" style="width:auto;">Clear Filters</button>
      </div>

      <div id="categoryChips" class="chips"></div>
    </section>

    <section>
      <div class="section-title">
        <h2>Popular Near Campus</h2>
        <p id="resultCount">0 items</p>
      </div>
      <div id="menuGrid" class="menu-grid"></div>
    </section>
  </div>

  <script src="assets/shared.js"></script>
  <script src="assets/menu.js"></script>
</body>
</html>
