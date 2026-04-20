// Data model — each entry in the coffees array has this shape:
//
// {
//   name: string           — display name of the origin
//   region: string         — geographic region (e.g. "East Africa")
//   roast: string          — reference roast level (e.g. "Light–Medium")
//   process: string        — processing method (e.g. "Washed", "Natural")
//   note: string           — short tasting note shown on the card (3 terms)
//   scores: number[6]      — flavor scores 1–10, in DIMS order:
//                            [Fruity, Floral, Sweet, Nutty, Spicy, Earthy]
//   brewMethods: string[]  — recommended brew methods for this origin
//   cultivars: string[]    — notable cultivars/varieties grown at this origin
//   highlights: Array[6]   — one entry per dimension, in DIMS order.
//                            null means that dimension is not a defining
//                            characteristic of this origin (not that it's
//                            absent). Non-null entries have:
//     {
//       tags: string[]     — flavor tag chips shown in the UI
//       note: string       — curated tasting note explaining the score
//     }
// }

export const coffees = [
  {
    name: "Ethiopian",
    region: "East Africa",
    scores: [8, 10, 8, 2, 2, 1],
    note: "Jasmine · Bergamot · Blueberry",
    roast: "Light",
    process: "Washed",
    brewMethods: ["Pour Over", "Chemex", "AeroPress", "Cold Brew"],
    cultivars: ["Heirloom", "Kurume", "Wolisho", "74110"],
    highlights: [
      {
        tags: ["🫐 Blueberry", "🍋 Bergamot", "🍊 Tangerine"],
        note: "Washed Yirgacheffe delivers citrus-toned stone fruit with tea-like precision — the cleanest, brightest fruit expression in African coffee.",
      },
      {
        tags: ["🌸 Jasmine", "🌿 Bergamot", "💐 Narcissus"],
        note: "The world's benchmark for floral intensity. Top-grade Yirgacheffe G1 is often described as perfumed — jasmine and narcissus aromatics that no other origin can match.",
      },
      {
        tags: ["🍯 Honey", "🍵 Lemon Verbena", "🟤 Brown Sugar"],
        note: "A silky, tea-like sweetness without heaviness. Natural sugars are preserved by careful double-fermentation washing at top stations like Deri Kochoha and Idido.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Colombian",
    region: "South America",
    scores: [8, 5, 8, 3, 2, 2],
    note: "Red Cherry · Tropical Fruit · Caramel",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "Espresso", "AeroPress", "Drip"],
    cultivars: ["Castillo", "Caturra", "Colombia", "Bourbon", "Tabi"],
    highlights: [
      {
        tags: ["🍒 Red Cherry", "🍇 Blackberry", "🍊 Blood Orange"],
        note: "The best Huila and Nariño micro-lots are vivid and fruit-forward — red cherry, blackberry, and tropical guava with a bright, clean tartness that distinguishes specialty-grade Colombian from commodity lots.",
      },
      {
        tags: ["🌸 Violet", "🌸 Jasmine"],
        note: "High-altitude farms in Nariño (1,700–2,300 MASL) produce a subtle floral lift — violet and jasmine notes that complement the dominant fruit character.",
      },
      {
        tags: ["🍮 Caramel Panela", "🟤 Brown Sugar", "🍫 Milk Chocolate"],
        note: "Panela (raw cane sugar) sweetness is the Colombian hallmark — rich, unrefined caramel depth with a smooth, medium body. Cup of Excellence Huila lots consistently score 90–94 for this profile.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Kenyan",
    region: "East Africa",
    scores: [9, 5, 7, 2, 3, 1],
    note: "Blackcurrant · Blood Orange · Brown Sugar",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "Chemex", "AeroPress", "Cold Brew"],
    cultivars: ["SL28", "SL34", "Ruiru 11", "Batian"],
    highlights: [
      {
        tags: ["🍇 Blackcurrant", "🍊 Blood Orange", "🍅 Tomato Sweetness"],
        note: "Kenya SL28 and SL34 — selected at Scott Agricultural Labs in 1935 — produce the world's most vivid blackcurrant and citrus acidity. The 'tomato sweetness' unique to SL28 is a defining cup characteristic found nowhere else.",
      },
      {
        tags: ["🌿 Bergamot", "🍵 Black Tea"],
        note: "A tea-like aromatic complexity lifts Kenyan coffee above the fruit — bergamot and English Breakfast tea aromatics give depth beyond the dominant berry profile.",
      },
      {
        tags: ["🟤 Brown Sugar", "🍷 Molasses", "🍬 Wine-like"],
        note: "Kenya's double-soak washing method (pulp → 24hr ferment → rinse → overnight soak) produces exceptional clean sweetness. The 'wine-like' quality is not ferment defect but genuine fruit sugar complexity.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Sumatran",
    region: "Indonesia",
    scores: [2, 1, 5, 4, 5, 10],
    note: "Cedar · Bittersweet Cocoa · Tobacco",
    roast: "Medium–Dark",
    process: "Wet-Hulled",
    brewMethods: ["French Press", "Drip", "Espresso", "Cold Brew"],
    cultivars: ["Typica", "Ateng", "Bourbon"],
    highlights: [
      null,
      null,
      {
        tags: ["🍫 Bittersweet Cocoa", "🍂 Rustic Molasses"],
        note: "Wet-hulled processing (Giling Basah) transforms the bean's natural sugars into a distinctive dark, rustic sweetness — not clean caramel but deep, almost fermented complexity.",
      },
      null,
      {
        tags: ["🪵 Cedar", "🌶️ Black Pepper", "🍂 Clove"],
        note: "The wet-hull process and Indonesia's humid growing conditions at 1,200–1,500 MASL (Gayo Highlands, Aceh) create a spice character unlike any other origin — cedar-dominant with peppery warmth.",
      },
      {
        tags: ["🌍 Peat", "🍂 Tobacco", "🌿 Dark Earth"],
        note: "Sumatra's earthy profile is the most extreme on Earth — a defining terroir expression from the Giling Basah process, where parchment is removed at 50% moisture, fundamentally altering the bean's cellular structure.",
      },
    ],
  },
  {
    name: "Brazilian",
    region: "South America",
    scores: [5, 3, 8, 9, 2, 3],
    note: "Dark Chocolate · Hazelnut · Dried Apricot",
    roast: "Medium–Dark",
    process: "Natural",
    brewMethods: ["Espresso", "French Press", "Moka Pot", "Cold Brew"],
    cultivars: ["Bourbon Amarelo", "Yellow Catuaí", "Mundo Novo", "Typica"],
    highlights: [
      {
        tags: ["🍑 Dried Apricot", "🍇 Raisin", "🍒 Red Cherry"],
        note: "Brazil's natural (dry) processing allows fruit sugars to absorb into the bean during drying — producing a subtle but genuine stone fruit and dried fruit character beneath the dominant chocolate-nut profile.",
      },
      null,
      {
        tags: ["🍫 Dark Chocolate", "🟤 Brown Sugar", "🍮 Caramel Toffee"],
        note: "Top Sul de Minas and Carmo de Minas naturals score 93–95 at Coffee Review with consistent notes of 'baker's chocolate, caramel, and pistachio.' The global espresso blend benchmark for sweetness and body.",
      },
      {
        tags: ["🌰 Hazelnut", "🥜 Almond", "🍫 Cocoa Powder"],
        note: "The most celebrated nutty profile in coffee. Brazilian Bourbon Amarelo and Yellow Catuaí naturals define the hazelnut-cocoa dimension. Roasted medium-dark, the nutty depth is unmatched by any other origin.",
      },
      null,
      null,
    ],
  },
  {
    name: "Guatemalan",
    region: "Central America",
    scores: [5, 4, 8, 6, 3, 2],
    note: "Milk Chocolate · Caramel · Meyer Lemon",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "French Press", "Espresso", "Drip"],
    cultivars: ["Bourbon", "Caturra", "Catuaí", "Typica", "Pache"],
    highlights: [
      {
        tags: ["🍋 Meyer Lemon", "🍑 Peach", "🍎 Orchard Fruit"],
        note: "High-altitude Antigua and Huehuetenango coffees (1,500–2,000 MASL, grown in volcanic soil) show clean, precise orchard fruit brightness — more restrained than Ethiopian but with excellent clarity.",
      },
      {
        tags: ["🌸 Magnolia", "🌸 Light Floral"],
        note: "Antigua's microclimate — surrounded by three volcanoes — produces a gentle magnolia and floral lift that distinguishes it from other Central American origins.",
      },
      {
        tags: ["🍫 Milk Chocolate", "🍮 Dulce de Leche", "🟤 Brown Sugar"],
        note: "Rich, milk-chocolate sweetness with a dulce de leche character is the Antigua signature — volcanic soil and a freeze-free climate at 1,500–1,700 MASL concentrate sugars in the cherry.",
      },
      {
        tags: ["🌰 Cashew", "🌰 Almond", "🍫 Dark Cocoa"],
        note: "Distinctive cocoa and light nut character from high-altitude Bourbon and Caturra varietals. Huehuetenango Bourbon lots are especially prized for this quality.",
      },
      null,
      null,
    ],
  },
  {
    name: "Costa Rican",
    region: "Central America",
    scores: [7, 4, 9, 4, 2, 1],
    note: "Wild Honey · Apricot · Caramel",
    roast: "Light–Medium",
    process: "Honey",
    brewMethods: ["Pour Over", "AeroPress", "Chemex", "Espresso"],
    cultivars: ["Caturra", "Villa Sarchi", "Catuaí", "Typica"],
    highlights: [
      {
        tags: ["🍑 Apricot", "🍒 Red Cherry", "🍎 Red Apple"],
        note: "Costa Rica's honey process leaves the mucilage intact during drying (Yellow Honey = 50–75%, Red Honey = 75–100%), creating a fruit clarity that's cleaner than a natural but richer than a washed — apricot and red cherry without ferment complexity.",
      },
      null,
      {
        tags: ["🍯 Wild Honey", "🌾 Cane Sugar", "🍮 Caramel"],
        note: "The honey process was invented in Costa Rica's Tarrazú region — and no origin on Earth expresses honey sweetness more cleanly. The mucilage sugars dry into the bean, producing an almost confectionery sweetness without artificial character.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Yemeni",
    region: "Middle East",
    scores: [7, 5, 7, 3, 9, 5],
    note: "Cardamom · Dried Apricot · Dark Chocolate",
    roast: "Medium",
    process: "Natural",
    brewMethods: ["Ibrik / Turkish", "French Press", "Chemex", "Espresso"],
    cultivars: ["Udaini", "Dawairi", "Jaadi", "Tufahi"],
    highlights: [
      {
        tags: ["🍇 Raisin", "🍑 Dried Apricot", "🫐 Fig"],
        note: "Ancient dry-processed Yemeni heirloom coffees — dried on mountain rooftops at 1,500–2,500 MASL — concentrate sugars to produce complex dried fruit unlike any other natural-process origin.",
      },
      {
        tags: ["🌿 Aromatic Herb", "🌸 Lemon Verbena"],
        note: "A subtle herbal floral lift from Yemen's ancient heirloom varieties (Mattari, Haimi, Kholani) — grown in terraced mountain farms with no modern varietals introduced since the 15th century.",
      },
      {
        tags: ["🍷 Wine-like", "🍮 Tamarind", "🍯 Dark Honey"],
        note: "Extreme water stress on terraced mountain farms concentrates sugars to near-wine complexity. Sweet Maria's describes the sweetness as 'fermented tamarind meets dark honey' — unlike any other origin.",
      },
      null,
      {
        tags: ["🌿 Cardamom", "🍂 Cinnamon", "🌶️ Dry Pepper"],
        note: "Yemen's spice profile is the most complex in coffee — born of ancient heirloom genetics and a desert-dry climate. Cardamom, dry cinnamon, and aromatic pepper are intrinsic to the bean, not the roast or preparation.",
      },
      {
        tags: ["🪵 Aromatic Cedar", "🍂 Leather", "🌍 Tobacco"],
        note: "The Port of Mocha is coffee's oldest trade origin. Yemen's earthy depth — cedar, leather, tobacco — reflects terroir from some of the world's oldest continuously cultivated coffee farms.",
      },
    ],
  },
  {
    name: "Jamaican Blue Mountain",
    region: "Caribbean",
    scores: [4, 5, 8, 5, 3, 2],
    note: "Chocolate · Orange Peel · Sweet Herbs",
    roast: "Medium",
    process: "Washed",
    brewMethods: ["Chemex", "Pour Over", "Drip", "French Press"],
    cultivars: ["Blue Mountain Typica"],
    highlights: [
      null,
      {
        tags: ["🌸 Jasmine", "🌸 Magnolia", "🌿 Sweet Herb"],
        note: "The Blue Mountain's misty, slow-ripening climate (cherries take longer to mature here than almost anywhere else on Earth) produces delicate floral and herbal aromatics — jasmine, magnolia, fresh mint as the cup cools.",
      },
      {
        tags: ["🍫 Mild Chocolate", "🍊 Orange Peel", "🌾 Cream"],
        note: "Jamaica Blue Mountain's celebrated cup is built on balance and absence of defect rather than bold statement flavors — a gentle milk chocolate sweetness, fresh citrus peel, and creamy body with virtually zero bitterness.",
      },
      {
        tags: ["🌰 Walnut", "🍫 Cocoa"],
        note: "Blue Mountain Typica — a centuries-old locally-adapted Typica cultivar — produces a subtle walnut and cocoa nuttiness that adds structure to the otherwise delicate, mild profile.",
      },
      null,
      null,
    ],
  },
  {
    name: "Hawaiian Kona",
    region: "Pacific",
    scores: [5, 5, 8, 7, 2, 1],
    note: "Macadamia · Caramel Toffee · Peach",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "Drip", "French Press", "Cold Brew"],
    cultivars: ["Kona Typica"],
    highlights: [
      {
        tags: ["🍑 Peach", "🍒 Fresh Cherry", "🍊 Light Citrus"],
        note: "Kona's volcanic basalt soil (Hualalai and Mauna Loa slopes) and cool diurnal temperature swings contribute a clean, subtle stone fruit character — peach and fresh cherry that shine at light-medium roast.",
      },
      {
        tags: ["🌸 Jasmine", "🌿 Chamomile"],
        note: "Delicate jasmine and chamomile florals distinguish Kona from other Pacific origins. These are notably present in Peaberry Kona, which concentrates flavor by developing only one seed per cherry.",
      },
      {
        tags: ["🍮 Caramel Toffee", "🍯 Honey", "🟤 Brown Sugar"],
        note: "Silky caramel toffee sweetness is Kona's most consistent character — praised by Big Island Coffee Roasters and Coffee Review alike. Medium roast develops toffee depth without losing the honey-like finish.",
      },
      {
        tags: ["🌰 Macadamia", "🥜 Butternut"],
        note: "Kona's signature macadamia nuttiness — found in no other origin — is the result of Hawaii's unique volcanic soil chemistry and the locally-adapted Kona Typica cultivar. Peaberry Kona intensifies this character further.",
      },
      null,
      null,
    ],
  },
  {
    name: "Vietnamese",
    region: "Southeast Asia",
    scores: [1, 1, 6, 7, 3, 8],
    note: "Dark Chocolate · Roasted Walnut · Dark Caramel",
    roast: "Dark",
    process: "Natural",
    brewMethods: ["Phin Filter", "Espresso", "Moka Pot", "Cold Brew"],
    cultivars: ["Robusta", "Catimor"],
    highlights: [
      null,
      null,
      {
        tags: ["🍫 Dark Chocolate", "🍮 Dark Caramel", "🍬 Dried Date"],
        note: "Robusta roasted dark transforms inherent bitterness into bold chocolate and dark caramel — the foundation for Vietnam's iconic cà phê sữa đá (iced condensed milk coffee). The dark roast is integral to the flavour system, not a defect.",
      },
      {
        tags: ["🌰 Roasted Walnut", "🍫 Cocoa Powder"],
        note: "Vietnamese Robusta (Dak Lak Province, Central Highlands) carries 2× the caffeine of Arabica and a heavier, more bitter nutty base — roasted walnut and cocoa powder notes that hold up under condensed milk and ice.",
      },
      null,
      {
        tags: ["🌍 Deep Earth", "🪵 Musty Wood", "🌿 Loam"],
        note: "The most earthy Robusta profile in Southeast Asia — a pronounced forest-floor character from Dak Lak's dense humid growing conditions. This earthiness is the signature of Vietnamese phin coffee, not a flaw.",
      },
    ],
  },
  {
    name: "Peruvian",
    region: "South America",
    scores: [6, 4, 7, 5, 2, 2],
    note: "Orange Zest · Milk Chocolate · Brown Sugar",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "Chemex", "Drip", "AeroPress"],
    cultivars: ["Typica", "Caturra", "Bourbon", "Catimor"],
    highlights: [
      {
        tags: ["🍋 Orange Zest", "🫐 Plum", "🍑 Passion Fruit"],
        note: "High-altitude Cajamarca coffees (1,600–2,000 MASL) show clean, precise fruit with gentle acidity — orange zest and passion fruit are characteristic of the best Cup of Excellence Peru lots.",
      },
      null,
      {
        tags: ["🍫 Milk Chocolate", "🍮 Toffee", "🟤 Brown Sugar"],
        note: "Consistent, dependable sweetness is Peru's calling card. FTO-certified washed lots from La Prosperidad de Chirinos and other Cajamarca cooperatives deliver milk chocolate and brown sugar in every cup.",
      },
      {
        tags: ["🌰 Almond", "🥜 Mild Nut"],
        note: "A gentle almond undertone from Caturra and Bourbon varietals rounds out the finish — light enough to complement rather than dominate the fruit and chocolate foundation.",
      },
      null,
      null,
    ],
  },
  {
    name: "Mexican",
    region: "North America",
    scores: [5, 4, 7, 6, 2, 2],
    note: "Milk Chocolate · Almond · Orange Zest",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "Drip", "French Press", "Cold Brew"],
    cultivars: ["Typica", "Bourbon", "Caturra", "Mundo Novo"],
    highlights: [
      {
        tags: ["🍊 Orange Zest", "🍑 Peach", "🍋 Mild Citrus"],
        note: "Oaxacan Pluma Hidalgo — a centuries-old Typica descendant grown in the coastal Sierra Madre — shows clean, delicate citrus and peach notes. Perfect Daily Grind describes top Mexican coffees as 'a good white wine': dry, bright, nuanced.",
      },
      {
        tags: ["🌸 Floral Cream", "🌿 Herbal"],
        note: "Shade-grown at 900–1,700 MASL with slow cherry development, Oaxacan and Chiapas coffees develop a subtle floral-cream aroma — more delicate than Colombian or Ethiopian but distinctive in its own right.",
      },
      {
        tags: ["🍫 Milk Chocolate", "🍮 Caramel", "🍁 Maple"],
        note: "Chiapas coffees from the volcanic Sierra Madre (1,300–1,700 MASL) deliver consistent milk chocolate and maple sweetness — a well-rounded, accessible profile that has won 90+ Coffee Review scores in recent years.",
      },
      {
        tags: ["🌰 Almond", "🥜 Pecan", "🍫 Cocoa"],
        note: "Nutty and chocolaty notes from Caturra, Bourbon, and the traditional Pluma Typica varietals define the easygoing Mexican profile — pecan and almond without the boldness of Brazilian or Guatemalan.",
      },
      null,
      null,
    ],
  },
  {
    name: "Rwandan",
    region: "East Africa",
    scores: [8, 7, 8, 2, 5, 1],
    note: "Red Cherry · Clove · Caramelized Sugar",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "AeroPress", "Chemex", "Cold Brew"],
    cultivars: ["Bourbon", "Mayaguez 71", "Jackson"],
    highlights: [
      {
        tags: ["🍒 Red Cherry", "🍊 Mandarin", "🫐 Red Currant"],
        note: "Rwanda's double-washed Bourbon (1,700–2,000 MASL, volcanic nitrogen-rich soils) produces the most vivid red cherry and mandarin brightness in East Africa — a profile often described as 'the Kenyan acidity of Ethiopia's sweetness.'",
      },
      {
        tags: ["🌹 Rose", "🌸 Orange Blossom", "🌺 Hibiscus"],
        note: "Rwandan washed Bourbon is among the most floral in the African coffee belt — rose, orange blossom, and hibiscus aromatics from the locally-adapted Mayaguez Bourbon cultivar that has grown here for over a century.",
      },
      {
        tags: ["🍮 Caramelized Sugar", "🍬 Toffee", "🟤 Brown Sugar"],
        note: "The combination of Bourbon genetics, high altitude, and Rwanda's 245 precision washing stations produces exceptional caramel sweetness. ~60% of Rwanda's crop achieves specialty grade — one of the highest rates globally.",
      },
      null,
      {
        tags: ["🍂 Clove", "🌶️ Allspice", "🍂 Cinnamon"],
        note: "A notable spice character — clove and allspice — distinguishes Rwandan Bourbon from other East African origins. This is a natural expression of the Bourbon varietal at altitude, not a processing artifact.",
      },
      null,
    ],
  },
  {
    name: "Indian Monsoon",
    region: "South Asia",
    scores: [1, 1, 5, 6, 9, 9],
    note: "Sandalwood · Cardamom · Dark Chocolate",
    roast: "Medium–Dark",
    process: "Monsooned",
    brewMethods: ["Espresso", "French Press", "Moka Pot", "Cold Brew"],
    cultivars: ["Kent", "S795", "Chandragiri", "Cauvery"],
    highlights: [
      null,
      null,
      {
        tags: ["🍫 Dark Chocolate", "🌾 Malt", "🍮 Salted Caramel"],
        note: "The monsoon process (exposing green coffee to humid coastal winds for 12–16 weeks in open Kerala/Karnataka warehouses) strips acidity entirely and amplifies a heavy, malty sweetness — salted caramel and dark chocolate with almost zero brightness.",
      },
      {
        tags: ["🪵 Sandalwood", "🌰 Cedar", "🍫 Cocoa"],
        note: "Woody and chocolaty notes emerge from S795 and Chandragiri varietals monsooned at sea level on India's Malabar Coast — the process recreates what 18th-century sailing ships did accidentally to Indian coffee on the voyage to Europe.",
      },
      {
        tags: ["🌿 Cardamom", "🍂 Clove", "🌶️ Black Pepper", "🌿 Nutmeg"],
        note: "Indian Monsoon Malabar AA carries the most complex spice profile in all of coffee — cardamom, clove, black pepper, and nutmeg that evoke masala chai. This is intrinsic to the monsooned bean, present before any spices are added to the cup.",
      },
      {
        tags: ["🪵 Wet Wood", "🌍 Peat", "🍄 Mushroom"],
        note: "The monsoon exposure creates an unmistakably deep, musty earthiness — the 'AA' grade monsoon beans swell to nearly twice their original volume during the process, absorbing the humid coastal air and its characteristic terroir.",
      },
    ],
  },
  {
    name: "Panama Geisha",
    region: "Central America",
    scores: [8, 10, 8, 1, 1, 1],
    note: "Jasmine · Bergamot · Peach Nectar",
    roast: "Light",
    process: "Washed",
    brewMethods: ["Pour Over", "Chemex", "AeroPress"],
    cultivars: ["Geisha"],
    highlights: [
      {
        tags: ["🍑 Apricot", "🍊 Tangerine", "🍇 Redcurrant"],
        note: "Geisha's fruit character is defined by precision rather than intensity — tangerine zest, apricot, and redcurrant with a tea-like clarity. The 96-point Coffee Review Hacienda La Esmeralda described it as 'delicately sweet-tart, juicy acidity, with very full syrupy mouthfeel.'",
      },
      {
        tags: ["🌸 Jasmine", "🌿 Bergamot", "🌸 Lilac", "🌸 Orange Blossom"],
        note: "Panama Geisha defines the ceiling of floral intensity in specialty coffee. The Jaramillo farm at Hacienda La Esmeralda (1,950+ MASL) produces the most consistently 'perfumed' cup ever measured — often described as wearing jasmine as a cologne, not just tasting it.",
      },
      {
        tags: ["🍯 Peach Nectar", "🍫 Cocoa Nib", "🟤 Silky Honey"],
        note: "The washed Geisha's sweetness is unique — a cocoa nib and peach nectar combination that justifies auction prices of $800–$10,000+ per pound. The silky body at light roast is arguably the best mouthfeel in coffee.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Burundian",
    region: "East Africa",
    scores: [8, 8, 8, 2, 3, 1],
    note: "Honeysuckle · Mulberry · Apricot",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "Chemex", "AeroPress", "Cold Brew"],
    cultivars: ["Bourbon", "Jackson"],
    highlights: [
      {
        tags: ["🍇 Mulberry", "🍑 Dried Apricot", "🍊 Clementine"],
        note: "Intelligentsia's Burundi Yandaro: 'dried apricot, bright clementine, sweet persimmon, remarkable clarity.' Kayanza Province (1,700–1,900 MASL) produces some of the cleanest, most complex berry and stone fruit in all of East Africa.",
      },
      {
        tags: ["🌿 Honeysuckle", "🌸 Jasmine", "🌺 Hibiscus"],
        note: "Burundi's nearly-exclusive Bourbon varietal produces exceptional floral intensity — honeysuckle and hibiscus notes that rival Rwanda and approach Ethiopian Yirgacheffe. Blue Bottle's Burundi Kayanza Ninga (91 Coffee Review points) was described as 'gentle and sweetly bright with honeysuckle and mulberry.'",
      },
      {
        tags: ["🍮 Caramelized Sugar", "🍯 Honey", "🍵 Sweet Tea"],
        note: "A juicy, full-body sweetness from double-washed Bourbon at high altitude. Intelligentsia's Burundi Karyenda: 'tangerine and black plum, sugarcane, almond, vanilla, juicy acidity, sweet tea finish' — consistently among the cleanest and sweetest in Africa.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Tanzanian",
    region: "East Africa",
    scores: [8, 4, 6, 2, 4, 2],
    note: "Blackcurrant · Dark Plum · Bergamot",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "Chemex", "French Press", "AeroPress"],
    cultivars: ["Bourbon", "Kent", "N39", "Arusha"],
    highlights: [
      {
        tags: ["🍇 Blackcurrant", "🫐 Dark Plum", "🍓 Wild Berry"],
        note: "Tanzania Peaberry (5–9% of each crop, sorted by density) concentrates the blackcurrant-to-dark-chocolate transition that defines top Kilimanjaro and Arusha washed lots. Espresso Coffee Guide: 'vivid fruit-toned acidity, notes of black currant softening to chocolate — classic and unforgettable.'",
      },
      null,
      {
        tags: ["🍵 Black Tea", "🟤 Brown Sugar"],
        note: "A distinctive tea-like quality found in both Peaberry and AA grades — the Blue Mountain and Bourbon varietals grown on Kilimanjaro's slopes (1,200–1,900 MASL) produce a refined, clean sweetness that complements the dominant berry acidity.",
      },
      null,
      {
        tags: ["🌶️ Black Pepper", "🪵 Cedar"],
        note: "A subtle spice-and-cedar note in the finish — more restrained than Kenyan but adding depth to an otherwise fruit-forward profile. Present as the cup cools, typical of washed lots from the Southern Highlands (Mbeya, Ruvuma).",
      },
      null,
    ],
  },
  {
    name: "Honduran",
    region: "Central America",
    scores: [5, 3, 8, 6, 2, 2],
    note: "Dark Chocolate · Caramel · Orange Zest",
    roast: "Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "Espresso", "French Press", "Drip"],
    cultivars: ["Catuaí", "Lempira", "IHCAFE 90", "Typica", "Bourbon"],
    highlights: [
      {
        tags: ["🍊 Orange Zest", "🍑 Peach", "🍒 Mild Cherry"],
        note: "Copán and Marcala farms (1,200–1,700 MASL) produce clean, fruit-forward cups with a Copán-specific orange-zest and dark chocolate combination. Cup of Excellence Honduras lots from El Paraíso have won 90–94 points with 'guava, mandarin, and melon' notes.",
      },
      null,
      {
        tags: ["🍫 Dark Chocolate", "🍮 Caramel", "🍯 Honey"],
        note: "Honduras became Central America's largest coffee producer in 2012, and its sweet profile reflects altitude-driven sugar development. Marcala — Honduras's only Denomination of Origin — is particularly prized for its caramel and honey sweetness from slow-maturing cherries.",
      },
      {
        tags: ["🥜 Pecan", "🌰 Walnut", "🍫 Mild Cocoa"],
        note: "Pacamara and Bourbon varietals in Copán deliver a mild nut-cocoa depth — understated enough to let the fruit and chocolate shine, but persistent through the finish.",
      },
      null,
      null,
    ],
  },
  {
    name: "Papua New Guinea",
    region: "Pacific",
    scores: [5, 2, 6, 6, 3, 7],
    note: "Dark Chocolate · Almond · Cedar",
    roast: "Medium",
    process: "Washed",
    brewMethods: ["French Press", "Drip", "Espresso", "Cold Brew"],
    cultivars: ["Typica", "Blue Mountain", "Arusha", "Mundo Novo"],
    highlights: [
      {
        tags: ["🍑 Dried Apricot", "🍇 Wild Berry", "🍷 Port-like"],
        note: "Sigri Estate (Wahgi Valley, 1,550+ MASL) — PNG's most celebrated washed lot — shows a port-like red wine fruit character. Two Brothers Coffee Roasters: 'dark chocolate, almond, cedar, red wine, aroma of soil after fresh rainfall.'",
      },
      null,
      {
        tags: ["🟤 Brown Sugar", "🍫 Dark Chocolate", "🍮 Caramel"],
        note: "Sigri's estate model (hand-picked, rigorous wet factory) produces a reliable medium-dark sweetness — brown sugar and dark chocolate that develop fully at medium roast. The Blue Mountain genetics from post-WWII varietal research give PNG a cleaner cup than other Pacific islands.",
      },
      {
        tags: ["🌰 Almond", "🪵 Cedar", "🍫 Cocoa"],
        note: "Blue Mountain, Arusha, and Mundo Novo varietals contribute a woody almond-cocoa character — heavier and more cedar-forward than Kona's macadamia nuttiness, fitting for a Pacific island origin.",
      },
      null,
      {
        tags: ["🌍 Forest Floor", "🪵 Damp Wood", "🍄 Mushroom"],
        note: "PNG's earthy depth comes from humid highland growing conditions — less extreme than wet-hulled Sumatran but with a distinctive forest-floor and damp wood character. French Press is universally recommended to let these earthy oils express fully.",
      },
    ],
  },
  {
    name: "Ethiopian Harrar",
    region: "East Africa",
    scores: [9, 4, 7, 2, 3, 3],
    note: "Blueberry Jam · Dark Winey Fruit · Tamarind",
    roast: "Light–Medium",
    process: "Natural",
    brewMethods: ["Pour Over", "French Press", "AeroPress", "Cold Brew"],
    cultivars: ["Heirloom", "Longberry", "Shortberry"],
    highlights: [
      {
        tags: ["🫐 Blueberry Jam", "🍇 Winey Dark Fruit", "🍒 Black Cherry"],
        note: "Ethiopia's eastern Harrar highlands (1,400–2,100 MASL) produce the most intense wild blueberry and dark-fruit profile in coffee. Dry-processed on rooftops and raised beds using ancient Longberry and Shortberry heirloom varieties, Harrar's fruit is feral compared to the clean washed Yirgacheffe — more concentrated, more ferment-forward, and unmistakably wild.",
      },
      {
        tags: ["🌸 Dried Rose", "🌿 Dried Herb"],
        note: "A darker, more complex floral quality than Yirgacheffe — dried rose and aromatic herb rather than jasmine brightness. These emerge as the cup cools and reflect the ancient heirloom genetics that have grown in Harrar's dry eastern plateau for centuries without introduction of modern varietals.",
      },
      {
        tags: ["🍷 Tamarind", "🍫 Dark Fruit Compote", "🍯 Molasses"],
        note: "Harrar naturals achieve a near-wine sweetness from the dry-process method — tamarind, molasses, and dark fruit compote. Sweet Maria's describes top Harrar lots as 'hedonistic overload of blueberry, wine, and dark sugar' — a sweetness defined by fermented complexity rather than clean caramel.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Sulawesi Toraja",
    region: "Indonesia",
    scores: [5, 2, 6, 5, 5, 8],
    note: "Dark Chocolate · Black Cherry · Pipe Tobacco",
    roast: "Medium–Dark",
    process: "Wet-Hulled",
    brewMethods: ["French Press", "Drip", "Espresso", "Moka Pot"],
    cultivars: ["S795", "Typica", "Catimor"],
    highlights: [
      {
        tags: ["🍒 Black Cherry", "🍇 Dark Plum", "🍑 Dried Stone Fruit"],
        note: "Toraja — grown on Sulawesi's central highlands (1,400–2,000 MASL) — has more fruit presence than Sumatran wet-hulled lots. Dark cherry and dried plum emerge clearly beneath the chocolate and earth, a product of the less extreme wet-hull conditions compared to Aceh/Gayo. The Toarco Estate (managed by Japan's Key Coffee since 1976) is the benchmark for consistency.",
      },
      null,
      {
        tags: ["🍫 Dark Chocolate", "🟤 Brown Sugar", "🍮 Rustic Caramel"],
        note: "Toraja's more accessible dark chocolate sweetness — less pungent than Sumatra, with a rustic caramel note — makes it a prized espresso blend component. Genuine Origin describes their Sulawesi Toraja G1 as 'dark chocolate and brown sugar with a syrupy mouthfeel,' the more refined face of Indonesian wet-hulled coffee.",
      },
      {
        tags: ["🪵 Cedar", "🌰 Cocoa Nib"],
        note: "A cedar and cocoa-nib nuttiness from the S795 cultivar grown at Toarco — one of Indonesia's few estate-managed wet-hull operations. The consistency of estate processing produces a cleaner nut character than most smallholder Sulawesi lots.",
      },
      {
        tags: ["🌶️ Black Pepper", "🍂 Tobacco"],
        note: "Black pepper and pipe tobacco spice — more restrained than Indian Monsoon or Yemeni but adding savory complexity to the dominant earth-and-chocolate profile. Sweet Maria's describes this as 'a tobacco and dark fruit interplay unique to Toraja' that sets it apart from Sumatran lots.",
      },
      {
        tags: ["🌍 Forest Floor", "🪵 Mulch", "🍄 Damp Earth"],
        note: "Sulawesi's earthy profile is notable but gentler than Sumatran — the Giling Basah process is applied somewhat earlier here, producing less of Sumatra's extreme peat/mold depth and more of a forest-floor and damp mulch character with better definition.",
      },
    ],
  },
  {
    name: "Bolivian",
    region: "South America",
    scores: [7, 6, 8, 4, 2, 1],
    note: "Crisp Apple · Orange Blossom · Honey Caramel",
    roast: "Light",
    process: "Washed",
    brewMethods: ["Pour Over", "Chemex", "AeroPress", "Cold Brew"],
    cultivars: ["Typica", "Caturra", "Catuaí"],
    highlights: [
      {
        tags: ["🍎 Crisp Apple", "🍊 Blood Orange", "🍑 White Peach"],
        note: "Bolivia's Yungas region — particularly Caranavi farms at 1,800–2,400 MASL, among the world's highest-grown coffees — produces a clean, precise stone-fruit brightness. The extreme altitude forces slow cherry development, concentrating sugars into white peach and blood orange clarity. Cup of Excellence Bolivia lots regularly earn 88–93 points with notes of 'apple, peach, and citrus.'",
      },
      {
        tags: ["🌸 Orange Blossom", "🌸 Jasmine", "🌿 Chamomile"],
        note: "Bolivian Typica and Caturra at altitude develop delicate florals — orange blossom and jasmine in the cup, chamomile in the aroma. Bolivia's remoteness (no paved roads to many Caranavi farms) keeps it off most commercial radars, making it specialty coffee's best-kept secret and one of the most rewarding origins to discover.",
      },
      {
        tags: ["🍯 Honey", "🍮 Caramel", "🟤 Brown Sugar"],
        note: "Exceptional sugar development from the extreme altitude and careful hand-picking (farm sizes average under 3 hectares) produces a sweetness that grows richer as the cup cools. Sweet Maria's consistently praises Bolivian washed lots for 'honey and caramel that intensify with cooling — a sign of dense, well-developed cherry sugars.'",
      },
      {
        tags: ["🌰 Almond", "🍫 Light Cocoa"],
        note: "A gentle almond and light cocoa undertone from Typica genetics — delicate enough to support rather than dominate the fruit and floral foundation. Present as a clean finish without the bold nut character of Brazilian or Guatemalan.",
      },
      null,
      null,
    ],
  },
  {
    name: "Salvadoran Pacamara",
    region: "Central America",
    scores: [7, 6, 8, 4, 2, 1],
    note: "Red Cherry · Floral Nougat · Brown Sugar",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "AeroPress", "Chemex", "Espresso"],
    cultivars: ["Pacamara"],
    highlights: [
      {
        tags: ["🍒 Red Cherry", "🍑 Peach", "🍊 Mandarin"],
        note: "Pacamara — a cross between Pacas and the giant-beaned Maragogipe, developed by El Salvador's coffee institute in 1958 — produces oversized beans that develop unusually expressive red cherry and tropical fruit clarity. Apaneca-Ilamatepec farms at 1,200–1,800 MASL in volcanic soil concentrate this into mandarin and peach notes; Cup of Excellence El Salvador lots regularly score 91–95.",
      },
      {
        tags: ["🌸 Jasmine", "🌸 Magnolia"],
        note: "The large Pacamara bean develops a notable jasmine and magnolia floral note at light roast — more pronounced than other Central American origins and considered one of Pacamara's signature varietal characteristics. This distinguishes Salvadoran specialty lots from the cleaner-but-quieter profiles of Honduras and Guatemala.",
      },
      {
        tags: ["🟤 Brown Sugar", "🍮 Nougat", "🍯 Honey"],
        note: "Pacamara's oversized bean structure concentrates sweetness in a way no other Central American varietal matches — brown sugar, nougat, and an almost chewy honey body. This is El Salvador's calling card in specialty coffee, and the reason Pacamara commands premium prices despite the country's limited total production.",
      },
      {
        tags: ["🌰 Almond", "🍫 Milk Chocolate"],
        note: "A light almond and milk chocolate finish from the Maragogipe parent's genetics — understated enough to let the fruit and sugar shine, but persistent through the finish as the cup cools.",
      },
      null,
      null,
    ],
  },
  {
    name: "Congolese Kivu",
    region: "Central Africa",
    scores: [7, 4, 6, 3, 2, 4],
    note: "Dark Cherry · Sweet Orange · Milk Chocolate",
    roast: "Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "French Press", "Drip", "AeroPress"],
    cultivars: ["Bourbon", "Jackson", "Typica"],
    highlights: [
      {
        tags: ["🍒 Dark Cherry", "🍊 Sweet Orange", "🍇 Blackcurrant"],
        note: "North and South Kivu provinces — on the volcanic shores of Lake Kivu at 1,460–2,000 MASL — produce coffees with a distinct dark cherry and sweet orange profile. The SOPACDI cooperative (Solidarité Paysanne pour la Promotion des Actions Café et Thé) has produced traceable washed lots earning 85–90 Coffee Review scores — remarkable given the logistical challenges of exporting from eastern DRC.",
      },
      null,
      {
        tags: ["🍫 Milk Chocolate", "🍯 Orange Honey", "🟤 Brown Sugar"],
        note: "Kivu's washed lots develop a solid milk chocolate and honey sweetness from high-altitude slow ripening on mineral-rich volcanic soil. The profile sits between Rwandan brightness and Congolese body — Virunga Coffee describes their Kivu lots as 'a fruit-forward African profile grounded by chocolate depth unlike its East African neighbors.'",
      },
      null,
      null,
      {
        tags: ["🌍 Volcanic Mineral", "🪵 Light Forest Floor"],
        note: "A mild but distinctive mineral earthiness from Kivu's dense highland forests — enough to add terroir character without the aggressive tobacco/peat of Indonesian origins. The volcanic basalt soils around Lake Kivu contribute a subtle mineral quality found in no other African origin.",
      },
    ],
  },
  {
    name: "St. Helena",
    region: "South Atlantic Island",
    scores: [6, 6, 7, 4, 2, 2],
    note: "Citrus Zest · Caramel · Chamomile",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "Chemex", "AeroPress", "French Press"],
    cultivars: ["Green Tipped Bourbon"],
    highlights: [
      {
        tags: ["🍋 Citrus Zest", "🍊 Blood Orange", "🍑 Apricot"],
        note: "St. Helena's Green Tipped Bourbon — descended directly from Yemeni coffee stock planted on this remote South Atlantic island in 1733 — produces a clean, citrus-bright cup. The island's constant trade winds and volcanic soil create a microclimate found nowhere else. The East India Company, which manages much of the island's ~25-acre coffee crop, describes it as 'bright citrus, stone fruit, silky body with remarkable balance.'",
      },
      {
        tags: ["🌿 Chamomile", "🌸 Dried Rose", "🌿 Sweet Herb"],
        note: "A delicate herbal-floral quality unique to the St. Helena Green Tipped Bourbon — chamomile, dried rose, and sweet herbs that reflect this varietal's undiluted Yemeni ancestry. No modern varietals have been introduced since 1733, making St. Helena one of the last 'living heirlooms' in all of specialty coffee. Napoleon Bonaparte, exiled here from 1815 until his death in 1821, reportedly requested this coffee daily.",
      },
      {
        tags: ["🍮 Caramel", "🟤 Brown Sugar", "🍫 Milk Chocolate"],
        note: "A clean, well-developed caramel sweetness from meticulous small-batch processing — the entire island produces fewer than 1,000 bags per year. This tiny scale forces careful hand-picking and individual lot attention that results in a remarkably consistent sweetness and one of the rarest cups in specialty coffee.",
      },
      {
        tags: ["🌰 Walnut", "🍫 Cocoa"],
        note: "A light walnut and cocoa note from the centuries-old Green Tipped Bourbon varietal — unmodified since the 18th century and grown in complete isolation. The nut character adds structure to what is otherwise a delicate, floral-bright profile.",
      },
      null,
      null,
    ],
  },
  {
    name: "Ugandan",
    region: "East Africa",
    scores: [7, 4, 6, 4, 3, 5],
    note: "Dark Chocolate · Black Plum · Cedar",
    roast: "Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "French Press", "Espresso", "Drip"],
    cultivars: ["SL14", "SL28", "Bourbon", "Robusta"],
    highlights: [
      {
        tags: ["🍒 Black Plum", "🍇 Dark Berry", "🍊 Blood Orange"],
        note: "Mt. Elgon and Rwenzori Mountains washed lots (1,500–2,100 MASL, volcanic soil) produce a dark plum and blood orange fruit character that is more restrained than Kenyan but with genuine depth. Genuine Origin describes their Uganda Sipi Falls as 'blackberry, dark chocolate, and stone fruit with a syrupy body' — a profile built on richness rather than brightness.",
      },
      null,
      {
        tags: ["🍫 Dark Chocolate", "🟤 Brown Sugar", "🍮 Caramel"],
        note: "Uganda's SL14 and SL28 varietals — the same Scott Lab selections that define Kenyan excellence — produce a consistent dark chocolate and brown sugar sweetness at medium roast. The heavy volcanic soil of Mt. Elgon's slopes concentrates sweetness in a way that supports espresso blending as well as single-origin pour over.",
      },
      {
        tags: ["🪵 Cedar", "🍫 Cocoa"],
        note: "A woody cedar and cocoa character in the finish — more earthy than Kenyan but less extreme than Indonesian origins. This sets Ugandan washed lots apart from its East African neighbors, adding structural depth to the fruit-and-chocolate foundation.",
      },
      null,
      {
        tags: ["🌍 Volcanic Earth", "🪵 Forest Floor"],
        note: "A mild but present earthy depth from Uganda's dense highland growing conditions along the Rwenzori range — sometimes called the 'Mountains of the Moon.' The terroir adds character without the heavy tobacco or peat notes of Indonesian origins.",
      },
    ],
  },
  {
    name: "Nicaraguan",
    region: "Central America",
    scores: [5, 4, 8, 6, 2, 2],
    note: "Milk Chocolate · Brown Sugar · Mild Cherry",
    roast: "Light–Medium",
    process: "Washed",
    brewMethods: ["Pour Over", "Espresso", "French Press", "Drip"],
    cultivars: ["Caturra", "Bourbon", "Maracaturra", "Catuaí"],
    highlights: [
      {
        tags: ["🍒 Mild Cherry", "🍑 Peach", "🍊 Tangerine"],
        note: "Jinotega and Matagalpa — Nicaragua's two premier coffee regions (1,100–1,700 MASL, volcanic soil) — produce a clean, mild fruit character: red cherry and peach with gentle tangerine brightness. Cup of Excellence Nicaragua lots from Jinotega consistently score 88–93 with notes of 'red fruit and light citrus zest over a chocolate base.'",
      },
      {
        tags: ["🌸 Jasmine", "🌿 Light Floral"],
        note: "A subtle jasmine and light floral note from high-altitude Jinotega Caturra and Bourbon — more restrained than Rwandan or Colombian florals but present enough to lift the cup above a purely chocolate-nutty profile.",
      },
      {
        tags: ["🍫 Milk Chocolate", "🟤 Brown Sugar", "🍯 Honey"],
        note: "Nicaragua's calling card is approachable, consistent sweetness — milk chocolate, brown sugar, and a honey finish that makes it one of the most food-friendly coffees in the specialty world. The Segovia and Nueva Segovia regions at higher altitude add a cleaner sweetness to the traditional Nicaraguan profile.",
      },
      {
        tags: ["🌰 Walnut", "🥜 Almond", "🍫 Cocoa Powder"],
        note: "A solid walnut and almond nuttiness from Caturra, Bourbon, and the locally-developed Maracaturra varietal — more prominent than Honduran or Costa Rican nut notes, making Nicaraguan an especially versatile espresso component.",
      },
      null,
      null,
    ],
  },
  {
    name: "Ecuadorian",
    region: "South America",
    scores: [7, 5, 8, 3, 2, 1],
    note: "Tropical Fruit · Honey · Orange Blossom",
    roast: "Light",
    process: "Washed",
    brewMethods: ["Pour Over", "Chemex", "AeroPress", "Cold Brew"],
    cultivars: ["Typica", "Caturra", "Bourbon"],
    highlights: [
      {
        tags: ["🍍 Tropical Fruit", "🍊 Orange", "🍑 Yellow Peach"],
        note: "Ecuador's Loja and Zamora Chinchipe provinces (1,600–2,200 MASL, Andean volcanic foothills) produce a distinctly sweet, juicy tropical fruit profile unlike any other South American origin. The Green Coffee Collective describes their Ecuador Loja lots as 'jam-like tropical sweetness — pineapple, orange, and peach that set it apart from cleaner Colombian or Bolivian profiles.'",
      },
      {
        tags: ["🌸 Orange Blossom", "🌸 Jasmine"],
        note: "A notable orange blossom and jasmine floral note from Ecuador's high-altitude Typica and Caturra — more fragrant than Colombian or Peruvian equivalents. Ecuador's western Andes microclimate, influenced by both Pacific moisture and Andean altitude, creates a floral expressiveness rare in South American washed coffees.",
      },
      {
        tags: ["🍯 Honey", "🍮 Brown Sugar", "🌾 Cane Sugar"],
        note: "A rich, honey-forward sweetness that intensifies as the cup cools — the signature of Ecuador's extreme diurnal temperature swings concentrating sugars in the cherry. Happy Mug and Green Coffee Collective both note Ecuador as 'a sweet, crowd-pleasing origin that surprises most people who expect it to taste like Colombia.'",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Flores",
    region: "Indonesia",
    scores: [4, 3, 7, 4, 3, 6],
    note: "Milk Chocolate · Dark Berry · Cedar",
    roast: "Medium",
    process: "Wet-Hulled",
    brewMethods: ["French Press", "Drip", "Espresso", "Pour Over"],
    cultivars: ["Typica", "Catimor"],
    highlights: [
      {
        tags: ["🍒 Dark Berry", "🍑 Dried Stone Fruit", "🍷 Wine-like"],
        note: "Flores — the 'Island of Flowers' east of Sumbawa — produces wet-hulled coffees with more fruit presence than Sumatran lots and a wine-like berry note absent from Sulawesi Toraja. The Bajawa and Manggarai highlands (1,200–1,800 MASL) grow Typica-descendant varietals that retain more cherry character through the Giling Basah process.",
      },
      null,
      {
        tags: ["🍫 Milk Chocolate", "🍮 Rustic Caramel", "🟤 Brown Sugar"],
        note: "The most accessible sweetness of the Indonesian wet-hulled origins — a smooth milk chocolate and rustic caramel profile that makes Flores an approachable entry point into Indonesian coffee. Sweet Maria's describes Bajawa Flores as 'milk chocolate and brown sugar with a clean earthiness — less aggressive than Sumatra, more elegant than most Sulawesi.'",
      },
      {
        tags: ["🪵 Cedar", "🌰 Cocoa Nib"],
        note: "A cedar and cocoa nib nuttiness from Flores' volcanic basalt soils and traditional Typica genetics — lighter and more defined than the heavy woody notes of Sumatran wet-hull, reflecting Flores' gentler processing conditions.",
      },
      {
        tags: ["🌶️ Black Pepper", "🍂 Clove"],
        note: "A restrained spice note — black pepper and clove — that adds complexity without the intensity of Sumatran or Yemeni spice. Present in the finish as the cup cools.",
      },
      {
        tags: ["🌍 Forest Floor", "🪵 Damp Earth"],
        note: "A moderate earthy depth from Flores' wet-hull processing — less extreme than Sumatra's peat-and-tobacco depth but enough to ground the chocolate and fruit in genuine Indonesian terroir. Flores sits between Sulawesi's accessibility and Sumatra's intensity.",
      },
    ],
  },
  {
    name: "Myanmar",
    region: "Southeast Asia",
    scores: [7, 6, 7, 3, 2, 2],
    note: "Peach · Jasmine · Honey",
    roast: "Light–Medium",
    process: "Natural",
    brewMethods: ["Pour Over", "AeroPress", "Chemex", "Cold Brew"],
    cultivars: ["Typica", "Bourbon", "Catuaí", "Catimor"],
    highlights: [
      {
        tags: ["🍑 Peach", "🍒 Red Cherry", "🍊 Mandarin"],
        note: "Myanmar's Pyin Oo Lwin highlands — known as the 'City of Eternal Spring' at 1,070 MASL with cooler temperatures than most SE Asian origins — produce a clean, fruit-forward natural with peach and mandarin clarity. Sweet Maria's calls Myanmar naturals 'a revelation for SE Asian coffee — fruit-forward in a way Vietnam and Laos naturals rarely achieve.' The specialty coffee industry only gained a foothold here post-2015.",
      },
      {
        tags: ["🌸 Jasmine", "🌿 Chamomile"],
        note: "A notable jasmine and chamomile floral character from Myanmar's locally-adapted Typica and Bourbon varietals — completely unexpected for a Southeast Asian origin and more reminiscent of Ethiopian or Bolivian profiles. This is Myanmar's most distinctive characteristic and what is driving rapid interest from specialty importers.",
      },
      {
        tags: ["🍯 Honey", "🟤 Brown Sugar", "🍮 Caramel"],
        note: "Natural-processed Myanmar lots develop a honey and brown sugar sweetness from slow drying in the cooler Pyin Oo Lwin climate — less wild than Ethiopian naturals but with genuine depth. Green Coffee Collective notes Myanmar naturals as 'a gentle, approachable natural without the ferment complexity that intimidates some drinkers.'",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Filipino Barako",
    region: "Southeast Asia",
    scores: [5, 6, 4, 5, 7, 8],
    note: "Jackfruit · Smoky Dark Chocolate · Dark Floral",
    roast: "Medium–Dark",
    process: "Natural",
    brewMethods: ["French Press", "Moka Pot", "Espresso", "Phin Filter"],
    cultivars: ["Liberica"],
    highlights: [
      {
        tags: ["🍈 Jackfruit", "🍊 Bitter Orange", "🍇 Dark Berry"],
        note: "Filipino Barako (Coffea liberica var. liberica) is not Arabica — it's a separate species grown in Batangas and Cavite provinces. Its signature jackfruit and bitter orange notes have no analogue in any Arabica or Robusta origin. Bo's Coffee describes the aroma as 'bold and pungent, with a distinctive jackfruit character that announces itself immediately.' The large, asymmetric Liberica beans produce a cup that is genuinely unlike anything else on this site.",
      },
      {
        tags: ["💐 Dark Floral", "🌹 Dried Rose", "🪵 Woody Incense"],
        note: "Barako's floral character is smoky and dark — dried rose, incense, and wood smoke rather than the bright jasmine or orange blossom of Arabica. This is a defining Liberica trait: aromatics that bloom intensely but carry an earthy, resinous quality. The word 'Barako' derives from the Tagalog for 'wild boar' — a fitting description for a coffee this bold and untamed.",
      },
      {
        tags: ["🍫 Bittersweet Chocolate", "🍮 Dark Sugar"],
        note: "A bold, bittersweet sweetness beneath the jackfruit character — dark sugar and bittersweet chocolate that pair with the unusual fruit notes. Barako was the dominant coffee in the Philippines during its golden age as the world's 4th-largest producer in the 1880s; a coffee rust outbreak in the 1890s nearly wiped it out, and it survives today as a beloved cultural icon in Batangas province.",
      },
      {
        tags: ["🥜 Roasted Peanut", "🍫 Dark Cocoa"],
        note: "A bold roasted-peanut and dark cocoa nuttiness from the Liberica species' dense bean structure — heavier and more assertive than any Arabica nutty note. This character holds up under sweetened condensed milk, which is how Barako has been traditionally drunk for generations.",
      },
      {
        tags: ["🌶️ Black Pepper", "🪵 Resinous Wood", "🍂 Clove"],
        note: "A bold spice profile — black pepper, resinous wood, and clove — that's more intense than most Arabica origins. The Liberica species carries a naturally peppery character amplified by the natural process and medium-dark roast traditional in Batangas.",
      },
      {
        tags: ["🪵 Smoky Wood", "🌍 Dense Earth", "🍄 Mushroom"],
        note: "Barako's earthy profile is deep and resinous — smoky wood, dense earth, and a faint mushroom note unique to the Liberica species' cellular structure. It is the most unusual earthy character on this site, and arguably in all commercially available coffee. The Teofilo Coffee Company calls it 'a terroir experience unlike any Arabica — raw, bold, and irreplaceable.'",
      },
    ],
  },
];
