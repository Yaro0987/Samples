/* ==========================================
   CART SYSTEM - localStorage based
   ========================================== */
var Cart = {
  KEY: 'gym_cart',

  getItems: function() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch(e) { return []; }
  },

  save: function(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.updateCount();
  },

  addItem: function(item) {
    var items = this.getItems();
    var found = false;
    for (var i = 0; i < items.length; i++) {
      if (items[i].name === item.name) {
        items[i].qty += (item.qty || 1);
        found = true;
        break;
      }
    }
    if (!found) {
      item.qty = item.qty || 1;
      items.push(item);
    }
    this.save(items);
    this.showToast(item.name + ' added to cart!');
  },

  removeItem: function(index) {
    var items = this.getItems();
    items.splice(index, 1);
    this.save(items);
  },

  updateQty: function(index, qty) {
    var items = this.getItems();
    if (qty < 1) { this.removeItem(index); return; }
    items[index].qty = qty;
    this.save(items);
  },

  getTotal: function() {
    var items = this.getItems();
    var total = 0;
    for (var i = 0; i < items.length; i++) {
      total += items[i].price * items[i].qty;
    }
    return total;
  },

  getCount: function() {
    var items = this.getItems();
    var count = 0;
    for (var i = 0; i < items.length; i++) {
      count += items[i].qty;
    }
    return count;
  },

  updateCount: function() {
    var badges = document.querySelectorAll('.ec-cart-count');
    var count = this.getCount();
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = count;
      badges[i].style.display = count > 0 ? 'flex' : 'none';
    }
  },

  showToast: function(msg) {
    var toast = document.createElement('div');
    toast.className = 'ec-cart-toast';
    toast.innerHTML = '<i class="fas fa-check-circle"></i> ' + msg;
    toast.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#27ae60;color:#fff;padding:14px 24px;border-radius:8px;z-index:99999;font-size:14px;box-shadow:0 4px 20px rgba(0,0,0,0.2);animation:fadeInUp 0.3s ease;max-width:350px;';
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(function() { toast.remove(); }, 300);
    }, 2500);
  },

  clear: function() {
    localStorage.removeItem(this.KEY);
    this.updateCount();
  }
};

/* Attach click handlers to all "Add to Cart" buttons */
document.addEventListener('DOMContentLoaded', function() {
  Cart.updateCount();

  var addBtns = document.querySelectorAll('.theme-btn');
  for (var i = 0; i < addBtns.length; i++) {
    var btn = addBtns[i];
    if (btn.textContent.indexOf('Add to Cart') === -1) continue;

    (function(button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();

        var card = button.closest('.product, .pd-content, .tab-content, [class*="product"]') || button.parentElement.parentElement;
        var name = 'Product';
        var price = 0;
        var img = '';

        /* Try to find product name */
        var nameEl = card.querySelector('h3 a, h2, .pd-title, .product-name');
        if (nameEl) name = nameEl.textContent.trim();

        /* Try to find price */
        var priceEl = card.querySelector('.orgnl, .sale, .pd-sale-price, [class*="price"]');
        if (priceEl) {
          var priceText = priceEl.textContent.replace(/[^0-9.]/g, '');
          price = parseFloat(priceText) || 0;
        }

        /* Try to find image */
        var imgEl = card.querySelector('img');
        if (imgEl) img = imgEl.getAttribute('src');

        Cart.addItem({ name: name, price: price, img: img, qty: 1 });
      });
    })(btn);
  }
});


