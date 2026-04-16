export const coffees = [
  {
    name: "Ethiopian",
    region: "East Africa",
    scores: [9, 8, 7, 3, 3, 2],
    note: "Blueberry · Jasmine · Citrus",
    roast: "Light",
    brewMethods: ["Pour Over", "AeroPress", "Cold Brew"],
    highlights: [
      {
        tags: ["🫐 Blueberry", "🍋 Citrus", "🍑 Stone Fruit"],
        note: "Ethiopian naturals are renowned for intense berry and citrus brightness.",
      },
      {
        tags: ["🌸 Jasmine", "🌿 Bergamot", "🌹 Rose"],
        note: "Washed Yirgacheffe is prized for delicate floral aromatics.",
      },
      {
        tags: ["🍯 Honey", "🍮 Caramel", "🟤 Brown Sugar"],
        note: "Natural sweetness balanced by bright acidity.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Colombian",
    region: "South America",
    scores: [6, 4, 8, 6, 3, 3],
    note: "Caramel · Red Fruit · Walnut",
    roast: "Medium",
    brewMethods: ["Pour Over", "Drip", "Espresso", "French Press"],
    highlights: [
      {
        tags: ["🍒 Red Cherry", "🍎 Apple", "🍊 Tangerine"],
        note: "Colombian coffees show bright, clean fruit notes with a pleasant tartness.",
      },
      null,
      {
        tags: ["🍮 Caramel", "🍬 Toffee", "🟤 Brown Sugar"],
        note: "High sweetness and medium body make Colombian a crowd-pleasing classic.",
      },
      {
        tags: ["🌰 Walnut", "🥜 Hazelnut"],
        note: "Mild nutty undertones add depth without overpowering the cup.",
      },
      null,
      null,
    ],
  },
  {
    name: "Kenyan",
    region: "East Africa",
    scores: [8, 5, 6, 3, 4, 2],
    note: "Blackcurrant · Tomato · Wine",
    roast: "Light–Medium",
    brewMethods: ["Pour Over", "AeroPress", "Chemex"],
    highlights: [
      {
        tags: ["🍇 Blackcurrant", "🍅 Tomato", "🍓 Berry"],
        note: "Kenya AA is famous for its vivid, wine-like fruit acidity and bold berry character.",
      },
      {
        tags: ["🌸 Floral", "🌿 Herbal"],
        note: "Subtle floral hints complement the dominant fruity profile.",
      },
      {
        tags: ["🍷 Wine-like", "🍬 Light Caramel"],
        note: "Balanced sweetness underpins the complex, layered cup.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Sumatran",
    region: "Indonesia",
    scores: [3, 2, 4, 6, 5, 9],
    note: "Cedar · Dark Chocolate · Tobacco",
    roast: "Medium–Dark",
    brewMethods: ["French Press", "Espresso", "Moka Pot"],
    highlights: [
      null,
      null,
      null,
      {
        tags: ["🍫 Dark Chocolate", "🌰 Cedar"],
        note: "Wet-hulled processing imparts a distinctive woody, chocolaty depth.",
      },
      {
        tags: ["🌶️ Pepper", "🍂 Clove"],
        note: "Spicy undertones add warmth to the heavy, full-bodied cup.",
      },
      {
        tags: ["🪵 Cedar", "🍂 Tobacco", "🌍 Forest Floor"],
        note: "Sumatra's earthy, musty character is unlike any other origin in the world.",
      },
    ],
  },
  {
    name: "Brazilian",
    region: "South America",
    scores: [3, 2, 7, 8, 4, 5],
    note: "Chocolate · Hazelnut · Brown Sugar",
    roast: "Medium–Dark",
    brewMethods: ["Espresso", "French Press", "Moka Pot"],
    highlights: [
      null,
      null,
      {
        tags: ["🟤 Brown Sugar", "🍫 Milk Chocolate", "🍮 Caramel"],
        note: "Brazil's natural processing yields a reliably sweet, dessert-like cup.",
      },
      {
        tags: ["🌰 Hazelnut", "🥜 Peanut", "🍫 Cocoa"],
        note: "Rich nut and chocolate notes define the classic Brazilian espresso profile.",
      },
      {
        tags: ["🌶️ Mild Spice"],
        note: "A gentle spicy warmth lingers in the finish.",
      },
      {
        tags: ["🌍 Low Earthy"],
        note: "Mild earthiness contributes to a smooth, grounded body.",
      },
    ],
  },
  {
    name: "Guatemalan",
    region: "Central America",
    scores: [5, 3, 7, 7, 5, 4],
    note: "Dark Cocoa · Apple · Toffee",
    roast: "Medium",
    brewMethods: ["Pour Over", "French Press", "Espresso"],
    highlights: [
      {
        tags: ["🍎 Apple", "🍑 Peach"],
        note: "High-altitude Guatemalan coffees show bright, clean orchard fruit notes.",
      },
      null,
      {
        tags: ["🍮 Toffee", "🍬 Brown Sugar", "🍫 Cocoa"],
        note: "Rich sweetness with a smooth, full-bodied mouthfeel.",
      },
      {
        tags: ["🍫 Dark Cocoa", "🌰 Almond"],
        note: "Distinctive cocoa and nut character typical of Antigua and Huehuetenango regions.",
      },
      {
        tags: ["🌶️ Mild Pepper", "🌿 Herbal"],
        note: "Subtle spicy finish adds complexity to the well-balanced profile.",
      },
      null,
    ],
  },
  {
    name: "Costa Rican",
    region: "Central America",
    scores: [6, 4, 8, 5, 3, 2],
    note: "Honey · Peach · Mild Citrus",
    roast: "Light–Medium",
    brewMethods: ["Pour Over", "AeroPress", "Drip"],
    highlights: [
      {
        tags: ["🍑 Peach", "🍊 Mild Citrus", "🍒 Cherry"],
        note: "Costa Rican honey-processed coffees deliver clean, bright fruit character.",
      },
      null,
      {
        tags: ["🍯 Honey", "🍮 Caramel", "🌾 Vanilla"],
        note: "Honey processing creates exceptional sweetness and silky mouthfeel.",
      },
      {
        tags: ["🌰 Light Nut"],
        note: "A gentle nutty undertone rounds out the sweet, clean cup.",
      },
      null,
      null,
    ],
  },
  {
    name: "Yemeni",
    region: "Middle East",
    scores: [5, 4, 6, 4, 7, 6],
    note: "Cardamom · Wine · Dried Fruit",
    roast: "Medium",
    brewMethods: ["Ibrik / Turkish", "French Press", "AeroPress"],
    highlights: [
      {
        tags: ["🍇 Dried Grape", "🫐 Fig", "🍒 Cherry"],
        note: "Ancient dry-processed Yemeni coffees yield complex dried fruit character.",
      },
      null,
      {
        tags: ["🍷 Wine", "🍮 Tamarind", "🍯 Honey"],
        note: "Fermented sweetness mirrors fine wine in complexity and depth.",
      },
      null,
      {
        tags: ["🌿 Cardamom", "🌶️ Pepper", "🍂 Cinnamon"],
        note: "Yemeni coffee is synonymous with aromatic spice, echoing traditional Arabic coffee culture.",
      },
      {
        tags: ["🪵 Wood", "🌍 Terroir"],
        note: "Ancient heirloom varieties grown in mountain terraces deliver unmistakable earthy depth.",
      },
    ],
  },
  {
    name: "Jamaican Blue",
    region: "Caribbean",
    scores: [4, 3, 7, 7, 3, 3],
    note: "Mild · Sweet · Velvety Clean",
    roast: "Light–Medium",
    brewMethods: ["Pour Over", "Drip", "French Press"],
    highlights: [
      null,
      null,
      {
        tags: ["🍮 Mild Caramel", "🌾 Cream", "🍬 Light Sweet"],
        note: "Jamaica Blue Mountain is celebrated for its gentle sweetness and clean, balanced finish.",
      },
      {
        tags: ["🌰 Mild Nut", "🍫 Cocoa"],
        note: "Subtle nutty and cocoa notes complement the velvety, low-acid profile.",
      },
      null,
      null,
    ],
  },
  {
    name: "Hawaiian Kona",
    region: "Pacific",
    scores: [5, 5, 7, 6, 3, 2],
    note: "Macadamia · Floral · Sweet",
    roast: "Light–Medium",
    brewMethods: ["Pour Over", "Drip", "AeroPress"],
    highlights: [
      {
        tags: ["🍑 Peach", "🍊 Light Citrus"],
        note: "Kona's volcanic soil contributes a subtle, clean fruitiness to the cup.",
      },
      {
        tags: ["🌸 Floral", "🌿 Herbal"],
        note: "Delicate floral aromas distinguish Kona from other Pacific origins.",
      },
      {
        tags: ["🍮 Caramel", "🍯 Honey", "🍬 Soft Sweet"],
        note: "Medium sweetness and silky body make Kona approachable and refined.",
      },
      {
        tags: ["🌰 Macadamia", "🥜 Butter Nut"],
        note: "Kona's signature macadamia-like nuttiness is a beloved hallmark of Hawaiian coffee.",
      },
      null,
      null,
    ],
  },
  {
    name: "Vietnamese",
    region: "Southeast Asia",
    scores: [2, 1, 5, 7, 4, 8],
    note: "Dark Roast · Earthy · Robusta Bold",
    roast: "Dark",
    brewMethods: ["Phin Filter", "Espresso", "Cold Brew"],
    highlights: [
      null,
      null,
      {
        tags: ["🍫 Dark Chocolate", "🌾 Roasted Grain"],
        note: "Robusta beans roasted dark bring a bold, bitter sweetness typical of Vietnamese phin coffee.",
      },
      {
        tags: ["🌰 Woody Nut", "🍫 Cocoa"],
        note: "Heavy body and nutty cocoa notes suit the strong, condensed-milk style of preparation.",
      },
      null,
      {
        tags: ["🌍 Rubber", "🪵 Musty Wood", "🌿 Loam"],
        note: "Vietnamese Robusta carries a pronounced earthy, forest-floor character unique to the region.",
      },
    ],
  },
  {
    name: "Peruvian",
    region: "South America",
    scores: [5, 5, 7, 6, 3, 3],
    note: "Citrus · Mild Floral · Caramel",
    roast: "Light–Medium",
    brewMethods: ["Pour Over", "Drip", "AeroPress"],
    highlights: [
      {
        tags: ["🍋 Citrus", "🍑 Peach", "🍒 Mild Cherry"],
        note: "High-altitude Peruvian beans show clean, bright fruit with gentle acidity.",
      },
      {
        tags: ["🌸 Mild Floral", "🌿 Herbal"],
        note: "Subtle floral notes add elegance to the balanced, approachable cup.",
      },
      {
        tags: ["🍮 Caramel", "🍬 Toffee", "🍯 Honey"],
        note: "Consistent sweetness and smooth body make Peruvian a reliable crowd-pleaser.",
      },
      {
        tags: ["🌰 Almond", "🥜 Light Nut"],
        note: "Mild nutty undertones round out the clean, balanced finish.",
      },
      null,
      null,
    ],
  },
  {
    name: "Mexican",
    region: "North America",
    scores: [4, 3, 6, 7, 4, 4],
    note: "Chocolate · Almond · Light Body",
    roast: "Medium",
    brewMethods: ["Drip", "French Press", "Espresso"],
    highlights: [
      null,
      null,
      {
        tags: ["🍫 Milk Chocolate", "🍮 Light Caramel"],
        note: "Mexican coffees offer mild, pleasant sweetness well-suited to medium roast.",
      },
      {
        tags: ["🌰 Almond", "🥜 Pecan", "🍫 Cocoa"],
        note: "Nutty and chocolaty notes define the easygoing, accessible Mexican profile.",
      },
      {
        tags: ["🌶️ Mild Spice", "🌿 Herbal"],
        note: "A gentle herbaceous spice adds character without overpowering the light body.",
      },
      {
        tags: ["🌍 Mild Earth"],
        note: "Low but present earthy tones contribute to the round, approachable finish.",
      },
    ],
  },
  {
    name: "Rwandan",
    region: "East Africa",
    scores: [7, 6, 7, 4, 3, 2],
    note: "Peach · Floral · Caramel",
    roast: "Light–Medium",
    brewMethods: ["Pour Over", "AeroPress", "Chemex"],
    highlights: [
      {
        tags: ["🍑 Peach", "🍊 Orange", "🫐 Blackberry"],
        note: "Rwanda's fully-washed coffees deliver vivid, juicy stone fruit and berry brightness.",
      },
      {
        tags: ["🌸 Jasmine", "🌹 Rose", "🌺 Hibiscus"],
        note: "Rwandan washed lots are among the most floral in the African coffee belt.",
      },
      {
        tags: ["🍮 Caramel", "🍬 Toffee", "🟤 Brown Sugar"],
        note: "Sweet and fruit-forward balance makes Rwandan coffee approachable yet complex.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Indian Monsoon",
    region: "South Asia",
    scores: [2, 2, 5, 6, 6, 9],
    note: "Spice · Woody · Low Acid",
    roast: "Medium–Dark",
    brewMethods: ["French Press", "Moka Pot", "Espresso"],
    highlights: [
      null,
      null,
      {
        tags: ["🍫 Dark Chocolate", "🌾 Malt"],
        note: "Monsooning reduces acidity and amplifies a heavy, malty sweetness.",
      },
      {
        tags: ["🌰 Cedar", "🍫 Cocoa"],
        note: "Woody and chocolaty notes emerge from the unique monsooning process.",
      },
      {
        tags: ["🌿 Cardamom", "🍂 Clove", "🌶️ Pepper"],
        note: "Indian Monsoon Malabar is renowned for its bold spice character, evoking masala chai.",
      },
      {
        tags: ["🪵 Wet Wood", "🌍 Mushroom", "🌿 Tobacco"],
        note: "The monsoon exposure creates an unmistakably deep, musty earthiness unlike any other origin.",
      },
    ],
  },
  {
    name: "Panama Geisha",
    region: "Central America",
    scores: [7, 10, 8, 2, 2, 1],
    note: "Jasmine · Bergamot · Peach Nectar",
    roast: "Light",
    brewMethods: ["Pour Over", "Chemex", "AeroPress"],
    highlights: [
      {
        tags: ["🍑 Peach", "🍊 Mandarin", "🍇 Tropical Fruit"],
        note: "Geisha's fruit character is delicate and precise — stone fruit and citrus with tea-like clarity.",
      },
      {
        tags: ["🌸 Jasmine", "🌿 Bergamot", "🌹 Rose"],
        note: "Panama Geisha defines the ceiling of floral intensity in specialty coffee, often described as perfumed.",
      },
      {
        tags: ["🍯 Peach Nectar", "🍯 Honey", "🍬 Brown Sugar"],
        note: "Exceptional sweetness and silky body justify Geisha's reputation as the world's most celebrated cup.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Burundian",
    region: "East Africa",
    scores: [8, 6, 7, 3, 3, 2],
    note: "Blackcurrant · Rose · Honey",
    roast: "Light–Medium",
    brewMethods: ["Pour Over", "AeroPress", "Chemex"],
    highlights: [
      {
        tags: ["🍇 Blackcurrant", "🍒 Cherry", "🍊 Citrus"],
        note: "Burundian washed coffees rival Kenya for vivid berry brightness and clean, complex acidity.",
      },
      {
        tags: ["🌹 Rose", "🌸 Floral"],
        note: "Subtle but present floral character complements the dominant fruit profile.",
      },
      {
        tags: ["🍯 Honey", "🍮 Caramel", "🟤 Brown Sugar"],
        note: "Balanced sweetness and a juicy, full body give Burundian coffee wide appeal.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Tanzanian",
    region: "East Africa",
    scores: [7, 4, 6, 3, 3, 3],
    note: "Winey · Dark Plum · Black Tea",
    roast: "Light–Medium",
    brewMethods: ["Pour Over", "French Press", "Drip"],
    highlights: [
      {
        tags: ["🍷 Winey", "🫐 Dark Berry", "🍑 Plum"],
        note: "Tanzania Peaberry is prized for its intense wine-like fruitiness and deep berry complexity.",
      },
      null,
      {
        tags: ["🍵 Black Tea", "🟤 Brown Sugar"],
        note: "A distinctive tea-like quality and mild sweetness give Tanzanian coffee an elegant, clean finish.",
      },
      null,
      null,
      null,
    ],
  },
  {
    name: "Honduran",
    region: "Central America",
    scores: [5, 3, 7, 6, 3, 3],
    note: "Caramel · Peach · Almond",
    roast: "Medium",
    brewMethods: ["Pour Over", "Drip", "Espresso"],
    highlights: [
      {
        tags: ["🍑 Peach", "🍊 Mild Citrus"],
        note: "High-altitude Honduran farms produce clean, fruit-forward cups with bright but gentle acidity.",
      },
      null,
      {
        tags: ["🍮 Caramel", "🍯 Honey", "🟤 Brown Sugar"],
        note: "Honduras is Central America's largest producer, known for consistently sweet, balanced cups.",
      },
      {
        tags: ["🌰 Almond", "🥜 Mild Nut"],
        note: "Understated nuttiness rounds out the accessible, crowd-pleasing Honduran profile.",
      },
      null,
      null,
    ],
  },
  {
    name: "Papua New Guinea",
    region: "Pacific",
    scores: [6, 3, 5, 5, 4, 7],
    note: "Tropical Fruit · Earthy · Brown Sugar",
    roast: "Medium",
    brewMethods: ["French Press", "Pour Over", "Espresso"],
    highlights: [
      {
        tags: ["🍍 Tropical Fruit", "🫐 Wild Berry"],
        note: "PNG coffees are unpredictably fruity — grown on smallholder plots with wild, funky character.",
      },
      null,
      {
        tags: ["🟤 Brown Sugar", "🍮 Mild Caramel"],
        note: "Moderate sweetness with a heavy, syrupy body typical of Pacific island origins.",
      },
      {
        tags: ["🌰 Mild Nut", "🍫 Cocoa"],
        note: "Cocoa and nut undertones ground the wilder fruit and earthy notes in the cup.",
      },
      null,
      {
        tags: ["🌍 Forest Floor", "🪵 Damp Wood", "🍄 Mushroom"],
        note: "PNG's wet-hulled processing and humid growing conditions produce a distinctly earthy, wild terroir.",
      },
    ],
  },
];
