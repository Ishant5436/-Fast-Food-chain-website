<?php
$currentPage = basename($_SERVER['SCRIPT_NAME'], '.php');
?>
<nav class="main-nav" id="mainNav">
  <div class="nav-inner">
    <a href="index.php" class="nav-brand">
      <span class="brand-icon">🍔</span>
      <span class="brand-text">CampusCrave</span>
    </a>
    <ul class="nav-links" id="navLinks">
      <li><a href="index.php" class="nav-link <?php echo $currentPage === 'index' ? 'active' : ''; ?>">Home</a></li>
      <li><a href="menu.php" class="nav-link <?php echo $currentPage === 'menu' ? 'active' : ''; ?>">Menu</a></li>
      <li><a href="cart.php" class="nav-link <?php echo $currentPage === 'cart' ? 'active' : ''; ?>">Cart <span id="navCartBadge" class="nav-badge hidden">0</span></a></li>
      <li><a href="orders.php" class="nav-link <?php echo $currentPage === 'orders' ? 'active' : ''; ?>">Orders</a></li>
      <li><a href="admin.php" class="nav-link nav-admin-link hidden" id="navAdminLink" <?php echo $currentPage === 'admin' ? 'data-active="true"' : ''; ?>>Admin</a></li>
    </ul>
    <div class="nav-right">
      <span id="navAuthStatus" class="nav-auth-status">Not signed in</span>
      <button id="navMenuToggle" class="nav-toggle" type="button" aria-label="Toggle menu">☰</button>
    </div>
  </div>
</nav>