/* Site-wide search */
(function() {
  var products = [
    { name: 'Customised Gym Bottle', price: 18.60, page: 'product.html', img: 'assets/images/placeholders/ph-336x216.png' },
    { name: 'Gym Water Bottle', price: 40.00, page: 'product.html', img: 'assets/images/placeholders/ph-336x216.png' },
    { name: 'Gym Gloves Pro', price: 25.00, page: 'product.html', img: 'assets/images/placeholders/ph-336x216.png' },
    { name: 'Resistance Band Set', price: 15.50, page: 'product.html', img: 'assets/images/placeholders/ph-336x216.png' },
    { name: 'Protein Shaker', price: 12.00, page: 'product.html', img: 'assets/images/placeholders/ph-336x216.png' },
    { name: 'Yoga Mat Premium', price: 35.00, page: 'product.html', img: 'assets/images/placeholders/ph-336x216.png' },
    { name: 'Fitness Tracker Band', price: 49.99, page: 'product.html', img: 'assets/images/placeholders/ph-336x216.png' },
    { name: 'Boxing Gloves', price: 45.00, page: 'product.html', img: 'assets/images/placeholders/ph-336x216.png' },
    { name: 'Jump Rope Speed', price: 10.00, page: 'product.html', img: 'assets/images/placeholders/ph-336x216.png' }
  ];

  var pages = [
    { name: 'Our Classes', keywords: 'classes zumba yoga boxing spinning crossfit fitness training workout', page: 'our-classes.html' },
    { name: 'Class Schedule', keywords: 'schedule timetable classes timing', page: 'classes-schedule.html' },
    { name: 'Services', keywords: 'personal training coaching nutrition diet meal planning', page: 'services.html' },
    { name: 'Our Team', keywords: 'team trainer instructor coach trainer staff', page: 'our-team.html' },
    { name: 'About Us', keywords: 'about story mission vision history gym fitness', page: 'about.html' },
    { name: 'Blog', keywords: 'blog news articles tips fitness advice', page: 'our-blog-1.html' },
    { name: 'Contact', keywords: 'contact phone email address location map', page: 'contact.html' },
    { name: 'Features & Benefits', keywords: 'features benefits equipment facilities amenities', page: 'features-and-benefits.html' }
  ];

  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form.id !== 'ec-site-search') return;
    e.preventDefault();
    var q = (form.querySelector('input').value || '').trim().toLowerCase();
    if (!q) return;

    var results = [];
    products.forEach(function(p) {
      if (p.name.toLowerCase().indexOf(q) !== -1) results.push({ type: 'product', name: p.name, price: '$' + p.price.toFixed(2), page: p.page, img: p.img });
    });
    pages.forEach(function(p) {
      if (p.name.toLowerCase().indexOf(q) !== -1 || p.keywords.indexOf(q) !== -1) results.push({ type: 'page', name: p.name, page: p.page });
    });

    showSearchResults(q, results);
  });

  function showSearchResults(query, results) {
    var existing = document.getElementById('ec-search-modal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'ec-search-modal';
    var itemsHtml = '';
    if (results.length === 0) {
      itemsHtml = '<div style="padding:30px;text-align:center;color:#999;">No results found for "<strong>' + query + '</strong>"</div>';
    } else {
      results.forEach(function(r) {
        if (r.type === 'product') {
          itemsHtml += '<a href="' + r.page + '" class="ec-sr-item"><img src="' + r.img + '" alt=""><div><span class="ec-sr-name">' + r.name + '</span><span class="ec-sr-price">' + r.price + '</span></div></a>';
        } else {
          itemsHtml += '<a href="' + r.page + '" class="ec-sr-item ec-sr-page"><i class="fas fa-file-alt" style="margin-right:10px;color:#ea2127;"></i><span class="ec-sr-name">' + r.name + '</span></a>';
        }
      });
    }
    modal.innerHTML = '<div class="ec-search-overlay" onclick="this.parentElement.remove()"></div><div class="ec-search-results"><div class="ec-sr-header"><h4>Search results for "' + query + '"</h4><button onclick="document.getElementById(\'ec-search-modal\').remove()"><i class="fas fa-times"></i></button></div><div class="ec-sr-list">' + itemsHtml + '</div></div>';
    document.body.appendChild(modal);
  }
})();