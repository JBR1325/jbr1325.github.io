/* =========================================================
   BRINDIS BISTRO & BAR — menu-data.js
   Single source of truth for the homepage's animated menu.

   MENU UPDATE: edit BOTH this file AND /menu/index.html
   (the menu page is hand-authored static HTML so search
   engines never depend on JavaScript). Keep them in sync.
   ========================================================= */
window.BRINDIS_MENU = {
  MEZZE: [
    {name:"Hummus",            desc:"Chickpea, olive oil, garlic, lemon &amp; tahini — classic or spiced.", price:9,  tag:"VG", icon:"bowl",     photo:"hummus.webp"},
    {name:"Baba Ghanoush",     desc:"Roasted eggplant whipped with yogurt, tahini, garlic &amp; lemon.",     price:9,  tag:"VG", icon:"eggplant", photo:"baba-ghanoush.webp"},
    {name:"Dolmas",            desc:"House-made grape leaves, rolled by hand around herbed rice.",           price:9,  tag:"VG", icon:"leaf",     photo:"dolmas.webp"},
    {name:"Tabbouleh",         desc:"Cracked wheat, parsley, green onion, tomato &amp; bright lemon.",       price:9,  tag:"VG", icon:"wheat",    photo:"tabbouleh.webp"},
    {name:"Eggplant Shakshuka",desc:"Wood-fired eggplant simmered with tomato, peppers, garlic &amp; lemon.",price:9,  tag:"VT", icon:"flame",    photo:"eggplant-shakshuka.webp"},
    {name:"Garlic Shrimp",     desc:"Wood-fired shrimp in a glossy garlic-lemon sauce.",                    price:17, tag:"",   icon:"shrimp",   photo:"garlic-shrimp.webp"},
    {name:"Stuffed Mushrooms", desc:"Caps filled with garlic ricotta &amp; lemon, kissed by flame.",         price:17, tag:"VT", icon:"mushroom", photo:"stuffed-mushrooms.webp"}
  ],
  ENTREES: [
    {name:"Chicken Shish Kebab", price:20, note:"Wood-fired · rice or salad · yogurt sauce"},
    {name:"Lamb Shish Kebab",    price:22, note:"Charred over open flame"},
    {name:"Shrimp Shish Kebab",  price:20, note:"Garlic &amp; lemon"},
    {name:"Lamb Shank Dinner",   price:25, note:"Slow-braised until it falls from the bone"},
    {name:"Köfte Kebab",    price:20, note:"Beef &amp; lamb meatballs"},
    {name:"Marinated Salmon",    price:23, note:"Flame-roasted"},
    {name:"Whole Sea Bass",      price:25, note:"Mediterranean · whole-roasted"},
    {name:"Wood-Fired Steak",    price:26, note:"The flame at its boldest"},
    {name:"Turkish Pasta",       price:17, note:"Farfalle, cold yogurt-garlic, hot chili oil"},
    {name:"Pita Sandwich",       price:15, note:"Meatball, lamb or chicken · sumac salad"}
  ],
  FLATBREADS: [
    {name:"Lahmacun", price:15}, {name:"Pastrami", price:15}, {name:"Spinach &amp; Feta", price:13},
    {name:"Veggie", price:13}, {name:"Cheese", price:12}
  ],
  SALADS: [
    {name:"House Turkish Mixed Green", desc:"Arugula, romaine, spinach, red cabbage, cucumber, tomato, walnuts &amp; pine nuts.", price:13},
    {name:"Classic Caesar", desc:"Romaine, parmesan, croutons &amp; black pepper, yogurt or pomegranate dressing.", price:12}
  ],
  SWEETS: [
    {name:"Pistachio Baklava", desc:"Layered phyllo, pistachio &amp; honey.", price:8, icon:"baklava", photo:"pistachio-baklava.jpg"},
    {name:"Turkish Delight",   desc:"Rose &amp; citrus lokum, dusted in sugar.", price:8, icon:"delight", photo:"turkish-delight.jpg"},
    {name:"Rice Pudding",      desc:"Slow-cooked with cinnamon &amp; vanilla.", price:8, icon:"pudding", photo:"rice-pudding.jpg"}
  ],
  DRINKS: ["Turkish Coffee","Ayran","House Hibiscus Tea","Pomegranate Tea","Fresh Lemonade"]
};
